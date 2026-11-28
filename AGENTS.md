# Evergro Portal

Customer app for Evergro Landscapers. Read the global rules first (`~/.claude/CLAUDE.md`). This file only says what is specific to the portal. Details live in `specs/`, start at `specs/README.md`. How the app is built is in `ARCHITECTURE.md`. How to write the docs is in `DOCS.md`.

## Goal

A customer logs in and, without phoning the office, sees when the crew comes and what they did, manages their card and pays their invoices, and keeps their details up to date.

Everything in `specs/` serves that goal. Promo onboarding (spec 013) is a nice to have and is built last.

## What it is

A minimal customer app on Frappe/ERPNext v15: few screens, big clear cards, nothing extra (think Naked Insurance). Four tabs: Home, Schedule, Support and Account.

| URL | Who | What |
| :--- | :--- | :--- |
| `/` | Everyone | Public landing page (Jinja, `www/index.html`). It never redirects. Guests see **Log in**, logged-in users see **View dashboard** |
| `/login` | Everyone | The only login. A logged-in user is sent to their dashboard |
| `/portal/*` | Customers | The Vue app. A guest is sent to `/login` and back |
| `/app` | Staff | Frappe Desk. Not changed by this app. Customers are refused |
| `/promo`, `/start/*` | Guests | Promo onboarding in the same Vue app (spec 013, built last) |

Business facts: ZAR, about 17 recurring customers, weekly maintenance billed monthly in advance, not VAT-registered. Customers are `Website User` accounts with the `Customer` role.

## Where things are

| Thing | Value |
| :--- | :--- |
| Bench | `~/frappe-bench` (plain bench, no Docker in dev) |
| Dev site | `evergro.local` (v15 only for now) |
| Repo | GitHub `evergro/evergro-portal` |
| Frappe app / module | `portal` / `Evergro`. This app keeps the name `portal` without the `evergro_` prefix (spec 014) |
| Frontend | `apps/portal/frontend/`, Vue 3, Vite, Tailwind 3 and `frappe-ui`. Build output goes to `portal/public/portal` |
| API | `portal.api.portal` (customers), `portal.api.promo` (guests) |
| Specs | `specs/`. Every doctype and custom field is listed in `specs/data-model.md` |
| Docs | `docs/`, written by the rules in `DOCS.md` |

## Rules for this app

- Do exactly the phase you were asked for, then stop. Do not create screens, routes, APIs or doctypes that the current phase does not name.
- The UI is the Figma Make mockup ported to Vue. Keep its look. Change only where its data comes from, unless a phase says otherwise.
- Data comes from `portal.api.portal` through `createResource` from `frappe-ui`, in composables under `src/data/`. Views never call `fetch` or import `mockApi`.
- Use a `frappe-ui` component when we have no component for the job, or when its component does more than ours, fits the Evergro theme and makes the responsive layout easier. Otherwise keep the mockup component.
- The API returns the exact shape of `src/types/index.ts`. The types are the contract.
- The customer comes from the session, never from the client. Every `name` or `id` argument is checked for ownership (spec 003).
- Customers use `/portal`. Staff use `/app`. Guests see `/`, `/login`, `/promo` and `/start/*`.
- Never return, log or fetch with `get_all` the card `authorization_code`. It is a Password field.
- Use standard doctypes first. A new doctype or custom field is allowed only when `specs/data-model.md` lists it with the reason no standard one works.
- Fixtures hold custom fields. Doctypes live in the app. Patches are safe to run twice.
- Run `python3 scripts/generate_tree.py --write` after you add or remove files, so the tree in `ARCHITECTURE.md` stays current.
- Ask when a spec is unclear. Do not guess.

## Related apps

- `frappe_paystack`: payment pages, saved cards, charging a saved card. The portal and it share the site config key `google_maps_api_key`. Its `/promo/summer-special` page is replaced by spec 013.
- `evergro_core` (planned): brand tokens, the quote link page.
- `evergro_field` (planned): the crew app. It writes `Service Visit` records.

## Commands

| Task | Command |
| :--- | :--- |
| Frontend dev server | `npm run dev` in `frontend/` (port 8080, proxies to 8000) |
| Build the frontend | `npm run build` in `frontend/` |
| Type check | `npm run typecheck` in `frontend/` |
| Lint | `ruff check .` and `ruff format --check .` |
| End-to-end tests | `npm run test:e2e` in `frontend/` (set the `E2E_*` variables, see spec 001) |
| Backend tests | `bench --site evergro.local run-tests --app portal` |
| After any hook or route change | `bench --site evergro.local clear-cache && bench --site evergro.local clear-website-cache` |
