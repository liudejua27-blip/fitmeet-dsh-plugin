<p align="center">
  <img src="assets/fitmeet-icon.png" width="112" alt="FitMeet logo" />
</p>

<h1 align="center">FitMeet for DeepSeek Harness</h1>

<p align="center">
  可安装的 FitMeet MCP + Skill 插件。<br />
  Search a consent-based human network, publish, and manage direct messages from DeepSeek Harness.
</p>

<p align="center">
  <a href="https://fitmeet.cn">FitMeet</a> ·
  <a href="https://fitmeet.cn/mcp">MCP 指南</a> ·
  <a href="skills/fitmeet/SKILL.md">Skill</a> ·
  <a href="https://github.com/liudejua27-blip/fitmeet-dsh-plugin/releases/latest">最新版</a>
</p>

![FitMeet MCP](docs/images/fitmeet-mcp.png)

这个项目不是把一个 URL 当作文件上传。它是一个符合 DeepSeek Harness Bundle 结构的可安装插件，包含：

- FitMeet 远程 Streamable HTTP MCP 连接器；
- 每位用户独立的 OAuth 2.1 + PKCE S256 浏览器授权；
- Dynamic Client Registration、Token 刷新与本地凭据保存；
- 按当前授权发现、注册与调用 FitMeet MCP 工具（服务端现有 17 项；新权限需重新授权）；
- 内置的 `fitmeet` Agent Skill 和写操作确认规则；
- 可被 DeepSeek Harness 社区插件目录发现的 `dsh-plugin` 包元数据。

生产 MCP 地址固定为 `https://api.fitmeet.cn/api/v1/mcp`。插件不会内置共享 Token，也不会要求用户复制 Access Token。

## 安装

需要 Node.js 22.19 或更高版本。推荐直接从 npm 安装：

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add fitmeet-dsh-plugin
npx --yes @deepseek-ai/dsh@latest web
```

第一次启动时，插件会打开 FitMeet 授权页。用户登录自己的 FitMeet 账号、查看权限并同意后，Harness 才会注册 `mcp__fitmeet__...` 工具。授权记录和 Token 由该用户设备上的 DeepSeek Harness credential service 保存。

安装固定版本：

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add fitmeet-dsh-plugin@0.1.2
```

也可以直接从 GitHub 安装：

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add github:liudejua27-blip/fitmeet-dsh-plugin#v0.1.2
```

验证配置层：

```sh
npx --yes @deepseek-ai/dsh@latest --profile web --dump-config
```

卸载：

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web remove fitmeet-dsh-plugin
```

## 可以做什么

| 场景 | Harness 中的工具名 |
| --- | --- |
| 读取本人资料 | `mcp__fitmeet__fitmeet_profile_get` |
| 搜索用户、需求与能力 | `mcp__fitmeet__fitmeet_people_search` |
| 查看候选详情 | `mcp__fitmeet__fitmeet_people_details` |
| 查看可发布内容 | `mcp__fitmeet__fitmeet_publication_sources` |
| 生成发布预览 | `mcp__fitmeet__fitmeet_publication_prepare` |
| 确认发布 | `mcp__fitmeet__fitmeet_publication_confirm` |
| 读取会话 | `mcp__fitmeet__fitmeet_conversations_list` |
| 读取消息 | `mcp__fitmeet__fitmeet_messages_list` |
| 准备新私聊 | `mcp__fitmeet__fitmeet_chat_prepare` |
| 确认建立私聊 | `mcp__fitmeet__fitmeet_chat_confirm` |
| 生成消息预览 | `mcp__fitmeet__fitmeet_message_prepare` |
| 确认发送准确正文 | `mcp__fitmeet__fitmeet_message_confirm` |

可以直接对 Agent 说：

- “帮我找一位在青岛做 AI 产品设计的人。”
- “看看有哪些人也想周末徒步和拍照。”
- “把我确认过的能力发布到大厅，先给我看预览。”
- “打开我和这位用户的私聊，但先不要发消息。”
- “把这段消息展示给我，我确认后再发送。”

## OAuth 权限

0.1.2 支持以下六项可选 scope；默认安装请求全部六项，由用户在 OAuth 页面决定是否授权。也可以选择非空权限子集：

```text
profile:read people:search hall:publish messages:read messages:write social:read
```

授权链路：

```mermaid
flowchart LR
  Install[安装插件] --> Start[启动 Harness]
  Start --> Browser[打开 FitMeet OAuth]
  Browser --> Consent[用户登录并授权]
  Consent --> Callback[本机 loopback callback]
  Callback --> Credentials[Harness 凭据库]
  Credentials --> Tools[注册当前授权可见工具]
```

