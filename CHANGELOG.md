# Changelog

## 0.2.2 — 2026-09-20

- Follow the conversation language from the first visible sentence, including before Skill loading.
- Prefer concise outcome-focused replies and preserve complete returned URLs in labeled links.
- Read capability publication state, expiry and URL using publication_sources; do not retry writes to check status.
- Keep all existing OAuth scopes, automatic execution, previews and idempotency controls.

## 0.2.1 — FitMeet for DeepSeek Harness

- Make the English and Chinese plugin descriptions lead with people, interests and practical use cases.
- Put Harness installation, browser sign-in and a copyable first request near the top of both READMEs.
- Align bundled Skill descriptions with optional per-connection automatic execution; keep the existing MCP tools and permissions.


## 0.2.0

- English and Chinese npm distributions from one source, with localized Skills and routing.
- Complete 17-tool documentation including groups, notifications, items and feedback.
- Permission recovery and publication type, expiry and viewing links.
- Stop repeated tool-discovery pagination while preserving existing tools.

## 0.1.2 — 2026-09-12

- Support `social:read` for visible groups, personal notifications, connection items and feedback. The service currently exposes 17 tools; discovery remains limited by each user's grant.
- Accept any nonempty, unique subset of the six supported scopes, including legacy five-scope configurations. Preserve the configured subset when SDK discovery advertises broader capabilities.
- Require a fresh authorization when the configured permission set changes; do not reuse an old access or refresh token for a different requested scope set. Respect partial grants without repeatedly forcing full consent.
- Ship the updated Skill, its setup reference and the public service manifest in the npm package.
- Extend model guidance to social discovery and read-only follow-up; group actions and settings changes remain in the returned FitMeet pages.

Upgrading the package does not automatically edit an existing Harness profile or grant additional permissions. Review the plugin's scope setting and complete browser OAuth when requested.

Validation: configuration, OAuth state migration, narrowing, subset authorization, existing loopback/transport tests, build, package contents and public production metadata. These checks are not a claim that every new tool has been exercised with a real user account or that a marketplace has indexed the release.
