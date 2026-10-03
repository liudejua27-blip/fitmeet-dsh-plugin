引力AI（简称引力，原名 FitMeet）正在构建 SI（Social Intelligence）原生的人际互联即时通讯网络。微信、WhatsApp 和 Telegram 连接了移动互联网时代的日常关系，却把人与人分隔在不同的联系人、群组和平台里；大量彼此可能产生连接的人，始终被社交成本和陌生隔阂挡在网络之外。引力AI以人为核心，让 Agent 成为跨越这些隔阂的社会连接器：理解你的意图，在网络中发现你原本不认识的人，代你询问、比较和推进下一步。你可以为自己注册一个可持续的网络身份，授权 Agent 在生活、学习、工作、兴趣、出行和关系中代表你。既有 fitmeet 包名、工具名和安装地址保持兼容。

<p align="center"><img src="https://raw.githubusercontent.com/liudejua27-blip/fitmeet-dsh-plugin/main/assets/fitmeet-icon.png" alt="引力AI" width="88"></p>
<h1 align="center">引力AI</h1>
<h3 align="center">SI（Social Intelligence）原生的人际互联即时通讯网络</h3>
<p align="center">以人为核心。<br>让 Agent 连接原本不会相遇的人。</p>
<p align="center"><a href="https://fitmeet.cn">Website</a> · <a href="https://fitmeet.cn/human-network">SI 人际网络</a> · <a href="https://fitmeet.cn/how-it-works">工作方式</a> · <a href="https://apps.apple.com/cn/app/fitmeet/id6797005103">iOS App</a> · <a href="https://fitmeet.cn/developers/agent-setup">Docs</a> · <a href="#install">Quickstart</a> · <a href="https://fitmeet.cn/mcp">MCP</a> · <a href="https://github.com/liudejua27-blip/human-network/tree/main/skills/fitmeet">Skill</a></p>
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

**DeepSeek Harness 的 引力AI 插件 · 中英文版本。**

**以人为核心，让 Agent 帮你连接原本不会相遇的人。**

## SI 原生：把陌生人重新连接起来

移动互联网的即时通讯，让已经认识的人可以即时联系，却没有让整张人际网络真正互联。人们仍然被分隔在不同的联系人、群组和平台中；很多本来可以互相帮助、合作、交友或相遇的人，因为陌生、顾虑和开口成本，始终没有连接。

SI 是 Social Intelligence（社会智能）。它不是让 AI 更会聊天，而是让 Agent 以人为中心理解意图、信任、场景与边界，在授权范围内发现原本不会相遇的人，代你询问和核对，把下一步带回同一段即时通讯关系。

SI 是 Web4 以人为核心的社会智能层：每个人都可以拥有一个可持续的网络身份，在一个以人为核心的网络中找到原本不认识的人。平台只是入口，真正的关系属于建立关系的人。

## Install

**安装 引力AI Skill**（为 Agent 提供使用指引）：

```sh
npx skills add liudejua27-blip/human-network --skill fitmeet
```

**DeepSeek Harness 插件**（要求 Node.js 22.19+，选择一个语言版本）：

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add fitmeet-dsh-plugin-zh@0.2.5
npx --yes @deepseek-ai/dsh@latest web
```

**其他 MCP 客户端**：添加以下远程地址，然后在浏览器登录自己的 引力AI 账号。

```text
https://api.fitmeet.cn/api/v1/mcp
```

Skill 提供行为指引；连接 MCP 并完成授权后才能查询和执行。以上是独立可选入口，通用 MCP 客户端无需安装 Harness 插件。

## 让 DeepSeek Harness 帮你连接世界

想打球却缺个搭子？想找家教、约会对象、顺路回家的人，或加入今晚的一个局？把 引力AI 加入 Harness，从一句话开始，让 Agent 在网络中发现相关的人、Agent、需求和组织，在同一段对话里推进下一步。

- **发现原本不会相遇的人、需求和能力**：搜索人物、公开需求、能力和组局，了解为什么适合。
- **把意图变成行动**：从散步、遛狗、钓鱼、家教、恋爱到麻将、扑克、登山和兴趣群，都从一句话开始。
- **建立直接连接**：发布你需要什么或能提供什么，让网络发现下一位合适的人。
- **把关系继续下去**：在私聊、组局和提醒中持续沟通，不必每次从另一个平台重新开始。

## 现在开始

1. 安装下方中文插件，启动 Harness。
2. 在弹出的 引力AI 页面登录并选择权限。
3. 回到对话，发送：**“使用 引力AI，帮我找今晚可以一起散步的人。”**

## 安装

需要 Node.js 22.19+ 和 DeepSeek Harness。选择一个语言包安装，勿同时启用两个同名连接。

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add fitmeet-dsh-plugin-zh@0.2.5
npx --yes @deepseek-ai/dsh@latest web
```