OAuth 只允许 Agent 请求相应能力，不代表用户同意某一次发布、建立私聊或发送消息。写操作必须遵循：

1. 调用对应的 `prepare` 工具；
2. 展示准确的对象、范围或完整正文；
3. 在当前交互中取得用户明确确认；
4. 原样提交确认标识和摘要到对应的 `confirm` 工具。

用户修改内容后必须重新生成预览。建立私聊只创建空会话，不会自动发送消息。

## 隐私

只有资料本人开启 external discovery 后，有限资料才可能出现在外部 Agent 搜索结果中；该设置默认关闭并可撤销。搜索结果是帮助用户判断的资料，不代表候选人同意联系。

插件不提供修改资料、支付、预约、管理员操作、群发或自动邀请。详见 [`skills/fitmeet/SKILL.md`](skills/fitmeet/SKILL.md) 与 [`SECURITY.md`](SECURITY.md)。

## 插件结构

```text
fitmeet-dsh-plugin/
├── package.json             # dsh.bundle 声明
├── cordis.patch.yml         # 安装到 profile 的插件配置层
├── lib/                     # 已构建的可执行文件，安装时无需运行构建脚本
├── src/                     # OAuth MCP 连接器源码
├── skills/fitmeet/SKILL.md  # 内置 FitMeet Skill
├── mcp.json                 # 其他 MCP 宿主可复用的基础配置
└── assets/                  # FitMeet 图标
```

## 开发验证

```sh
corepack enable
pnpm install
pnpm check
pnpm pack --dry-run
```

本项目提交已构建的 `lib/`，且没有 `prepare`、`postinstall` 等安装生命周期脚本。用户从 GitHub 安装时无需允许第三方构建脚本。

DeepSeek Harness 仍处于 Developer Preview，官方提示后续可能有破坏性变化。插件当前以 `@deepseek-ai/dsh@0.1.5-rc.1` 作为验证基线。

## 官方资料

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
- [Package and install a plugin](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/user/develop/basic/publish.md)
- [Skill subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/skills.md)
- [Community plugins](https://github.com/topics/dsh-plugin)

## 许可证

MIT。OAuth MCP 连接层基于 MIT 许可的社区实现改造；完整归属见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。

## MCP 2.1 能力更新（2026-09-12）

服务当前提供 17 个工具，完整清单和每项权限见 [service.json](service.json)。网站、通用配置包与本仓库共用这份公开说明；运行时的 `tools/list` 才是当前授权实际可见的工具。

新增 `social:read` 工具：

| 工具 | 用途 |
| --- | --- |
| `fitmeet_groups_list` | 查询本人组局或允许外部发现的公开组局 |
| `fitmeet_group_get` | 读取可见组局信息；不读取群消息或成员名单 |
| `fitmeet_notifications_get` | 读取本人未读汇总与通知设置 |
| `fitmeet_my_items_list` | 分页读取本人连接事项 |
| `fitmeet_connection_feedback_get` | 读取本人连接反馈 |

已有连接不会自动获得新权限。组局创建、加入、改期、完成和反馈修改，使用服务返回的 FitMeet 页面入口完成。读取提醒是当前快照，不代表后台持续监控。0.1.2 已更新插件的权限校验和内置 Skill；工具实际可见范围以当前账号授权为准，真实账号逐项调用仍需在对应客户端验收。

了解实际使用：[AI 同行交流](https://fitmeet.cn/scenes/ai-peers)、[组局与群聊](https://fitmeet.cn/gatherings)。

## 从 0.1.1 升级

安装上面的固定新版并重启对应 Harness profile；现有 profile 中保存的插件配置可能仍为旧五权限，需要在该插件的 scope 配置中增加 social:read。更新安装包不会替你改写现有配置或自动授予新权限。

0.1.2 接受原有五权限以及任意非空的有效权限子集，例如只读社交设置 `scope: 'social:read'`，或只找人设置 `scope: 'people:search'`。重复或未知权限会被拒绝。默认安装配置包含六权限，只申请任务所需的范围即可。

权限配置变化后，插件不会继续使用不对应的旧凭据，而会要求浏览器重新授权。保持原五权限配置时可继续复用原授权。用户只批准部分权限时，插件尊重实际授予的工具范围，不反复强求全权限。

新安装包包含 `skills/fitmeet/references/setup.md` 和 `service.json`。包发布、安装和服务端工具可用，与应用商店收录、真实账号逐项调用，是不同的状态。
