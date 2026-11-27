# App shell and navigation

Date: 2026-11-23
Status: **Draft.** The mockup has four tabs. This replaces the earlier three-tab plan.

## Problem

The shell and routes exist, but the header loads the customer on its own, logout does nothing on the server, deep links need the server to know every route prefix, and unknown paths silently go to Home.

## Goal

Four tabs (Home, Schedule, Support, Account) in a bottom bar on phones and a side nav on laptops. Every screen has a real URL that survives a refresh. Logout ends the server session.

## What the mockup already has

- Routes: `/portal`, `/portal/schedule`, `/portal/schedule/:id`, `/portal/support`, `/portal/account` and its sub-screens (`profile`, `password`, `properties`, `properties/:id`, `payments`, `payments/transactions`, `payments/card`, `payments/checkout`, `refer`, `notifications`, `notifications/:channel`), plus `/promo` and `/start/*`.
- `AppShell` with `SideNav`, `BottomNav`, and `PageHeader` that hides the tab bar on deeper screens.
- Tabs come from `config/navigation.ts`.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Tabs | Home, Schedule, Support, Account. The mockup wins over the older three-tab plan |
| 2 | Profile data | The header, side nav and Account screen share `useProfile()`. One request |
| 3 | Logout | `call("logout")` then go to `/`. Clear `sessionStorage` too |
| 4 | Unknown paths | A real Not found screen with a link to Home. The catch-all that redirects to `/portal` goes |
| 5 | Server routes | One route rule per prefix (`/portal`, `/promo`, `/start`) all served by the page `portal` (spec 002) |
| 6 | Page states | Every screen uses `AsyncState` for loading, error and empty |

## Phases

### Phase 0: facts

- List the routes the router declares and the routes the server serves. Open each route directly on `evergro.local:8000` as a customer and a guest. Record which 404.
- Record how `PageHeader` and `AccountView` fetch the customer today.

### Phase 1: server serves every prefix

- Add route rules for `/portal/<path:app_path>`, `/promo/<path:app_path>` and `/start/<path:app_path>`, and the bare `/portal` and `/promo`.
- Playwright: every route in the router opens directly and refreshes without a 404, as a guest for promo routes and as a customer for portal routes.

### Phase 2: shared profile and header

- `PageHeader`, `SideNav` and `AccountView` read `useProfile()`.
- Playwright: opening `/portal` makes one `get_profile` request (count network calls).

### Phase 3: real logout

- Replace `sessionStorage.clear()` plus navigate with `logout()` from spec 002.
- Playwright: log out, press back, `/portal` asks for login.

### Phase 4: Not found and deep screens

- Add a Not found screen. Check that deeper screens hide the tab bar and show the back button, and that Back on a directly opened page goes to its parent.
- Playwright at 390 px and 1280 px wide: tabs visible on the right layout only, `/portal/account/payments` back goes to `/portal/account`, an unknown path shows Not found.

### Phase 5: active tab from the route

- The active tab is computed from the route, not local state, so `/portal/schedule/<id>` keeps Schedule active.
- Vitest: path to active tab for every route in the router.

## Tests

- Vitest: active tab for every route.
- Playwright: `e2e/shell.spec.ts` at two viewport widths.

## Out of scope

- New screens, animations, PWA and push notifications.

## Open questions

None.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
