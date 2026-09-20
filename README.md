<p align="center"><img src="https://raw.githubusercontent.com/liudejua27-blip/fitmeet-dsh-plugin/main/assets/fitmeet-icon.png" alt="FitMeet" width="88"></p>

# FitMeet for DeepSeek Harness

[English](README.en.md) | [简体中文](README.zh-CN.md)

**Find people. Discover shared interests. Make plans happen.**

**[Try FitMeet](https://fitmeet.cn) · [Connect your Agent](https://fitmeet.cn/mcp) · [English npm](https://www.npmjs.com/package/fitmeet-dsh-plugin) · [中文 npm](https://www.npmjs.com/package/fitmeet-dsh-plugin-zh)**

## Give DeepSeek Harness a way to connect you with people

Need a sports partner, someone with a useful skill, or people who share your interests? Add FitMeet to Harness and move from describing a need to searching, reviewing candidates and contacting people in one conversation.

- **Find your people**: search people, public needs and capabilities, then review the evidence.
- **Put your needs out there**: publish a confirmed need or capability and get a link to the result.
- **Keep the connection going**: check conversations, gatherings and reminders, and reach out with your permission.

## Get started

1. Install the English plugin below and start Harness.
2. Sign in on the FitMeet page and choose your permissions.
3. Back in chat, say: **“Use FitMeet to find badminton partners in Qingdao.”**

## Install

Requires Node.js 22.19+ and DeepSeek Harness. Install one language package; do not enable both against the same tool namespace.

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add fitmeet-dsh-plugin@0.2.1
npx --yes @deepseek-ai/dsh@latest web
```

[English npm](https://www.npmjs.com/package/fitmeet-dsh-plugin) | [Chinese npm](https://www.npmjs.com/package/fitmeet-dsh-plugin-zh)

On first start, sign in to FitMeet in the browser and review the requested permissions. No token copying is needed. The default requests six scopes; a nonempty subset can be configured. New permissions are never added to existing grants silently. Credentials are stored by the local Harness credential service.

General MCP clients such as WorkBuddy and Doubao connect directly to the remote endpoint; this npm package is specifically a Harness plugin:

```text
https://api.fitmeet.cn/api/v1/mcp
```

## Try these requests

- “Use FitMeet to find badminton partners in Qingdao.”
- “Show me the needs and capabilities I can publish on FitMeet.”
- “Check my FitMeet groups and reminders.”
- “Help me contact this person about playing badminton this weekend.”

These are example requests, not promises of available matches. Search uses the information people have made discoverable. Publishing and messaging follow the permissions you grant to that connection.

## Choose how to connect

| You use | Start here |
| --- | --- |
| FitMeet directly | [Open FitMeet](https://fitmeet.cn) |
| WorkBuddy, Doubao or another compatible MCP client | Add `https://api.fitmeet.cn/api/v1/mcp` and sign in; [setup guide](https://fitmeet.cn/mcp) |
| DeepSeek Harness | Use the commands above to install one FitMeet language package |

## Automatic execution and available tools

New connections request all six scopes; fresh tool lists contain only tools covered by the grant. Cached lists may need refreshing. Enable automatic publishing, chats and messages separately on the FitMeet consent page. In that mode, follow the prepare result AUTOMATIC authorization and submit without another prompt. Otherwise the per-action confirmation flow below applies. Automatic mode does not create/confirm Needs or bypass source, recipient, content and idempotency checks. Revoking the connection stops subsequent automatic execution.


## Tools and scope

MCP 2.2 provides 17 tools and six permission scopes. The [English Skill](skills/fitmeet/SKILL.en.md) documents every tool and its usage.

- Own profile; people, need and capability search; candidate details.
- Confirmed publication sources, publication previews and confirmation.
- Own direct conversations and messages; chat and message preview/confirmation.
- Groups and gatherings, group details, notifications, personal connection items and feedback.

Harness prefixes tool names with `mcp__fitmeet__`; use live schemas for arguments. Group creation, joining, scheduling, completion and feedback edits use returned FitMeet web links. In-app Agent memory, maps and weather are not automatically external MCP capabilities.

## Publication and recovery

Read sources and select a matching Need or capability. Prepare the exact publication; request confirmation in manual mode, or submit under the connection’s explicit automatic authorization. Never substitute a capability biography for a companion-finding Need. New receipts include publication type, expiry and a viewing link. Older receipts remain replayable without another write.

- 401: expired or revoked authorization; reconnect through the host.
- 403 `insufficient_scope`: missing permission, not necessarily token expiry. Refresh cannot add permissions. Complete fresh consent. If the host keeps refreshing, revoke only that client and reconnect.
- Expired or changed preview: prepare again and obtain confirmation.
- Tools appearing in a list is discovery, not successful execution. Verify an actual authorized read.

[FitMeet](https://fitmeet.cn) | [MCP setup](https://fitmeet.cn/mcp) | [Connections](https://fitmeet.cn/mcp/connections) | [Chinese Skill](skills/fitmeet/SKILL.md)

## Development and distribution

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build:distributions
```

`dist/en` and `dist/zh-CN` are generated from one source with an explicit public-file allowlist. npm publication, GitHub updates, production deployment and client acceptance are separate stages; none implies official marketplace listing.

[Real Harness acceptance](https://github.com/liudejua27-blip/fitmeet-dsh-plugin/blob/main/ACCEPTANCE.md): authenticated reads, automatic publication/test messaging, and process restart recovery verified; coverage and remaining limitations are recorded separately.
