import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  FITMEET_CREDENTIAL_REF,
  FITMEET_MCP_URL,
  FITMEET_SCOPES,
  FITMEET_SERVER_NAME,
  resolveConfig,
  registerFitMeetSkill,
  stripSkillFrontmatter,
} from '../src/index.js'
import type { Context } from '@deepseek-ai/cordis'

const root = fileURLToPath(new URL('../', import.meta.url))

function validConfig() {
  return {
    serverName: FITMEET_SERVER_NAME,
    url: FITMEET_MCP_URL,
    credentialRef: FITMEET_CREDENTIAL_REF,
    scope: FITMEET_SCOPES,
  }
}

describe('FitMeet plugin configuration', () => {
  it('resolves the production endpoint and per-user OAuth credential reference', () => {
    expect(resolveConfig(validConfig())).toMatchObject({
      serverName: 'fitmeet',
      url: FITMEET_MCP_URL,
      credentialRef: FITMEET_CREDENTIAL_REF,
      scope: FITMEET_SCOPES,
      headers: {},
      callbackPort: 0,
    })
  })

  it('rejects endpoint, scope, credential, and Authorization header overrides', () => {
    expect(() => resolveConfig({ ...validConfig(), url: 'https://example.com/mcp' })).toThrow('FitMeet MCP endpoint')
    expect(() => resolveConfig({ ...validConfig(), scope: 'admin:write' })).toThrow('subset')
    expect(() => resolveConfig({ ...validConfig(), credentialRef: 'OTHER_CREDENTIAL' })).toThrow('credentialRef must be')
    expect(() => resolveConfig({ ...validConfig(), headers: { Authorization: 'Bearer secret' } })).toThrow('owned by OAuth')
  })

  it('accepts legacy grants and least-privilege social scopes without broadening them', () => {
    expect(resolveConfig({ ...validConfig(), scope: 'social:read' }).scope).toBe('social:read')
    expect(resolveConfig({ ...validConfig(), scope: ' people:search  profile:read ' }).scope).toBe('profile:read people:search')
    const legacy = FITMEET_SCOPES.replace(' social:read', '')
    expect(resolveConfig({ ...validConfig(), scope: legacy }).scope).toBe(legacy)
    expect(resolveConfig({ serverName: 'fitmeet', url: FITMEET_MCP_URL }).scope).toBe(FITMEET_SCOPES)
    for (const scope of ['', ' ', 'social:write', 'profile:read profile:read']) {
      expect(() => resolveConfig({ ...validConfig(), scope })).toThrow('subset')
    }
  })

  it('keeps runtime scopes, public manifest and install bundle aligned', async () => {
    const service = JSON.parse(await readFile(`${root}/service.json`, 'utf8'))
    expect(FITMEET_SCOPES.split(' ').sort()).toEqual(service.authentication.optionalScopes.sort())
    const patch = await readFile(`${root}/cordis.patch.yml`, 'utf8')
    expect(patch).toContain(`scope: '${FITMEET_SCOPES}'`)
    const manifest = JSON.parse(await readFile(`${root}/package.json`, 'utf8'))
    expect(manifest.files).toContain('skills/fitmeet/references/*.md')
    expect(manifest.files).toContain('service.json')
  })

  it('ships a DSH bundle without install-time lifecycle scripts', async () => {
    const manifest = JSON.parse(await readFile(`${root}/package.json`, 'utf8')) as {
      name: string
      main: string
      scripts: Record<string, string>
      dsh: { bundle: { patch: string } }
    }
    const patch = await readFile(`${root}/cordis.patch.yml`, 'utf8')

    expect(manifest.name).toBe('fitmeet-dsh-plugin')
    expect(manifest.main).toBe('lib/index.js')
    expect(manifest.dsh.bundle.patch).toBe('./cordis.patch.yml')
    expect(manifest.scripts).not.toHaveProperty('prepare')
    expect(manifest.scripts).not.toHaveProperty('postinstall')
    expect(patch).toContain('name: fitmeet-dsh-plugin')
    expect(patch).toContain(`url: ${FITMEET_MCP_URL}`)
    expect(patch).not.toContain('Authorization:')
  })

  it('registers the Skill body separately from its package metadata', async () => {
    const markdown = await readFile(`${root}/skills/fitmeet/SKILL.md`, 'utf8')
    const body = stripSkillFrontmatter(markdown)
    expect(markdown).toContain('name: fitmeet')
    expect(body).toMatch(/^# FitMeet/)
    expect(body).toContain('prepare → 用户明确确认 → confirm')
    expect(body).not.toContain('display_name_en:')
  })

  it('contributes an invocable FitMeet Skill to the Harness registry', async () => {
    let registered: Record<string, unknown> | undefined
    const ctx = {
      inject(_services: string[], callback: (child: unknown) => void) {
        callback({
          skills: {
            register(skill: Record<string, unknown>) {
              registered = skill
              return () => {}
            },
          },
        })
      },
    } as unknown as Context

    await registerFitMeetSkill(ctx)
    expect(registered).toMatchObject({
      name: 'fitmeet',
      source: 'bundled',
      invocation: { modelInvocable: true, userInvocable: true },
    })
    expect(String(registered?.content)).toContain('# FitMeet')
  })
})
