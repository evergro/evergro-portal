# Architecture

How the Evergro Portal is built. Each section says what exists **today** and what a spec **plans**. When this file and the code disagree, the code is right: fix this file in the same commit.

## Overview

The portal is a Frappe app that gives Evergro customers one place to see their visits, pay and manage their account. A public Jinja landing page sits at `/`, the standard Frappe login at `/login` is restyled, and a Vue 3 single-page app is served at `/portal`. The Vue app reads data only through whitelisted methods in `portal.api.portal`, which work out the customer from the session and return the shapes in `frontend/src/types/index.ts`.

## Boundaries

| Question | Answer |
| :--- | :--- |
| Can it be installed alone? | No. It needs ERPNext and `frappe_paystack` |
| Needs | Frappe, ERPNext, `frappe_paystack` (cards and payment pages) |
| Frappe versions | v15 only for now |
| Touches Desk (`/app`) | No. Staff keep using Desk as it is |
| Used by | `evergro_field` (planned) writes `Service Visit` records the portal shows |

## How a request flows

```text
Browser
  │
  ├── /                 → portal/www/index.html + index.py      (Jinja, public)
  ├── /login            → portal/www/login.html + login.py      (Jinja, public)
  ├── /portal, /portal/* → portal/www/portal/index.html + index.py
  │                        loads the built Vue app from /assets/portal/portal/
  │                        │
  │                        └── Vue router picks the screen
  │                             └── composable in src/data/ (createResource)
  │                                  └── /api/method/portal.api.portal.<method>
  │                                       └── portal/services/<topic>.py
  │                                            └── ERPNext doctypes
  └── /app              → Frappe Desk (staff only)
```

**Today:** `role_home_page` in `hooks.py` sends a logged-in customer who opens `/` to the portal. **Planned (spec 001):** `/` renders the landing page for everyone, and one function, `get_dashboard_url(user)`, decides where **View dashboard** and the login go.

## Frontend

| Layer | Where | What it does |
| :--- | :--- | :--- |
| Entry | `frontend/src/main.ts` | Mounts the app and the router |
| Routes | `frontend/src/router/index.ts` | Every screen has a real URL under `/portal`, `/promo` or `/start` |
| Shell | `frontend/src/layouts/AppShell.vue` | Side nav on wide screens, bottom tab bar on phones. Tabs come from `config/navigation.ts` |
| Screens | `frontend/src/features/<area>/` | One responsive component per screen |
| Shared UI | `frontend/src/components/` | Cards, buttons, rows, badges from the mockup |
| Contract | `frontend/src/types/index.ts` | The shape every API method returns |
| Data | `frontend/src/data/` (planned, spec 002) | One composable per kind of data, built on `createResource` |
| Mock data | `frontend/src/services/mockApi.ts`, `promoApi.ts` | Fake data the mockup uses. Removed screen by screen |

Styling is Tailwind 3 with the `frappe-ui` preset (`tailwind.config.js`). Brand tokens are CSS variables in `frontend/src/index.css` (`--color-primary`, `--color-accent` and their soft versions). The landing and login pages have their own copy of the same colours. Both move to `evergro_core` when that app exists.

**Today:** screens read `mockApi.ts`, `main.ts` does not set up `frappe-ui`, and `package.json` does not match `node_modules` (spec 002 finding 6). **Planned (spec 002):** `setConfig("resourceFetcher", frappeRequest)`, the `frappe-ui/vite` plugin, the CSRF token in the boot data, and a `VITE_USE_MOCK_API` switch while screens move over.

## Backend

| Part | Where | What it does |
| :--- | :--- | :--- |
| Hooks | `portal/hooks.py` | Home page, route rules, fixtures |
| Pages | `portal/www/` | Landing, login and the host page for the Vue app |
| API | `portal/api/portal.py` | Thin whitelisted methods for logged-in customers |
| Guest API | `portal/api/promo.py` (planned, spec 013) | Rate-limited methods for the promo flow |
| Services | `portal/services/<topic>.py` (planned, spec 003) | The logic behind each method, one file per topic |
| Fixtures | `portal/fixtures/custom_field.json` | Custom fields on standard doctypes |

## DocTypes

### Owned by this app

**Today:** none. **Planned:** `Customer Notification Setting` (011), `Customer Referral` and `Evergro Portal Settings` (010), and `Promo Campaign`, `Service Area`, `Service Bundle`, `Service Bundle Include`, `Service Bundle Price` and `Promo Plan` (013). Fields and reasons are in [`specs/data-model.md`](specs/data-model.md).

### Shared with other apps

A shared doctype is used by more than one Evergro app. Each app creates it only if it does not exist yet, then uses it as its own. If it exists without a field this app needs, the install stops with an error that names the missing fields.

| DocType | Created by | Also used by |
| :--- | :--- | :--- |
| `Service Visit`, `Service Visit Task` (planned, spec 006) | The first of `portal` or `evergro_field` to install | `evergro_field` writes visits, the portal reads them |

### Edits to standard doctypes

| DocType | Field | Why | Status |
| :--- | :--- | :--- | :--- |
| `Contact` | `custom_birthday` | No standard birthday field on Contact | Today |
| `Paystack Customer Authorization` | `custom_default` | Marks the one active card | Today |
| `Customer` | `custom_referral_code` | The code a customer shares | Planned, 010 |
| `Address` | `custom_photo`, `custom_access_notes` | Property photo and gate notes | Planned, 008 |
| `Subscription` | `custom_service_address` | Ties a plan to one property | Planned, 008 |
| `Subscription Plan` | `custom_visits_per_month` | Frequency and price per visit | Planned, 008 |

## Hooks, routes and API

### Routes

