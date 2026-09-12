/** Interactive OAuth runtime: loopback callback, browser hand-off, and state persistence. */

import { spawn } from 'node:child_process'
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { AddressInfo } from 'node:net'
import type { Context } from '@deepseek-ai/cordis'
import type { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { OAuthClientProvider, OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js'
import {
  OAuthClientInformationFullSchema,
  OAuthClientInformationSchema,
  OAuthTokensSchema,
  type OAuthClientInformationMixed,
  type OAuthClientMetadata,
  type OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js'
import { z } from 'zod'
import { credentialRef, type CredentialRef } from './dsh.js'
import type { ResolvedConfig } from './index.js'

const CALLBACK_PATH = '/oauth/callback'
const SUCCESS_HTML = '<!doctype html><meta charset="utf-8"><title>Authorized</title><p>Authorization complete. You may close this window.</p>'
const FAILURE_HTML = '<!doctype html><meta charset="utf-8"><title>Authorization failed</title><p>Authorization failed. Return to DeepSeek Harness for details.</p>'

const StoredOAuthStateSchema = z.object({
  version: z.literal(1),
  requestedScope: z.string().optional(),
  redirectUrl: z.string().optional(),
  clientInformation: z.union([OAuthClientInformationFullSchema, OAuthClientInformationSchema]).optional(),
  tokens: OAuthTokensSchema.optional(),
  discoveryState: z.object({ authorizationServerUrl: z.string() }).passthrough().optional(),
}).strict()

interface StoredOAuthState {
  version: 1
  requestedScope?: string
  redirectUrl?: string
  clientInformation?: OAuthClientInformationMixed
  tokens?: OAuthTokens
  discoveryState?: OAuthDiscoveryState
}

interface PendingAuthorization {
  promise: Promise<void>
  resolve: () => void
  reject: (error: unknown) => void
  timer: NodeJS.Timeout
  settled: boolean
}

/** Runtime handle consumed by the connection supervisor. */
export interface OAuthRuntime {
  readonly provider: OAuthClientProvider
  /** Bind the transport whose OAuth exchange must consume the next callback code. */
  bindTransport(transport: StreamableHTTPClientTransport): void
  /** Wait until the browser callback has exchanged its code for tokens. */
  waitForAuthorization(): Promise<void>
  /** Close the callback listener and reject any unfinished authorization. */
  dispose(): Promise<void>
}

class CredentialOAuthStore {
  private tail: Promise<void> = Promise.resolve()

  constructor(
    private readonly ctx: Context,
    private readonly ref: CredentialRef,
  ) {}

  private async readRaw(): Promise<StoredOAuthState> {
    const resolved = await this.ctx.credentials.resolve(this.ref)
    if (!resolved) return { version: 1 }
    let parsed: unknown
    try {
      parsed = JSON.parse(resolved.value)
    } catch {
      throw new Error(`fitmeet-dsh-plugin: credential ${this.ref} does not contain valid OAuth JSON`)
    }
    const result = StoredOAuthStateSchema.safeParse(parsed)
    if (!result.success) {
      throw new Error(`fitmeet-dsh-plugin: credential ${this.ref} contains unsupported OAuth state`)
    }
    return result.data
  }

  async read(): Promise<StoredOAuthState> {
    await this.tail
    return this.readRaw()
  }

  async update(mutator: (state: StoredOAuthState) => void): Promise<void> {
    const run = this.tail.then(async () => {
      const state = await this.readRaw()
      mutator(state)
      await this.ctx.credentials.set(this.ref, JSON.stringify(state))
    })
    this.tail = run.catch(() => {})
    return run
  }
}

class HarnessOAuthProvider implements OAuthClientProvider {
  private verifier: string | undefined
  private expectedState: string | undefined

  private matchesScope(state: StoredOAuthState): boolean {
    // Legacy grants predate social:read. Unknown legacy scope must never be
    // treated as consent to the new permission. Partial grants remain valid
    // for an unchanged request; only the server decides the granted access.
    const clientScope = state.clientInformation && 'scope' in state.clientInformation ? state.clientInformation.scope : undefined
    const saved = state.requestedScope ?? clientScope ?? state.tokens?.scope
      ?? 'profile:read people:search hall:publish messages:read messages:write'
    const normalize = (value: string) => value.trim().split(/\s+/).sort().join(' ')
    return normalize(saved) === normalize(this.config.scope ?? '')
  }

  constructor(
    private readonly store: CredentialOAuthStore,
    private readonly runtime: OAuthRuntimeImpl,
    private readonly config: ResolvedConfig,
    readonly redirectUrl: URL,
  ) {}

  get clientMetadata(): OAuthClientMetadata {
    return {
      redirect_uris: [this.redirectUrl.toString()],
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      client_name: `DeepSeek Harness MCP OAuth (${this.config.serverName})`,
      ...(this.config.scope === undefined ? {} : { scope: this.config.scope }),
    }
  }

  state(): string {
    this.expectedState = randomBytes(32).toString('base64url')
    return this.expectedState
  }

  assertCallbackState(received: string | null): void {
    if (!this.expectedState || received === null) throw new Error('OAuth callback state is missing')
    const expected = Buffer.from(this.expectedState)
    const actual = Buffer.from(received)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new Error('OAuth callback state does not match')
    }
    this.expectedState = undefined
  }

  async clientInformation(): Promise<OAuthClientInformationMixed | undefined> {
    const state = await this.store.read()
    return state.redirectUrl === this.redirectUrl.toString() && this.matchesScope(state) ? state.clientInformation : undefined
  }

  async saveClientInformation(clientInformation: OAuthClientInformationMixed): Promise<void> {
    await this.store.update((state) => {
      if (state.redirectUrl !== this.redirectUrl.toString() || !this.matchesScope(state)) delete state.tokens
      state.redirectUrl = this.redirectUrl.toString()
      state.requestedScope = this.config.scope
      state.clientInformation = clientInformation
    })
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    const state = await this.store.read()
    return state.redirectUrl === this.redirectUrl.toString() && this.matchesScope(state) ? state.tokens : undefined
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    await this.store.update((state) => { state.tokens = tokens })
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    // SDK discovery prefers all server-advertised scopes over client metadata.
    // Honor the user's configured subset at the browser authorization boundary.
    const requestedUrl = new URL(authorizationUrl)
    if (this.config.scope) requestedUrl.searchParams.set('scope', this.config.scope)
    await this.runtime.beginAuthorization(requestedUrl)
  }

  saveCodeVerifier(codeVerifier: string): void {
    this.verifier = codeVerifier
  }

  codeVerifier(): string {
    if (!this.verifier) throw new Error('fitmeet-dsh-plugin: OAuth code verifier is unavailable')
    return this.verifier
  }

  async saveDiscoveryState(discoveryState: OAuthDiscoveryState): Promise<void> {
    await this.store.update((state) => { state.discoveryState = discoveryState })
  }

  async discoveryState(): Promise<OAuthDiscoveryState | undefined> {
    return (await this.store.read()).discoveryState
  }

  async invalidateCredentials(scope: 'all' | 'client' | 'tokens' | 'verifier' | 'discovery'): Promise<void> {
    if (scope === 'verifier') {
      this.verifier = undefined
      return
    }
    if (scope === 'all') this.verifier = undefined
    await this.store.update((state) => {
      if (scope === 'all' || scope === 'client') {
        delete state.clientInformation
        delete state.redirectUrl
      }
      if (scope === 'all' || scope === 'tokens') delete state.tokens
      if (scope === 'all' || scope === 'discovery') delete state.discoveryState
    })
  }
}

class OAuthRuntimeImpl implements OAuthRuntime {
  readonly provider: HarnessOAuthProvider
  private finishAuth: ((code: string) => Promise<void>) | undefined
  private pending: PendingAuthorization | undefined
  private disposed = false

  constructor(
    private readonly ctx: Context,
    private readonly config: ResolvedConfig,
    private readonly server: Server,
    private readonly openAuthorization: (url: URL) => Promise<void>,
    redirectUrl: URL,
  ) {
    const store = new CredentialOAuthStore(ctx, credentialRef(config.credentialRef))
    this.provider = new HarnessOAuthProvider(store, this, config, redirectUrl)
  }

  bindTransport(transport: StreamableHTTPClientTransport): void {
    this.finishAuth = code => transport.finishAuth(code)
  }

  async beginAuthorization(authorizationUrl: URL): Promise<void> {
    if (this.disposed) throw new Error('fitmeet-dsh-plugin: OAuth runtime is disposed')
    if (this.pending && !this.pending.settled) return

    const gate: PromiseWithResolvers<void> = Promise.withResolvers()
    const pending: PendingAuthorization = {
      promise: gate.promise,
      resolve: gate.resolve,
      reject: gate.reject,
      timer: setTimeout(() => {
        this.rejectPending(pending, new Error('fitmeet-dsh-plugin: browser authorization timed out'))
      }, this.config.authorizationTimeoutMs),
      settled: false,
    }
    pending.timer.unref()
    void pending.promise.catch(() => {})
    this.pending = pending

    try {
      await this.openAuthorization(authorizationUrl)
      this.ctx.logger.info(
        `fitmeet-dsh-plugin(${this.config.serverName}): opened authorization in the default browser; waiting for the loopback callback`,
      )
    } catch (error) {
      this.rejectPending(pending, new Error('fitmeet-dsh-plugin: failed to open the default browser', { cause: error }))
      throw error
    }
  }

  async waitForAuthorization(): Promise<void> {
    const pending = this.pending
    if (!pending) throw new Error('fitmeet-dsh-plugin: authorization was requested without a pending browser flow')
    try {
      await pending.promise
    } finally {
      if (this.pending === pending) this.pending = undefined
    }
  }

  private rejectPending(pending: PendingAuthorization, error: unknown): void {
    if (pending.settled) return
    pending.settled = true
    clearTimeout(pending.timer)
    pending.reject(error)
  }

  async handleCallback(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? '/', this.provider.redirectUrl)
    if (request.method !== 'GET' || url.pathname !== CALLBACK_PATH) {
      respond(response, 404, FAILURE_HTML)
      return
    }

    const pending = this.pending
    if (!pending || pending.settled) {
      respond(response, 409, FAILURE_HTML)
      return
    }

    try {
      this.provider.assertCallbackState(url.searchParams.get('state'))
      const oauthError = url.searchParams.get('error')
      if (oauthError) throw new Error(`OAuth authorization was denied (${oauthError})`)
      const code = url.searchParams.get('code')
      if (!code) throw new Error('OAuth callback code is missing')
      if (!this.finishAuth) throw new Error('OAuth callback has no active MCP transport')
      await this.finishAuth(code)
      pending.settled = true
      clearTimeout(pending.timer)
      pending.resolve()
      respond(response, 200, SUCCESS_HTML)
    } catch (error) {
      this.rejectPending(pending, error)
      respond(response, 400, FAILURE_HTML)
    }
  }

  async dispose(): Promise<void> {
    if (this.disposed) return
    this.disposed = true
    const pending = this.pending
    if (pending) this.rejectPending(pending, new Error('fitmeet-dsh-plugin: disposed during authorization'))
    this.server.closeAllConnections()
    await new Promise<void>((resolve, reject) => {
      this.server.close(error => error ? reject(error) : resolve())
    })
  }
}

/** Start the loopback callback listener before the MCP SDK needs its redirect URI. */
export async function createOAuthRuntime(
  ctx: Context,
  config: ResolvedConfig,
  openAuthorization: (url: URL) => Promise<void> = openBrowser,
): Promise<OAuthRuntime> {
  const store = new CredentialOAuthStore(ctx, credentialRef(config.credentialRef))
  const saved = await store.read()
  const savedPort = callbackPort(saved.redirectUrl)
  const requestedPort = config.callbackPort === 0 ? savedPort ?? 0 : config.callbackPort
  let runtime: OAuthRuntimeImpl | undefined
  const server = createServer((request, response) => {
    if (!runtime) {
      respond(response, 503, FAILURE_HTML)
      return
    }
    void runtime.handleCallback(request, response).catch(() => {
      if (!response.headersSent) respond(response, 500, FAILURE_HTML)
      else response.destroy()
    })
  })

  try {
    await listen(server, requestedPort)
  } catch (error) {
    if (config.callbackPort !== 0 || savedPort === undefined || !isAddressInUse(error)) throw error
    ctx.logger.warn(`fitmeet-dsh-plugin: saved OAuth callback port ${savedPort} is busy; using a new local port and requesting a fresh authorization`)
    await listen(server, 0)
  }
  const address = server.address() as AddressInfo
  const redirectUrl = new URL(`http://127.0.0.1:${String(address.port)}${CALLBACK_PATH}`)
  runtime = new OAuthRuntimeImpl(ctx, config, server, openAuthorization, redirectUrl)
  return runtime
}

function callbackPort(redirectUrl: string | undefined): number | undefined {
  if (!redirectUrl) return undefined
  try {
    const url = new URL(redirectUrl)
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.pathname !== CALLBACK_PATH) return undefined
    const port = Number(url.port)
    return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : undefined
  } catch {
    return undefined
  }
}

function listen(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('listening', onListening)
      reject(error)
    }
    const onListening = () => {
      server.off('error', onError)
      resolve()
    }
    server.once('error', onError)
    server.once('listening', onListening)
    server.listen(port, '127.0.0.1')
  })
}

function isAddressInUse(error: unknown): boolean {
  return error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'EADDRINUSE'
}

function respond(response: ServerResponse, status: number, body: string): void {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'text/html; charset=utf-8',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
  })
  response.end(body)
}

async function openBrowser(url: URL): Promise<void> {
  const command = process.platform === 'darwin'
    ? { file: 'open', args: [url.toString()] }
    : process.platform === 'win32'
      ? { file: 'rundll32.exe', args: ['url.dll,FileProtocolHandler', url.toString()] }
      : { file: 'xdg-open', args: [url.toString()] }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(command.file, command.args, { stdio: 'ignore' })
    child.once('error', reject)
    child.once('close', code => code === 0
      ? resolve()
      : reject(new Error(`browser opener exited with code ${String(code)}`)))
  })
}
