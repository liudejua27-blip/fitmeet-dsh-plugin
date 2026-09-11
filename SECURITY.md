# Security

## OAuth and credentials

This plugin never accepts a shared or hard-coded Bearer token. Each Harness installation opens the FitMeet authorization flow with OAuth 2.1 authorization code, PKCE S256, and dynamic client registration. Access tokens, refresh tokens, and client registration data are stored through the local DeepSeek Harness credential service under `FITMEET_MCP_OAUTH`.

Do not commit exported Harness credentials, access tokens, refresh tokens, authorization codes, passwords, or verification codes.

## Write actions

OAuth permission is separate from approval of a specific action. Publishing, opening a direct chat, and sending a message require a server-issued preview followed by an explicit user confirmation in the current interaction. The plugin and bundled Skill instruct the Agent to use the matching `prepare` and `confirm` tools without changing the confirmation values.

## Reports

Report a suspected vulnerability privately through the contact channel on [FitMeet](https://fitmeet.cn) and avoid including live credentials in the report.
