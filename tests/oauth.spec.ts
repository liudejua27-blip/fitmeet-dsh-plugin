import type { Context } from '@deepseek-ai/cordis'
import type { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { describe, expect, it, vi } from 'vitest'
import {
  FITMEET_CREDENTIAL_REF,
  FITMEET_MCP_URL,
  FITMEET_SCOPES,
  resolveConfig,
} from '../src/index.js'
import { createOAuthRuntime } from '../src/oauth.js'
import { credentialRef } from '../src/dsh.js'

const config = resolveConfig({
  serverName: 'fitmeet',
  url: FITMEET_MCP_URL,
  credentialRef: FITMEET_CREDENTIAL_REF,
  scope: FITMEET_SCOPES,
  authorizationTimeoutMs: 2_000,
})

describe('OAuth loopback flow', () => {
  it('rejects a forged state and exchanges a valid callback code', async () => {
    const ctx = credentialContext()

    const rejected = await createOAuthRuntime(ctx, config, async () => {})
    try {
      const state = String(await rejected.provider.state?.())
      await rejected.provider.redirectToAuthorization(new URL(`https://api.fitmeet.cn/authorize?state=${state}`))
      const callback = new URL(rejected.provider.redirectUrl!)
      callback.search = new URLSearchParams({ code: 'forged', state: 'wrong' }).toString()
      expect((await fetch(callback)).status).toBe(400)
      await expect(rejected.waitForAuthorization()).rejects.toThrow('state does not match')
    } finally {
      await rejected.dispose()
    }

    const opened: URL[] = []
    const accepted = await createOAuthRuntime(ctx, config, async url => { opened.push(url) })
    const finishAuth = vi.fn(async (_code: string) => {})
    accepted.bindTransport({ finishAuth } as unknown as StreamableHTTPClientTransport)
    try {
      const state = String(await accepted.provider.state?.())
      const authorizationUrl = new URL(`https://api.fitmeet.cn/authorize?state=${state}`)
      await accepted.provider.redirectToAuthorization(authorizationUrl)
      expect(opened[0]?.searchParams.get('state')).toBe(state)
      expect(opened[0]?.searchParams.get('scope')).toBe(FITMEET_SCOPES)

      const callback = new URL(accepted.provider.redirectUrl!)
      callback.search = new URLSearchParams({ code: 'valid-code', state }).toString()
      const wait = accepted.waitForAuthorization()
      expect((await fetch(callback)).status).toBe(200)
      await wait
      expect(finishAuth).toHaveBeenCalledWith('valid-code')
    } finally {
      await accepted.dispose()
    }
  })

  it('reuses the saved loopback port so the registered client and refresh token remain valid', async () => {
    const ctx = credentialContext()
    const first = await createOAuthRuntime(ctx, config, async () => {})
    const redirect = first.provider.redirectUrl!.toString()
    await first.provider.saveClientInformation?.({ client_id: 'fitmeet-test-client' })
    await first.provider.saveTokens({
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      token_type: 'bearer',
    })
    await first.dispose()

    const second = await createOAuthRuntime(ctx, config, async () => {})
    try {
      expect(second.provider.redirectUrl!.toString()).toBe(redirect)
      expect(await second.provider.clientInformation()).toMatchObject({ client_id: 'fitmeet-test-client' })
      expect(await second.provider.tokens()).toMatchObject({ refresh_token: 'test-refresh-token' })
    } finally {
      await second.dispose()
    }
  })

  it('does not reuse a legacy five-scope credential when the new permission is requested', async () => {
    const ctx = credentialContext()
    const legacy = { ...config, scope: FITMEET_SCOPES.replace(' social:read', '') }
    const first = await createOAuthRuntime(ctx, legacy, async () => {})
    await first.provider.saveClientInformation?.({ client_id: 'old-client' })
    await first.provider.saveTokens({ access_token: 'old-access', refresh_token: 'old-refresh', token_type: 'bearer' })
    await first.dispose()
    const stored = JSON.parse((await ctx.credentials.resolve(credentialRef(FITMEET_CREDENTIAL_REF)))!.value)
    delete stored.requestedScope // Credential written by 0.1.1.
    await ctx.credentials.set(credentialRef(FITMEET_CREDENTIAL_REF), JSON.stringify(stored))
    const next = await createOAuthRuntime(ctx, config, async () => {})
    try {
      expect(await next.provider.clientInformation()).toBeUndefined()
      expect(await next.provider.tokens()).toBeUndefined()
      await next.provider.saveClientInformation?.({ client_id: 'new-client' })
      expect(await next.provider.tokens()).toBeUndefined()
      await next.provider.saveTokens({ access_token: 'new-access', token_type: 'bearer', scope: 'people:search' })
      // A user may decline some requested scopes; don't repeatedly force consent.
      expect(await next.provider.tokens()).toMatchObject({ scope: 'people:search' })
    } finally { await next.dispose() }
  })

  it('keeps configured read-only scopes in the authorization URL despite broad discovery metadata', async () => {
    const urls: URL[] = []
    const runtime = await createOAuthRuntime(credentialContext(), { ...config, scope: 'social:read' }, async url => { urls.push(url) })
    try {
      const state = String(await runtime.provider.state?.())
      await runtime.provider.redirectToAuthorization(new URL(`https://api.fitmeet.cn/authorize?scope=${encodeURIComponent(FITMEET_SCOPES)}&state=${state}`))
      expect(urls[0]?.searchParams.get('scope')).toBe('social:read')
      expect(urls[0]?.searchParams.get('state')).toBe(state)
    } finally { await runtime.dispose() }
  })

  it('does not reuse a wider token after narrowing the configured permissions', async () => {
    const ctx = credentialContext()
    const first = await createOAuthRuntime(ctx, config, async () => {})
    await first.provider.saveClientInformation?.({ client_id: 'wide-client' })
    await first.provider.saveTokens({ access_token: 'wide-access', token_type: 'bearer' })
    await first.dispose()
    const next = await createOAuthRuntime(ctx, { ...config, scope: 'social:read' }, async () => {})
    try {
      expect(await next.provider.tokens()).toBeUndefined()
      expect(await next.provider.clientInformation()).toBeUndefined()
    } finally { await next.dispose() }
  })
})

function credentialContext(): Context {
  let value: string | undefined
  return {
    credentials: {
      async resolve() {
        return value === undefined ? undefined : { value, source: 'test' }
      },
      async set(_ref: string, next: string) {
        value = next
      },
    },
    logger: {
      info() {},
      warn() {},
      error() {},
    },
  } as unknown as Context
}
