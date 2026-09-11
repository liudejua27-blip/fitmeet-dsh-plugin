/** Interactive OAuth runtime: loopback callback, browser hand-off, and state persistence. */
import type { Context } from '@deepseek-ai/cordis';
import type { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth.js';
import type { ResolvedConfig } from './index.js';
/** Runtime handle consumed by the connection supervisor. */
export interface OAuthRuntime {
    readonly provider: OAuthClientProvider;
    /** Bind the transport whose OAuth exchange must consume the next callback code. */
    bindTransport(transport: StreamableHTTPClientTransport): void;
    /** Wait until the browser callback has exchanged its code for tokens. */
    waitForAuthorization(): Promise<void>;
    /** Close the callback listener and reject any unfinished authorization. */
    dispose(): Promise<void>;
}
/** Start the loopback callback listener before the MCP SDK needs its redirect URI. */
export declare function createOAuthRuntime(ctx: Context, config: ResolvedConfig, openAuthorization?: (url: URL) => Promise<void>): Promise<OAuthRuntime>;
//# sourceMappingURL=oauth.d.ts.map