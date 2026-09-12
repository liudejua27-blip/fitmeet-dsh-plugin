/**
 * OAuth-enabled Streamable HTTP MCP client for DeepSeek Harness.
 *
 * The plugin preserves the tool discovery, naming, execution, and reconnect
 * behavior of `@deepseek-ai/dsh-mcp-client`, while adding an interactive
 * OAuth authorization-code flow backed by the Harness credential service.
 *
 * @module fitmeet-dsh-plugin
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { ReconnectConfig } from './connection.js';
export type { McpResult } from './tools.js';
export type { ReconnectConfig, ResolvedReconnectPolicy } from './connection.js';
/** Cordis plugin name used by loader diagnostics. */
export declare const name = "fitmeet-dsh-plugin";
/** Services required by the OAuth client. */
export declare const inject: string[];
export declare const FITMEET_SERVER_NAME = "fitmeet";
export declare const FITMEET_MCP_URL = "https://api.fitmeet.cn/api/v1/mcp";
export declare const FITMEET_SCOPES = "profile:read people:search hall:publish messages:read messages:write social:read";
export declare const FITMEET_CREDENTIAL_REF = "FITMEET_MCP_OAUTH";
/** User configuration for one OAuth-protected Streamable HTTP MCP server. */
export interface Config {
    /** Stable namespace used in public tool names (`mcp__<serverName>__<tool>`). */
    serverName: string;
    /** HTTPS MCP endpoint; loopback HTTP is accepted for local development. */
    url: string;
    /** Harness credential reference holding the serialized OAuth state. */
    credentialRef?: string;
    /** Optional nonempty subset of FitMeet scopes; defaults to all supported scopes. Browser consent is still required. */
    scope?: string;
    /** Non-authorization headers attached to MCP and OAuth discovery requests. */
    headers?: Record<string, string>;
    /** Loopback callback port; `0` asks the OS for an available port. */
    callbackPort?: number;
    /** Maximum wait for the browser authorization callback. */
    authorizationTimeoutMs?: number;
    /** Per-tool MCP request timeout. */
    toolCallTimeoutMs?: number;
    /** Reject plugin activation if the first connect/auth/sync attempt fails. */
    failOnStartupError?: boolean;
    /** Automatic reconnect policy after a lost MCP connection. */
    reconnect?: ReconnectConfig;
}
/** Configuration after validation and deployment defaults are resolved once. */
export interface ResolvedConfig {
    serverName: string;
    url: string;
    credentialRef: string;
    scope: string;
    headers: Record<string, string>;
    callbackPort: number;
    authorizationTimeoutMs: number;
    toolCallTimeoutMs: number;
    failOnStartupError: boolean;
}
/** Cordis configuration schema. */
export declare const Config: z<Config>;
/** Derive a valid credential reference when the deployment does not name one. */
export declare function defaultCredentialRef(serverName: string): string;
/** Model guidance for discovering and executing capabilities from one MCP server. */
export declare function mcpGuidance(serverName: string): string;
/** Remove the metadata block because the Harness runtime registers metadata separately. */
export declare function stripSkillFrontmatter(markdown: string): string;
export declare function registerFitMeetSkill(ctx: Context): Promise<void>;
/** Resolve defaults and reject unsafe or internally conflicting configuration. */
export declare function resolveConfig(config: Config): ResolvedConfig;
/** Connect, authorize when needed, and publish the remote MCP tools. */
export declare function apply(ctx: Context, config: Config): Promise<void>;
//# sourceMappingURL=index.d.ts.map