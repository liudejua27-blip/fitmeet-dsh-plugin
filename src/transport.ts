/** OAuth-aware Streamable HTTP transport factory. */

import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'
import type { ResolvedConfig } from './index.js'
import type { OAuthRuntime } from './oauth.js'

/** Create a transport and bind its authorization-code exchange to the callback runtime. */
export function createTransport(
  config: ResolvedConfig,
  oauth: OAuthRuntime,
): Transport {
  const transport = new StreamableHTTPClientTransport(new URL(config.url), {
    authProvider: oauth.provider,
    requestInit: { headers: config.headers },
  })
  oauth.bindTransport(transport)
  return transport as Transport
}
