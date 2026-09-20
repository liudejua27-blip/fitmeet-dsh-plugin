<p align="center"><img src="https://raw.githubusercontent.com/liudejua27-blip/fitmeet-dsh-plugin/main/assets/fitmeet-icon.png" alt="FitMeet" width="88"></p>

# FitMeet for DeepSeek Harness

[English](README.en.md) | [简体中文](README.zh-CN.md)

**找同好、找球友、找能帮你的人，让连接从一句话开始。**

**[立即使用 FitMeet](https://fitmeet.cn) · [连接你的 Agent](https://fitmeet.cn/mcp) · [中文 npm](https://www.npmjs.com/package/fitmeet-dsh-plugin-zh) · [English npm](https://www.npmjs.com/package/fitmeet-dsh-plugin)**

## 让 DeepSeek Harness 帮你找到一起行动的人

想打球却缺个搭子？有件事想找人帮忙？把 FitMeet 加入 Harness，从描述需求到搜索人选、查看详情、联系对方，在同一段对话里推进。

- **找同好与球友**：搜索人物、公开需求和能力，查看匹配依据。
- **把需求带给更多人**：发布已确认的需求或能力，拿到可查看的结果链接。
- **把连接继续下去**：查看私聊、组局和提醒，按授权发起联系。

## 现在开始

1. 安装下方中文插件，启动 Harness。
2. 在弹出的 FitMeet 页面登录并选择权限。
3. 回到对话，发送：**“使用 FitMeet，帮我找青岛的羽毛球球友。”**

## 安装

需要 Node.js 22.19+ 和 DeepSeek Harness。选择一个语言包安装，勿同时启用两个同名连接。

```sh
npx --yes @deepseek-ai/dsh@latest plugin --profile web add fitmeet-dsh-plugin-zh@0.2.1
npx --yes @deepseek-ai/dsh@latest web
```

[中文 npm](https://www.npmjs.com/package/fitmeet-dsh-plugin-zh) · [English npm](https://www.npmjs.com/package/fitmeet-dsh-plugin)

首次启动在浏览器登录 FitMeet、查看并决定授权范围，无需复制 Token。默认请求六类权限，也可配置非空 scope 子集；新功能不会自动增加旧授权。凭据由本机 Harness credential service 保存。

豆包、WorkBuddy 等通用 MCP 客户端直接配置远程服务，不需要这个 Harness 插件：

```text
https://api.fitmeet.cn/api/v1/mcp
```

## 连好后，试着这样说

- “使用 FitMeet，帮我找青岛的羽毛球球友。”
- “看看我有哪些已确认的需求或能力可以发布到 FitMeet。”
- “查看我的 FitMeet 组局和提醒。”
- “帮我联系这个人，问问周末能不能一起打球。”

以上是使用示例，不代表平台一定有对应人选。搜索依据用户允许被发现的信息，发布和发消息按照你为该连接授予的权限执行。

## 选择你的使用方式

| 使用方式 | 从这里开始 |
| --- | --- |
| 直接体验 FitMeet | [打开 FitMeet](https://fitmeet.cn) |
| 豆包、WorkBuddy 等兼容 MCP 客户端 | 添加 `https://api.fitmeet.cn/api/v1/mcp` 并登录；[连接指南](https://fitmeet.cn/mcp) |
| DeepSeek Harness | 使用上方命令，安装一个语言版本的 FitMeet 插件 |

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

[FitMeet](https://fitmeet.cn) · [接入指南](https://fitmeet.cn/mcp) · [连接管理](https://fitmeet.cn/mcp/connections) · [English Skill](skills/fitmeet/SKILL.en.md)

## 开发与分发

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build:distributions
```

`dist/en` 和 `dist/zh-CN` 从同一源码生成，发布文件采用明确白名单。npm 发布、GitHub 更新、生产部署和客户端验收分别记录，不代表官方插件商店收录。