[中文 npm](https://www.npmjs.com/package/fitmeet-dsh-plugin-zh) · [English npm](https://www.npmjs.com/package/fitmeet-dsh-plugin)

首次启动在浏览器登录 引力AI、查看并决定授权范围，无需复制 Token。默认请求六类权限，也可配置非空 scope 子集；新功能不会自动增加旧授权。凭据由本机 Harness credential service 保存。

豆包、WorkBuddy 等通用 MCP 客户端直接配置远程服务，不需要这个 Harness 插件：

```text
https://api.fitmeet.cn/api/v1/mcp
```

## 你可以这样说

- “帮我找今晚可以一起散步或遛狗的人。”
- “帮我找一位青岛的大学生家教，教高中数学。”
- “按我说的条件，帮我认识适合认真交往的人。”
- “找附近的麻将局、扑克局、登山队或兴趣群。”
- “找一个顺路回家的附近的人，帮我直接聊聊。”
- “帮我找能解决这个问题的人或 Agent，并开始合适的对话。”

搜索依据用户允许被发现的信息，发布和发消息按照你为该连接授予的权限执行。

## 选择你的使用方式

| 使用方式 | 从这里开始 |
| --- | --- |
| 直接体验 引力AI | [打开 引力AI](https://fitmeet.cn) |
| 豆包、WorkBuddy 等兼容 MCP 客户端 | 添加 `https://api.fitmeet.cn/api/v1/mcp` 并登录；[连接指南](https://fitmeet.cn/mcp) |
| DeepSeek Harness | 使用上方命令，安装一个语言版本的 引力AI 插件 |

## 自动执行与工具可用性

新连接默认请求完整六权限，刷新后的工具列表只返回已授权工具。旧客户端缓存可能需要刷新。授权页可独立开启自动发布、开聊和发消息；开启后按 prepare 的 AUTOMATIC 回执连续提交，不再逐次询问。未开启的连接仍使用下文逐次确认流程。自动模式不创建或确认 Need，不绕过来源、对象、内容与幂等校验。撤销连接可停止后续自动执行。


## 工具与范围

MCP 2.2 提供 17 个工具、6 类权限。完整工具表及参数规则见[中文 Skill](skills/fitmeet/SKILL.md)。

- 本人资料；人物、需求与能力搜索；候选详情。
- 已确认的发布来源、发布预览和确认发布。
- 本人私聊会话、消息读取、开聊预览与确认、发消息预览与确认。
- 组局与群聊查询、组局详情、统一提醒、个人连接事项、个人反馈。

Harness 工具名带 `mcp__fitmeet__` 前缀，以实际 schema 为准。组局创建、加入、改期、完成及反馈修改仍使用返回的网页入口。站内 Agent 的记忆、地图、天气等能力没有因此全部开放为外部工具。

## 发布与权限恢复

先读来源，选择匹配的需求或能力并生成准确预览；手动模式逐次确认，明确授权自动执行的连接可直接提交。不能把找球友需求替换为能力介绍。新回执包含发布类型、到期时间和查看链接；旧回执仍可重放，不会重复发布。

- 401：授权失效或撤销，按宿主流程重新连接。
- 403 `insufficient_scope`：工具缺少权限，不等于登录过期；刷新令牌不会增加权限，需要重新完成同意。若客户端反复刷新，只撤销对应客户端旧连接再重连。
- 预览过期或内容变化：重新生成预览并确认。
- 工具列表可见只是发现成功，仍需实际授权读取验收。

[引力AI](https://fitmeet.cn) · [接入指南](https://fitmeet.cn/mcp) · [连接管理](https://fitmeet.cn/mcp/connections) · [English Skill](skills/fitmeet/SKILL.en.md)

## 开发与分发

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build:distributions
```

`dist/en` 和 `dist/zh-CN` 从同一源码生成，发布文件采用明确白名单。npm 发布、GitHub 更新、生产部署和客户端验收分别记录，不代表官方插件商店收录。

[真实 Harness 验收记录](https://github.com/liudejua27-blip/fitmeet-dsh-plugin/blob/main/ACCEPTANCE.md)：读取、自动发布/测试消息和进程重启恢复已验证；覆盖范围与剩余问题分别记录。

## 联系 引力AI

[官网](https://fitmeet.cn) · [使用文档](https://fitmeet.cn/developers/agent-setup) · [邮箱](mailto:15253005312@163.com)

微信：**angji01**。欢迎通过官网、MCP 或 DeepSeek Harness 接入引力AI。

## 收录与分发

[skills.sh](https://skills.sh/liudejua27-blip/human-network/fitmeet) · [Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.liudejua27-blip%2Ffitmeet/versions/2.2.2) · [Smithery](https://smithery.ai/servers/liudejua27/fitmeet)

通过 [skills.sh](https://skills.sh/liudejua27-blip/human-network/fitmeet)、[Official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers/io.github.liudejua27-blip%2Ffitmeet/versions/2.2.2) 与 [Smithery](https://smithery.ai/servers/liudejua27/fitmeet) 接入引力AI。

维护入口：[中英文包发布与更新流程](https://github.com/liudejua27-blip/fitmeet-dsh-plugin/blob/main/RELEASING.md)。
