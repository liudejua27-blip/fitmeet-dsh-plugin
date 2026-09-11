/**
 * OAuth-enabled Streamable HTTP MCP client for DeepSeek Harness.
 *
 * The plugin preserves the tool discovery, naming, execution, and reconnect
 * behavior of `@deepseek-ai/dsh-mcp-client`, while adding an interactive
 * OAuth authorization-code flow backed by the Harness credential service.
 *
 * @module fitmeet-dsh-plugin
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import z from '@deepseek-ai/schemastery';
import { credentialRef } from './dsh.js';
import { createOAuthRuntime } from './oauth.js';
import { RECONNECT_DEFAULTS, resolveReconnectPolicy, startConnection } from './connection.js';
import { registerConnection } from './registry.js';
/** Cordis plugin name used by loader diagnostics. */
export const name = 'fitmeet-dsh-plugin';
/** Services required by the OAuth client. */
export const inject = ['tools', 'credentials'];
const DEFAULT_TOOL_CALL_TIMEOUT_MS = 60_000;
const DEFAULT_AUTHORIZATION_TIMEOUT_MS = 5 * 60_000;
const MAX_TIMER_DELAY_MS = 2_147_483_647;
const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
export const FITMEET_SERVER_NAME = 'fitmeet';
export const FITMEET_MCP_URL = 'https://api.fitmeet.cn/api/v1/mcp';
export const FITMEET_SCOPES = 'profile:read people:search hall:publish messages:read messages:write';
export const FITMEET_CREDENTIAL_REF = 'FITMEET_MCP_OAUTH';
const SKILL_URL = new URL('../skills/fitmeet/SKILL.md', import.meta.url);
const SKILL_DIRECTORY = fileURLToPath(new URL('../skills/fitmeet/', import.meta.url));
const SKILL_DESCRIPTION = 'Use FitMeet to search its consent-based human network and, only after an exact preview and explicit current-turn confirmation, publish, open a direct chat, or send a message.';
const Reconnect = z.object({
    enabled: z.boolean().default(RECONNECT_DEFAULTS.enabled),
    initialDelayMs: z.number().min(1).max(MAX_TIMER_DELAY_MS).default(RECONNECT_DEFAULTS.initialDelayMs),
    maxDelayMs: z.number().min(1).max(MAX_TIMER_DELAY_MS).default(RECONNECT_DEFAULTS.maxDelayMs),
    maxAttempts: z.number().step(1).min(1).max(Number.MAX_SAFE_INTEGER).default(RECONNECT_DEFAULTS.maxAttempts),
});
/** Cordis configuration schema. */
export const Config = z.object({
    serverName: z.string().required().pattern(SERVER_NAME_PATTERN),
    url: z.string().required(),
    credentialRef: z.string(),
    scope: z.string(),
    headers: z.dict(String).default({}),
    callbackPort: z.number().step(1).min(0).max(65_535).default(0),
    authorizationTimeoutMs: z.number().min(1).max(MAX_TIMER_DELAY_MS).default(DEFAULT_AUTHORIZATION_TIMEOUT_MS),
    toolCallTimeoutMs: z.number().min(1).max(MAX_TIMER_DELAY_MS).default(DEFAULT_TOOL_CALL_TIMEOUT_MS),
    failOnStartupError: z.boolean().default(true),
    reconnect: Reconnect,
});
const activeServerNames = new WeakMap();
/** Derive a valid credential reference when the deployment does not name one. */
export function defaultCredentialRef(serverName) {
    return serverName === FITMEET_SERVER_NAME
        ? FITMEET_CREDENTIAL_REF
        : `DSH_MCP_OAUTH_${serverName.toUpperCase().replaceAll('-', '_')}`;
}
/** Model guidance for discovering and executing capabilities from one MCP server. */
export function mcpGuidance(serverName) {
    const prefix = `mcp__${serverName}__`;
    return `Use FitMeet tools beginning with ${prefix} when the user asks to find people, needs, capabilities, or manage FitMeet publishing and direct messages. `
        + 'Search results are evidence for the user to assess, not consent to contact. '
        + 'For publishing, opening a chat, or sending a message, call the matching prepare tool, show the exact preview, obtain explicit confirmation in the current turn, then call the matching confirm tool with the unchanged confirmation values. '
        + 'Never treat OAuth consent as confirmation of a specific write action.';
}
/** Remove the metadata block because the Harness runtime registers metadata separately. */
export function stripSkillFrontmatter(markdown) {
    if (!markdown.startsWith('---\n'))
        return markdown.trim();
    const end = markdown.indexOf('\n---\n', 4);
    return end === -1 ? markdown.trim() : markdown.slice(end + 5).trim();
}
export async function registerFitMeetSkill(ctx) {
    const content = stripSkillFrontmatter(await readFile(SKILL_URL, 'utf8'));
    ctx.inject(['skills'], (skillCtx) => {
        skillCtx.skills.register({
            name: 'fitmeet',
            description: SKILL_DESCRIPTION,
            whenToUse: 'Use when the user wants to find people or public needs/capabilities in FitMeet, review their FitMeet profile, publish after confirmation, or manage one-to-one FitMeet conversations.',
            source: 'bundled',
            resourceBase: { kind: 'directory', path: SKILL_DIRECTORY },
            content,
            invocation: { modelInvocable: true, userInvocable: true },
        });
    });
}
/** Resolve defaults and reject unsafe or internally conflicting configuration. */
export function resolveConfig(config) {
    if (!SERVER_NAME_PATTERN.test(config.serverName)) {
        throw new Error(`fitmeet-dsh-plugin: serverName must match ${String(SERVER_NAME_PATTERN)}`);
    }
    const url = new URL(config.url);
    const loopback = url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '[::1]';
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) {
        throw new Error('fitmeet-dsh-plugin: url must use HTTPS, except for loopback development endpoints');
    }
    if (url.username || url.password)
        throw new Error('fitmeet-dsh-plugin: url must not contain credentials');
    if (url.toString() !== FITMEET_MCP_URL) {
        throw new Error(`fitmeet-dsh-plugin: url must be the FitMeet MCP endpoint ${FITMEET_MCP_URL}`);
    }
    if (config.serverName !== FITMEET_SERVER_NAME) {
        throw new Error(`fitmeet-dsh-plugin: serverName must be ${FITMEET_SERVER_NAME}`);
    }
    const headers = { ...(config.headers ?? {}) };
    if (Object.keys(headers).some(key => key.toLowerCase() === 'authorization')) {
        throw new Error('fitmeet-dsh-plugin: headers.Authorization is owned by OAuth and must not be configured');
    }
    const callbackPort = config.callbackPort ?? 0;
    if (!Number.isInteger(callbackPort) || callbackPort < 0 || callbackPort > 65_535) {
        throw new Error('fitmeet-dsh-plugin: callbackPort must be an integer from 0 through 65535');
    }
    const authorizationTimeoutMs = config.authorizationTimeoutMs ?? DEFAULT_AUTHORIZATION_TIMEOUT_MS;
    const toolCallTimeoutMs = config.toolCallTimeoutMs ?? DEFAULT_TOOL_CALL_TIMEOUT_MS;
    for (const [key, value] of Object.entries({ authorizationTimeoutMs, toolCallTimeoutMs })) {
        if (!Number.isFinite(value) || value <= 0 || value > MAX_TIMER_DELAY_MS) {
            throw new Error(`fitmeet-dsh-plugin: ${key} must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`);
        }
    }
    const ref = config.credentialRef ?? defaultCredentialRef(config.serverName);
    credentialRef(ref);
    if (ref !== FITMEET_CREDENTIAL_REF) {
        throw new Error(`fitmeet-dsh-plugin: credentialRef must be ${FITMEET_CREDENTIAL_REF}`);
    }
    const scope = config.scope?.trim();
    if (config.scope !== undefined && !scope)
        throw new Error('fitmeet-dsh-plugin: scope must not be empty');
    if (scope !== undefined && scope !== FITMEET_SCOPES) {
        throw new Error(`fitmeet-dsh-plugin: scope must be exactly ${FITMEET_SCOPES}`);
    }
    return Object.freeze({
        serverName: config.serverName,
        url: url.toString(),
        credentialRef: ref,
        ...(scope === undefined ? {} : { scope }),
        headers,
        callbackPort,
        authorizationTimeoutMs,
        toolCallTimeoutMs,
        failOnStartupError: config.failOnStartupError ?? true,
    });
}
/** Connect, authorize when needed, and publish the remote MCP tools. */
export async function apply(ctx, config) {
    const resolved = resolveConfig(config);
    const reconnect = resolveReconnectPolicy(config.reconnect, `fitmeet-dsh-plugin(${resolved.serverName}): reconnect`);
    ctx.effect(() => {
        let names = activeServerNames.get(ctx.root);
        if (!names) {
            names = new Set();
            activeServerNames.set(ctx.root, names);
        }
        if (names.has(resolved.serverName)) {
            throw new Error(`fitmeet-dsh-plugin: serverName "${resolved.serverName}" is already in use by another instance`);
        }
        names.add(resolved.serverName);
        return () => void names.delete(resolved.serverName);
    }, 'fitmeet-dsh-plugin.serverName');
    const entryId = ctx.fiber.entry?.options?.id;
    if (typeof entryId !== 'string' || !entryId)
        throw new Error('fitmeet-dsh-plugin: loader entry id is required');
    const reporter = registerConnection(ctx.root, resolved, entryId);
    ctx.effect(() => () => { reporter.dispose(); }, 'fitmeet-dsh-plugin.web-projection');
    ctx.inject(['systemPrompt'], (promptCtx) => {
        promptCtx.systemPrompt.section({
            name: `tool:mcp:${resolved.serverName}`,
            order: 118,
            text: mcpGuidance(resolved.serverName),
        });
    });
    await registerFitMeetSkill(ctx);
    const oauth = await createOAuthRuntime(ctx, resolved);
    ctx.effect(() => () => oauth.dispose(), 'fitmeet-dsh-plugin.oauth');
    const connection = startConnection(ctx, resolved, reconnect, oauth, reporter);
    ctx.effect(() => () => connection.dispose(), 'fitmeet-dsh-plugin.connection');
    const outcome = await connection.ready;
    if (outcome.error !== undefined && resolved.failOnStartupError) {
        throw new Error(`fitmeet-dsh-plugin(${resolved.serverName}): initial authorization, connection, or tool synchronization failed`, { cause: outcome.error });
    }
}
//# sourceMappingURL=index.js.map