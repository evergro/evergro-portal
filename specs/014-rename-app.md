# Rename the app to `evergro_portal`

Date: 2026-11-23
Status: **Decision pending. Do not start.**

## Problem

The global rule gives every Evergro app the prefix `evergro_`. This app is `portal` with the module `Evergro`. An earlier warning said ERPNext also has a module called `portal`.

## Decision

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | When | Later. The rename changes every import, the hooks, route rules, fixtures, method paths in the frontend (`portal.api.portal.*`) and the production install. It does nothing for customers |
| 2 | Do it | Before a second Evergro app imports from the portal |

## Phases

### Phase 0: is there still a clash?

- Search `evergro.local` for two modules named `portal` and check the install log for the warning. Record the answer.

### Phase 1: rename plan (only if Phase 0 shows a clash or the decision changes)

- List every use of `portal`: Python imports, `hooks.py`, fixtures, patches, route rules, the `config.apiPath` value in the frontend, the build output folder, and any n8n flow or email template that calls a method.
- Back up the database and the app folder. Rename on a copy of the site first. Run all backend, Vitest and Playwright suites.

## Out of scope

- Renaming the GitHub repo or the `/portal` URL.

## Progress

- [ ] Phase 0
