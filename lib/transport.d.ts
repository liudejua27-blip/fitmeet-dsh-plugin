/** OAuth-aware Streamable HTTP transport factory. */
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { ResolvedConfig } from './index.js';
import type { OAuthRuntime } from './oauth.js';
/** Create a transport and bind its authorization-code exchange to the callback runtime. */
export declare function createTransport(config: ResolvedConfig, oauth: OAuthRuntime): Transport;
//# sourceMappingURL=transport.d.ts.map