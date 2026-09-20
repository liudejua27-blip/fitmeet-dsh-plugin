# FitMeet Harness release procedure / 插件发布流程

[完整中文流程](https://github.com/liudejua27-blip/FitMeet-UI/blob/main/docs/MCP_DISTRIBUTION_RUNBOOK.md) · [Cross-channel status](https://github.com/liudejua27-blip/FitMeet-UI/blob/main/docs/RELEASE_STATUS.md)

Publish both `fitmeet-dsh-plugin` (English) and `fitmeet-dsh-plugin-zh` (Chinese) when bundled runtime, Skill, references or package documentation needs a new distribution. Their version numbers match each other; they need not match the MCP or Skill version.

## Prepare and verify

1. Inspect the working tree and preserve unrelated edits. Compare the runtime contract, `service.json`, `mcp.json`, both Skill languages, references and website instructions.
2. Bump `package.json` to a new version and update CHANGELOG and bilingual installation examples. Update the lockfile if dependencies change. Never overwrite a published version.
3. From this repository, run:

```sh
pnpm install --frozen-lockfile
pnpm build:distributions
node scripts/fitmeet-public-contract.mjs --live
```

`build:distributions` runs typecheck, tests, build and the local public contract check, then creates and inspects the English and Chinese tarballs. Use the reported artifact paths and integrities; inspect their file lists and locale metadata. The live check requires the matching backend contract to be deployed first. For coordinated releases, complete local checks first, deploy the API, then run the live check before publishing the plugin.

For cross-repository checks, pass `--runtime` with the actual FitMeet local-agent directory and `--package` with the human-network directory to `scripts/fitmeet-public-contract.mjs`.

## Publish and read back

1. Commit reviewed source and generated tracked `lib` changes. Push the corresponding commit. Keep credentials, OAuth state and account data out of commits and release assets.
2. Complete npm's official login when required. Publish each **verified tarball** with public access, following current CLI authentication requirements. The distributions have no install scripts; the build and checks must already have run. Never paste credentials into chat.
3. Read back each package separately:

```sh
npm view fitmeet-dsh-plugin@<VERSION> version dist.integrity --json
npm view fitmeet-dsh-plugin-zh@<VERSION> version dist.integrity --json
```

Replace `<VERSION>` with this release's actual version. Compare each integrity with its own tarball; the two language artifacts intentionally differ. If only one package published successfully, check the registry before retrying and publish only the missing artifact.

4. Create and push the corresponding `v<VERSION>` tag without rewriting an existing tag. Publish a GitHub Release with both tarballs and bilingual notes covering behavior, verification and remaining limitations.
5. Update installation commands and version references in the website, human-network and FitMeet-UI current release records. An npm README is part of its package; changing GitHub README alone does not replace it.

## Real-host acceptance and directory updates

Use the current official Harness CLI to install the exact new package version in a test host. Restart the host and verify loaded version, restored OAuth connection, refreshed tool list and a real read. Verify new permission consent or an authorized business write when the change requires it; tool visibility does not prove those paths.

A published package does not automatically replace existing installations. Keep a known-good package version available for explicit client rollback, and publish a new patch for corrections instead of rewriting a version or Git tag.

Review skills.sh, Official MCP Registry, Smithery and Glama using the canonical runbook. Pure plugin changes may not require a remote directory update, but record that decision. Do not list these npm packages as generic stdio MCP servers: FitMeet's MCP service is the authenticated remote HTTPS endpoint.

Record both package versions/integrities, Git commit/tag/release, host version, tested actions and pending items. Package publication, host acceptance and directory listing are separate completion stages.

中文执行要点：先同步工具清单和双语资料 → 完成构建及验证 → 发布中英文两个 npm 包 → 读回版本和完整性 → 推送对应 GitHub 标签与 Release → 升级真实宿主并重启验证 → 同步受影响的网站、Skill、目录和发布记录。没有受影响的渠道填写“不适用”及原因。
