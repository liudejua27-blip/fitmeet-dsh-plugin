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
      expect(opened).toEqual([authorizationUrl])

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
