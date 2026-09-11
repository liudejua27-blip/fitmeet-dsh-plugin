---
name: fitmeet
display_name: FitMeet 人与需求连接
display_name_en: FitMeet People & Needs
description: 在用户授权与逐次确认后，搜索合适的人和需求、发布到大厅，并管理 FitMeet 私聊。
description_zh: 在用户授权与逐次确认后，搜索合适的人和需求、发布到大厅，并管理 FitMeet 私聊。
description_en: With user authorization and per-action confirmation, search people and needs, publish to the Hall, and manage FitMeet direct messages.
allowed-tools: fitmeet_profile_get, fitmeet_people_search, fitmeet_people_details, fitmeet_publication_sources, fitmeet_publication_prepare, fitmeet_publication_confirm, fitmeet_conversations_list, fitmeet_messages_list, fitmeet_chat_prepare, fitmeet_chat_confirm, fitmeet_message_prepare, fitmeet_message_confirm
version: 1.1.0
author: FitMeet
---

# FitMeet

帮助用户寻找合适的人、需求与能力，并在用户明确确认后发布内容或进行一对一私聊。FitMeet 服务负责账户权限、可见范围、搜索证据、封禁校验和最终写入；外部 Agent 负责理解意图、展示预览并取得确认。

只有当前会话已连接 FitMeet 并完成浏览器 OAuth 授权后才能调用。不要索要、展示或粘贴密码、验证码、access token、refresh token 或客户端密钥。遇到 `401`、授权过期或撤销时，引导用户使用宿主的“重新连接”流程。

## 工具与权限

| 工具 | 用途 | scope |
| --- | --- | --- |
| `fitmeet_profile_get` | 读取当前授权用户自己的资料摘要 | `profile:read` |
| `fitmeet_people_search` | 搜索人、大厅需求或大厅能力，最多返回 5 项 | `people:search` |
| `fitmeet_people_details` | 查看当前有效搜索中的候选详情 | `people:search` |
| `fitmeet_publication_sources` | 列出本人可发布的已确认资料与需求 | `hall:publish` |
| `fitmeet_publication_prepare` | 生成发布预览，不会发布 | `hall:publish` |
| `fitmeet_publication_confirm` | 提交用户刚刚确认的发布预览 | `hall:publish` |
| `fitmeet_conversations_list` | 列出本人的一对一会话 | `messages:read` |
| `fitmeet_messages_list` | 读取或搜索本人某段会话的消息 | `messages:read` |
| `fitmeet_chat_prepare` | 为搜索结果生成开启空会话的预览 | `people:search` + `messages:write` |
| `fitmeet_chat_confirm` | 提交用户刚刚确认的开聊预览；不发消息 | `people:search` + `messages:write` |
| `fitmeet_message_prepare` | 生成收件人与完整正文预览，不会发送 | `messages:write` |
| `fitmeet_message_confirm` | 发送用户刚刚确认的准确正文 | `messages:write` |

工具可能带有宿主添加的命名空间，以当前连接的 `tools/list` 为准。只申请完成当前任务所需的 scope；旧的只读连接无需申请写权限。

## 搜索

没有固定调用顺序。用户目标清楚时直接调用所需的最少工具；缺失信息会明显改变结果时，只问一个最关键的问题。

`fitmeet_people_search` 的 `requestText` 必须保留本次搜索相关的完整用户要求。可选参数包括 `location`、`timeWindow`、`source`、`maximumResults`、`primaryIntent`、`candidateBottomLines` 和 `continuationToken`。`source` 可为 `PEOPLE`、`HALL_NEEDS` 或 `HALL_CAPABILITIES`。不要把简化参数与旧版 `query` 对象混用。

相同且未过期请求的网络重试可复用 `requestId`；目标或条件变化时使用新的 `requestId`。`fitmeet_people_details` 只接受当前搜索返回的 `queryId` 与 `candidatePresentationIds`，不得猜测标识或跨连接复用。

候选人必须由本人开启外部发现／外部推荐许可。搜索者的 OAuth 授权、站内可见性或历史结果不能替代候选人的披露许可。候选资料只是待核对信息，不代表同意联系。

## 发布流程

1. 调用 `fitmeet_publication_sources`，只选择本人已确认的资料能力或 Need。
2. 调用 `fitmeet_publication_prepare`。向用户完整展示返回的发布类型、摘要、受众、是否接受咨询、是否允许 AI 推荐。
3. 清楚询问用户是否确认发布这份预览。
4. 只有用户在当前交互中明确同意后，才把原样返回的 `confirmationId`、`confirmationDigest` 与 `confirmed: true` 交给 `fitmeet_publication_confirm`。

OAuth 同意不等于本次发布确认。用户修改任一字段后必须重新 prepare。不得发布任意临时文字；新需求要先在 FitMeet Agent 中形成并确认 Need。

## 私聊流程

搜索后需要联系候选人时，先调用 `fitmeet_chat_prepare`，向用户展示姓名并说明只会开启空会话。用户明确同意后调用 `fitmeet_chat_confirm`。开启会话不代表已发消息，也不需要对方先接受邀请。

发送内容时必须再次调用 `fitmeet_message_prepare`，向用户展示收件人和完整正文。只有用户确认这段准确文字后才能调用 `fitmeet_message_confirm`。用户改字、改收件人或表达犹豫时，重新 prepare；不得把“帮我看看”“可以联系吗”等含糊表达视为发送确认。

读取历史使用 `fitmeet_conversations_list` 与 `fitmeet_messages_list`。不得补造联系方式，不得把私聊正文复制到公开回复或其他工具。

## 返回状态与恢复

解释搜索依据、未知条件和可查询范围，不自行编造分数或平台总人数。未连接、未执行、超时、鉴权失败、服务错误，以及缺失或 `NOT_COMPUTED` 的计数，都不等于零结果。

- `MCP_SEARCH_EXPIRED` 或 `MCP_SEARCH_SOURCE_CHANGED`：使用新的 `requestId` 重新搜索，即使目标没有变化。
- `MCP_SEARCH_NOT_AVAILABLE`：不能通过猜测其他标识恢复。
- `MCP_CONFIRMATION_STALE`：确认已过期、已失效或不属于当前连接；重新生成预览并再次取得用户确认。
- `MCP_ACTION_IDEMPOTENCY_CONFLICT`：修改后的操作必须使用新的 `requestId`。
- `MCP_RESOURCE_PAUSED` 表示操作尚未完成；遵守回执 `retryAfterSeconds` 的等待时间，或告知用户稍后重试，不主动循环重试。

## 能力边界

本连接器不会修改个人资料、自动创建或确认 Need、自动联系用户、自动发消息、自动邀请或自动发布。它不提供预约、支付、管理员、封禁、举报、日历写入或群发能力。发布和私聊只允许通过对应的 prepare → 用户明确确认 → confirm 流程，并且确认凭证绑定当前账号、客户端和 OAuth 授权，短期有效且只能消费一次。

没有 `executed: true` 和最终回执时，不得声称已发布、已开聊或已发送。`fitmeet_chat_confirm` 返回 `messageSent: false` 时必须准确说明会话已开启但消息尚未发送。不得借用其他工具绕过这些边界。
