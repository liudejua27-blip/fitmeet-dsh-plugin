# Connect FitMeet MCP

Configure only when the user asks to connect. Follow the host's current configuration format; preserve other servers. Endpoint: https://api.fitmeet.cn/api/v1/mcp using Streamable HTTP with per-user browser OAuth and PKCE S256. No shared key or fixed Authorization header is needed.

The client SDK handles discovery and supported client identity methods. DCR and CIMD are compatible options, not separate user-facing products. Use the actual metadata; never invent a client identity URL. The user logs in and chooses the requested permissions.

Verify each stage separately: configuration saved, tools discovered, authorized read succeeds, reconnect/refresh works. Use a read tool appropriate to the user's request and granted scopes. There are 17 tools in MCP 2.2; groups, notifications, items and feedback require social:read. Existing grants do not gain new permissions automatically.

For 403 insufficient_scope, request the indicated scopes through fresh consent. Token refresh cannot add scopes. If the host gets stuck refreshing, revoke only the affected client at https://fitmeet.cn/mcp/connections, then reconnect in that host. Do not describe every error as token expiry.

WorkBuddy configuration example (merge rather than replace other servers):

```json
{"mcpServers":{"fitmeet":{"type":"streamableHttp","url":"https://api.fitmeet.cn/api/v1/mcp","timeout":30000}}}
```

Other hosts may use different field names. No password, verification code or token should be copied into chat. Publishing, opening a chat and sending a message still require the exact preview and explicit per-action confirmation described in the Skill.

- Setup: https://fitmeet.cn/developers/agent-setup
- Public service manifest: https://fitmeet.cn/integrations/fitmeet/service.json
- Compatibility: https://fitmeet.cn/integrations

Automatic execution is an independent choice on the FitMeet consent page. When enabled, use the prepare result authorizationMode=AUTOMATIC to continue without another per-action prompt. Otherwise keep manual confirmation. Never silently upgrade an existing grant.
