# FitMeet Harness acceptance · 2026-09-20

[English](#english) | [简体中文](#简体中文)

## 0.2.2 update / 0.2.2 更新

The server now returns capability publication state, expiry and the exact viewing URL. Isolated PostgreSQL tests cover unpublished, active, expired, changed-source and terminal states, including owner isolation (4/4). The existing MCP unit suite passes (37/37); plugin checks pass (14/14).

An initial candidate still opened in English and was not accepted. The final candidate uses a separate always-loaded response-style section, including the first sentence before loading a Skill. Three real Harness rounds (Chinese → English → Chinese) each used one publication-source query and preserved the full URL. Chinese opening was observed; final replies were 2–3 short sentences, about 3/1/1 seconds per round. These are small samples, not a latency or zero-error guarantee. Some replies still repeat ACTIVE or add a redundant read-only disclaimer; follow-up evaluation remains necessary. The host's expanded reasoning display is separate from user-facing progress and can still be English.

服务端已补能力发布状态、到期时间与完整链接；4 项隔离数据库回归、37 项 MCP 单元测试、14 项插件检查通过。初版候选仍英文开场，没有算通过；最终候选把回复约定作为独立常驻段落加载。真实 Harness 三轮中文→英文→中文测试，中文开场生效，每轮只查询一次发布来源，链接目标完整，最终回复约 2–3 个短句。仍偶有内部状态枚举和多余的只读说明；宿主展开后的推理文字也可能是英文，不把小样本表述为彻底消除所有回复问题。

Both npm distributions are 0.2.2; Skill 1.3.2 is mirrored in public integration docs. The 0.2.1 results below remain historical evidence.

## English — 0.2.1 baseline

The installed English plugin 0.2.1 was exercised inside the official DeepSeek Harness 0.1.5-rc.2 web host against FitMeet production, using owner-authorized test accounts.

Verified: saved OAuth grant with six scopes and automatic execution; profile, publication sources and conversations; one capability publication and one test message through prepare → AUTOMATIC confirm; independent production readback; host process restart and subsequent authenticated reads without another FitMeet sign-in. The test message remained a single stored message. This does not establish push delivery.

A server-side nonempty connection-items output validation bug was found and fixed. After deployment, the same host called `fitmeet_my_items_list({})` once and received three valid items. Plugin code and npm versions did not change; both English and Chinese packages remain 0.2.1. This acceptance document is a later GitHub update, not a replacement of an existing npm tarball.

Limits: nine tool types exercised, not all seventeen; Chinese distribution not independently rerun; first-time OAuth consent and refresh-token rotation not repeated in this run. The current capability-source result does not expose publication status, so independent server readback was required. Occasional English progress text, verbose protocol details and a model-shortened broken link remain response-quality issues. Official marketplace listing is not verified.

## 简体中文

本轮在官方 DeepSeek Harness 0.1.5-rc.2 中运行英文插件 0.2.1，连接正式 FitMeet 服务，使用用户明确授权的测试账号。

已验证：保存的六类权限及自动执行授权；资料、可发布来源和会话读取；一次能力发布和一条测试消息按 prepare → AUTOMATIC confirm 完成；服务器独立读回；重启宿主进程后无需再次登录即可继续读取。测试消息仍只有一条；这不代表设备推送送达。

发现并修复服务端“我的连接事项”非空结果校验失败。部署后，同一 Harness 空参数调用一次成功读取三条事项。插件代码未改，中英文 npm 仍为 0.2.1；本验收记录是后续 GitHub 文档更新，没有覆盖已发布 npm 包。

边界：实际覆盖九种工具，不等于十七种全部验收；中文包未独立复测；本轮没有重做首次授权弹窗或刷新令牌轮换。能力来源暂不提供发布状态，因此本次独立读回通过服务器完成。英文过程提示、内部字段复述、回复偏长及模型把链接标识省略造成失效等体验问题仍需优化。官方插件商店收录未核实。
