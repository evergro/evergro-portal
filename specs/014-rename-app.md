# Keep the app name `portal`

Date: 2026-11-23, decided 2026-11-27
Status: **Done. Not renamed.**

## Problem

The global rule gives every Evergro app the prefix `evergro_`. This app is `portal` with the module `Evergro`. An earlier warning said ERPNext also has a module called `portal`.

## Decision

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Rename to `evergro_portal` | No. The app stays `portal` and the repo stays `evergro/evergro-portal`. A rename changes every import, hook, fixture and method path (`portal.api.portal.*`) and does nothing for customers |
| 2 | Global naming rule | This app is an exception, recorded in `AGENTS.md` |
| 3 | Module clash | The app's module is `Evergro`, not `portal`, so its doctypes do not share a module name with ERPNext |

## Out of scope

- Renaming the GitHub repo or the `/portal` URL.

## Progress

- 2026-11-27: Decided not to rename.
