# Changelog

## 0.1.2 — 2026-09-12

- Support `social:read` for visible groups, personal notifications, connection items and feedback. The service currently exposes 17 tools; discovery remains limited by each user's grant.
- Accept any nonempty, unique subset of the six supported scopes, including legacy five-scope configurations. Preserve the configured subset when SDK discovery advertises broader capabilities.
- Require a fresh authorization when the configured permission set changes; do not reuse an old access or refresh token for a different requested scope set. Respect partial grants without repeatedly forcing full consent.
- Ship the updated Skill, its setup reference and the public service manifest in the npm package.
- Extend model guidance to social discovery and read-only follow-up; group actions and settings changes remain in the returned FitMeet pages.

Upgrading the package does not automatically edit an existing Harness profile or grant additional permissions. Review the plugin's scope setting and complete browser OAuth when requested.

Validation: configuration, OAuth state migration, narrowing, subset authorization, existing loopback/transport tests, build, package contents and public production metadata. These checks are not a claim that every new tool has been exercised with a real user account or that a marketplace has indexed the release.
