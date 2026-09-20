<p align="center"><img src="https://raw.githubusercontent.com/liudejua27-blip/fitmeet-dsh-plugin/main/assets/fitmeet-icon.png" alt="FitMeet" width="88"></p>
<h1 align="center">FitMeet</h1>
<h3 align="center">Personal Agent Network</h3>
<p align="center">Speak what you need.<br>Let your Agent find the right people.</p>
<p align="center"><a href="https://fitmeet.cn">Website</a> · <a href="https://fitmeet.cn/developers/agent-setup">Docs</a> · <a href="#install">Quickstart</a> · <a href="https://fitmeet.cn/mcp">MCP</a> · <a href="https://github.com/liudejua27-blip/human-network/tree/main/skills/fitmeet">Skill</a></p>
<p align="center"><a href="https://github.com/liudejua27-blip/fitmeet-dsh-plugin/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/liudejua27-blip/fitmeet-dsh-plugin?style=flat"></a>
<a href="https://www.npmjs.com/package/fitmeet-dsh-plugin"><img alt="npm version" src="https://img.shields.io/npm/v/fitmeet-dsh-plugin"></a>
<a href="https://www.npmjs.com/package/fitmeet-dsh-plugin"><img alt="npm downloads" src="https://img.shields.io/npm/dm/fitmeet-dsh-plugin"></a>
<a href="https://github.com/liudejua27-blip/fitmeet-dsh-plugin/releases"><img alt="GitHub Release" src="https://img.shields.io/github/v/release/liudejua27-blip/fitmeet-dsh-plugin"></a>
<a href="https://github.com/liudejua27-blip/fitmeet-dsh-plugin/blob/main/package.json"><img alt="Node.js 22.19+" src="https://img.shields.io/badge/Node.js-22.19%2B-339933"></a>
<a href="https://github.com/liudejua27-blip/fitmeet-dsh-plugin"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
<a href="https://fitmeet.cn/mcp"><img alt="MCP" src="https://img.shields.io/badge/MCP-Streamable_HTTP-111111"></a>
<a href="https://skills.sh/liudejua27-blip/human-network"><img alt="skills.sh" src="https://skills.sh/b/liudejua27-blip/human-network"></a>
<a href="https://github.com/liudejua27-blip/fitmeet-dsh-plugin/blob/main/LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/License-MIT-blue"></a></p>

[English](README.md) · [简体中文](README.zh-CN.md)

**The FitMeet plugin for DeepSeek Harness · English and Chinese editions.**

## Install

**Add the FitMeet Skill** to teach your Agent how to use FitMeet:

```sh
npx skills add liudejua27-blip/human-network --skill fitmeet
```

**DeepSeek Harness plugin** (Node.js 22.19+; choose one language edition):

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add fitmeet-dsh-plugin@0.2.2
npx --yes @deepseek-ai/dsh@latest web
```

**Other MCP clients:** add this remote URL, then sign in to your own FitMeet account in the browser.

```text
https://api.fitmeet.cn/api/v1/mcp
```

The Skill provides guidance. Connect MCP and complete authorization to use the tools. These are alternative entry points; general MCP clients do not need the Harness plugin.

## Give DeepSeek Harness a way to connect you with people

Need a sports partner, someone with a useful skill, or people who share your interests? Add FitMeet to Harness and move from describing a need to searching, reviewing candidates and contacting people in one conversation.

- **Find your people**: search people, public needs and capabilities, then review the evidence.
- **Put your needs out there**: publish a confirmed need or capability and get a link to the result.
- **Keep the connection going**: check conversations, gatherings and reminders, and reach out with your permission.

## Get started

1. Install the English plugin below and start Harness.
2. Sign in on the FitMeet page and choose your permissions.
3. Back in chat, say: **“Use FitMeet to find badminton partners in Qingdao.”**

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

## Connect with FitMeet

[Website](https://fitmeet.cn) · [Documentation](https://fitmeet.cn/developers/agent-setup) · [Email](mailto:15253005312@163.com)

WeChat: **angji01**. Discord and X are not available yet.