| Route | Served by | Today | Planned |
| :--- | :--- | :--- | :--- |
| `/` | `www/index.py` | Landing for guests only | Landing for everyone (001) |
| `/login` | `www/login.py` | Logged-in users go to `/` | Logged-in users go to their dashboard (001) |
| `/portal/<path>` | `www/portal/index.py` via `website_route_rules` | Login required | Same |
| `/promo/<path>`, `/start/<path>` | the same page | Not sent to the Vue app, so a refresh fails (`/promo/summer-special` is a `frappe_paystack` page) | Route rules, no login (002, 004) |

### Whitelisted methods (`portal.api.portal`)

**Today:** `get_profile`, `update_profile`, `get_private_image`, `get_addresses`, `get_invoices`, `get_payment_methods`, `set_default_payment_method`, `remove_payment_method`. They find the customer through `Contact Email`. **Planned (spec 003):** every method finds the customer with `get_parents_for_user("Customer", user)` and checks ownership of every id. The full method map is in spec 003. The two card methods that break the one-card rule are removed in spec 009.

### Scheduled jobs and doc events

None.

## Security

- The customer comes from the session. No method takes a customer argument.
- Every record id from the client is checked against that customer, and a record that is not theirs answers "not found".
- Customers are `Website User` accounts, so Frappe refuses them at `/app`.
- The card `authorization_code` is a Password field. It is read only inside the server with `get_password` and never returned or logged.

## File tree

Generated by `python3 scripts/generate_tree.py --write`. Do not edit by hand.

<!-- tree:start -->
```text
portal/
├── .claude/
│   └── settings.local.json
├── docs/
│   ├── development/
│   │   ├── first-contribution.md
│   │   └── run-locally.md
│   ├── guides/
│   ├── images/
│   ├── introduction/
│   │   ├── how-it-works.md
│   │   └── what-is-the-portal.md
│   ├── reference/
│   │   ├── api.md
│   │   └── doctypes.md
│   └── index.md
├── frontend/
│   ├── .figma/
│   │   └── make/
│   ├── .vscode/
│   │   └── extensions.json
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppButton.vue
│   │   │   ├── AppCard.vue
│   │   │   ├── AppIcon.vue
│   │   │   ├── BeforeAfter.vue
│   │   │   ├── BottomTabBar.vue
│   │   │   ├── ConfirmDialog.vue
│   │   │   ├── ListRow.vue
│   │   │   ├── PageHeader.vue
│   │   │   ├── SideNav.vue
│   │   │   ├── StatusBadge.vue
│   │   │   ├── ThumbPage.vue
│   │   │   ├── ToastMessage.vue
│   │   │   └── ToggleSwitch.vue
│   │   ├── config/
│   │   │   └── navigation.ts
│   │   ├── features/
│   │   │   ├── account/
│   │   │   ├── home/
│   │   │   ├── promo/
│   │   │   ├── schedule/
│   │   │   └── support/
│   │   ├── layouts/
│   │   │   └── AppShell.vue
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── mockApi.ts
│   │   │   └── promoApi.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.vue
│   │   ├── index.css
│   │   ├── main.ts
│   │   └── vite-env.d.ts
│   ├── .claudeignore
│   ├── .gitattributes
│   ├── .gitignore
│   ├── .mise.toml
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── portal/
│   ├── api/
│   │   ├── __init__.py
│   │   └── portal.py
│   ├── config/
│   │   └── __init__.py
│   ├── evergro/
│   │   └── __init__.py
│   ├── fixtures/
│   │   └── custom_field.json
│   ├── patches/
│   │   └── __init__.py
│   ├── public/
│   │   ├── css/
│   │   ├── images/
│   │   │   ├── Logo Landscape Black.png
│   │   │   └── Logo Landscape White.png
│   │   ├── js/
│   │   └── portal/
│   │       ├── .vite/
│   │       ├── assets/
│   │       ├── favicon.svg
│   │       └── index.html
│   ├── templates/
│   │   ├── includes/
│   │   ├── pages/
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── www/
│   │   ├── portal/
│   │   │   ├── index.html
│   │   │   └── index.py
│   │   ├── index.html
│   │   ├── index.py
│   │   ├── login.html
│   │   └── login.py
│   ├── __init__.py
│   ├── hooks.py
│   ├── modules.txt
│   └── patches.txt
├── scripts/
│   └── generate_tree.py
├── specs/
│   ├── 001-login-landing-and-root-routing.md
│   ├── 002-frontend-foundation-and-config.md
│   ├── 003-customer-api-and-security.md
│   ├── 004-app-shell-and-navigation.md
│   ├── 005-home.md
│   ├── 006-schedule-and-service-visits.md
│   ├── 007-account-profile-and-password.md
│   ├── 008-properties.md
│   ├── 009-payments.md
│   ├── 010-referrals.md
│   ├── 011-notification-settings.md
│   ├── 012-support.md
│   ├── 013-promo-onboarding.md
│   ├── 014-rename-app.md
│   ├── _template.md
│   ├── data-model.md
│   └── README.md
├── .editorconfig
├── .eslintrc
├── .gitignore
├── .pre-commit-config.yaml
├── AGENTS.md
├── ARCHITECTURE.md
├── CLAUDE.md
├── DOCS.md
├── LICENSE
├── license.txt
├── pyproject.toml
└── README.md
```
<!-- tree:end -->

## Source of truth

- Decisions and plans: [`specs/`](specs/README.md)
- Doctypes and custom fields: [`specs/data-model.md`](specs/data-model.md), then `portal/evergro/doctype/` and `portal/fixtures/`
- API response shapes: `frontend/src/types/index.ts`
- Rules for agents: [`AGENTS.md`](AGENTS.md). Rules for docs: [`DOCS.md`](DOCS.md)
