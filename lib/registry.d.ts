/** Live Web-facing projection of OAuth MCP connections owned by this package. */
import type { Context } from '@deepseek-ai/cordis';
import type { ResolvedConfig } from './index.js';
/** Connection lifecycle shown in the DSH Web settings page. */
export type ConnectionStatus = 'connecting' | 'authorizing' | 'connected' | 'reconnecting' | 'error';
/** One MCP tool exposed by a connected server. */
export interface McpCapability {
    name: string;
    description: string;
}
/** Serializable connection state returned to the browser. */
export interface McpConnectionView {
    entryId: string;
    serverName: string;
    url: string;
    status: ConnectionStatus;
    capabilities: McpCapability[];
    error?: string;
}
/** Handle used by one connection instance to publish current state. */
export interface ConnectionReporter {
    setStatus(status: ConnectionStatus, error?: unknown): void;
    setCapabilities(capabilities: readonly McpCapability[]): void;
    dispose(): void;
}
/** Register one configured connection in the root-owned Web projection. */
export declare function registerConnection(root: Context, config: ResolvedConfig, entryId: string): ConnectionReporter;
/** Return a detached snapshot of every live connection in stable name order. */
export declare function listConnections(root: Context): McpConnectionView[];
//# sourceMappingURL=registry.d.ts.map