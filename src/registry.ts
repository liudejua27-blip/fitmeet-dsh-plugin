/** Live Web-facing projection of OAuth MCP connections owned by this package. */

import type { Context } from '@deepseek-ai/cordis'
import type { ResolvedConfig } from './index.js'

/** Connection lifecycle shown in the DSH Web settings page. */
export type ConnectionStatus = 'connecting' | 'authorizing' | 'connected' | 'reconnecting' | 'error'

/** One MCP tool exposed by a connected server. */
export interface McpCapability {
  name: string
  description: string
}

/** Serializable connection state returned to the browser. */
export interface McpConnectionView {
  entryId: string
  serverName: string
  url: string
  status: ConnectionStatus
  capabilities: McpCapability[]
  error?: string
}

type MutableConnectionView = McpConnectionView

/** Handle used by one connection instance to publish current state. */
export interface ConnectionReporter {
  setStatus(status: ConnectionStatus, error?: unknown): void
  setCapabilities(capabilities: readonly McpCapability[]): void
  dispose(): void
}

const registries = new WeakMap<Context, Map<string, MutableConnectionView>>()

function registry(root: Context): Map<string, MutableConnectionView> {
  let entries = registries.get(root)
  if (!entries) {
    entries = new Map()
    registries.set(root, entries)
  }
  return entries
}

/** Register one configured connection in the root-owned Web projection. */
export function registerConnection(root: Context, config: ResolvedConfig, entryId: string): ConnectionReporter {
  const entries = registry(root)
  const view: MutableConnectionView = {
    entryId,
    serverName: config.serverName,
    url: config.url,
    status: 'connecting',
    capabilities: [],
  }
  entries.set(config.serverName, view)

  return {
    setStatus(status, error) {
      view.status = status
      if (error === undefined) delete view.error
      else view.error = error instanceof Error ? error.message : String(error)
    },
    setCapabilities(capabilities) {
      view.capabilities = capabilities.map(capability => ({ ...capability }))
    },
    dispose() {
      if (entries.get(config.serverName) === view) entries.delete(config.serverName)
    },
  }
}

/** Return a detached snapshot of every live connection in stable name order. */
export function listConnections(root: Context): McpConnectionView[] {
  return [...registry(root).values()]
    .sort((left, right) => left.serverName < right.serverName ? -1 : left.serverName > right.serverName ? 1 : 0)
    .map(view => ({
      ...view,
      capabilities: view.capabilities.map(capability => ({ ...capability })),
    }))
}
