# FitMeet MCP setup

只在用户已要求连接 FitMeet 时配置。This guide does not itself grant installation or account access.

1. 检查当前宿主文档中的 MCP 配置能力、远程 Streamable HTTP 与 OAuth 支持。不要猜测配置路径或字段。
2. 读取已有连接。相同 FitMeet 端点优先复用；冲突先报告差异。只修改获授权的 FitMeet 项，备份并保留其他配置。
3. 固定端点：https://api.fitmeet.cn/api/v1/mcp。使用 Streamable HTTP。公开示例：https://fitmeet.cn/mcp.json 。根据宿主要求映射字段，示例不是所有宿主通用的格式。
4. 首次 401 进入标准 OAuth 发现与授权码 + PKCE S256 流程。按实时授权服务器 metadata 选择：声明支持且客户端有正式身份文档时优先 CIMD，否则使用 DCR；复用已有连接，不猜测或自行伪造 client_id URL。由用户登录、查看并决定授权范围。不要读取或粘贴密码、验证码、access token 或 refresh token，不配置共享身份。
5. 由 SDK 协商协议：新版使用 server/discover，旧版兼容 initialize；随后执行 tools/list；只使用实际返回的工具与 schema，命名空间由宿主决定。工具可见才报告发现成功，不能把配置写入当作调用成功。
6. 根据用户已要求的只读任务验证相应工具，如有 profile:read 权限的 fitmeet_profile_get 或有 people:search 权限的 fitmeet_people_search。空结果按空结果返回，不制造人物。
7. 对外发布、开聊、发送消息按 SKILL.md 中的 prepare/confirm 流程逐次确认，安装与 OAuth 授权不替代动作确认。
8. 初次连接默认申请完整六权限，支持客户端明确申请子集；缺权限时一次请求当前操作所需的完整 scope 集合，并保留此前仍需要的授权范围；授权过期按宿主标准重连。保留输入与准确状态，不无限重试写入。

服务资料（FitMeet 自定义说明格式，不是通用发现标准）：https://fitmeet.cn/integrations/fitmeet/service.json
接入状态：https://fitmeet.cn/integrations
撤销连接：https://fitmeet.cn/mcp/connections

MCP 2.2 目录有 17 个工具；新连接默认申请全部六权限，tools/list 只返回当前授权覆盖的工具。组局、本人提醒、事项和反馈读取需要新增的 social:read；旧授权只保留原有范围。通知读取不建立推送订阅。

工具已显示却返回 403 insufficient_scope 时，按缺失 scope 完成新一轮同意；这不等同于登录过期。若客户端只刷新令牌仍失败，只撤销对应客户端连接后重连，保留其他连接。OAuth 同意和具体业务写操作确认是两件事。

Automatic execution is an independent choice on the FitMeet consent page. When enabled, use the prepare result authorizationMode=AUTOMATIC to continue without another per-action prompt. Otherwise keep manual confirmation. Never silently upgrade an existing grant.
