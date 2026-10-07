# CLAUDE.md — Evergro Portal (Frappe 15)

> Read it fully at the start of every session. Update the **Progress log** (section 12) at the end of every session.

---
## Rules learned the hard way

- Work on ONE screen at a time. Do not create other screens, routes or APIs until the current milestone is verified by the user in the browser.
- Never report "done" unless `yarn build` succeeds with zero errors and you have actually loaded the page (or told me exactly what to click to verify it).
- frappe-ui: use createResource / createListResource (there is no useResource). Resources are triggered with .submit()/.fetch() and their data is in .data, not .message.
- Python API paths are portal.api.portal.<method> (verify with grep before calling).
- vue-router must use createWebHistory('/portal'); hooks.py must route /portal/<path:app_path> to the portal page. Verify both.
- Never invent doctype fields, statuses or API names: read the doctype meta / code first. If something doesn't exist, say so and ask.
- Customers must never be able to change visit status, plan status or any server-controlled field. Customer-facing APIs expose only actions the spec allows.
- Currency is ZAR: show "R", never "$".
- New doctypes are created in the Desk GUI (developer mode) or generated and then verified with bench migrate. A doctype is only "done" when it appears in Desk and its JSON is committed.
- After finishing a milestone: list the files changed, the commands to run, and what I should see.

---

## 0. How to work in this repo (read first)

1. **Investigate before you write.** Never assume a fieldname, function signature, route or file path. Open the file, run the console query, or grep. This project has already been burned by guessed names (`custom_is_default` vs the real `custom_default`).
2. **Small, verifiable steps.** After each change: migrate/build if needed, run the verification commands in section 10, and tell the user exactly what to click or run to confirm.
3. **Commit at every milestone** (the user wants a traceable history). One logical change per commit, message format `area: what changed` (e.g. `payments: add saved-card API and Vue screen`). Do not commit secrets, `.env`, `node_modules`, or built assets unless the repo already tracks them.
4. **Dev only for destructive commands.** Never run `reinstall`, `drop-site`, `remove-app`, `restore`, `bench migrate` or any DB-altering command against production. Everything here assumes the dev VM unless stated.
5. **Never edit core apps** (`frappe`, `erpnext`, `payments`, `frappe_paystack`, `frappe_whatsapp`, `print_designer`). Extend through the `portal` app: hooks, custom fields (fixtures), overrides, whitelisted APIs, new doctypes.
6. **Ask when a decision is genuinely the user's** (business rules, copy, pricing, product behaviour). Otherwise decide, state the decision in one line, and continue.
7. **Be honest about uncertainty.** If you could not verify something (e.g. a Paystack behaviour), say so and add it to the "Unverified" list in your reply.

---

## 1. The project in one paragraph

Evergro Landscapers (Pty) Ltd is a lawn-maintenance and landscaping business in Heidelberg, Gauteng, South Africa (currency ZAR, ~17 recurring customers growing, weekly maintenance billed monthly in advance, business not yet VAT-registered). We are building a **customer portal** (Vue 3 web app, mobile + desktop layouts) on top of Frappe/ERPNext 15, then a **landing page** on the same Frappe site, then an **employee "Connecteam" app** that shares doctypes with the portal. The portal reuses ERPNext/Frappe doctypes wherever possible so the business can edit content (banners, FAQ, promos) from Desk without a developer.

Design source of truth: the user has desktop and mobile mockups for every screen (Overview, Inbox, Account, Payment Methods, etc.). The concept is inspired by TruGreen's app. **Ask the user for a mockup/screenshot of a screen before building it if you have not seen it.**

---

## 2. Environment

| Item | Value |
|---|---|
| Dev machine | Ubuntu 22.04 VM (VMware), 8 GB RAM, 4 vCPU, 50 GB disk |
| Bench | `~/frappe-bench` (plain bench, no Docker in dev) |
| Dev site | `evergro.local` (browsed from the host machine; code edited with VS Code on the host) |
| Frappe / ERPNext | Frappe 15.121.x, ERPNext 15.121.x (verify with `bench version`) |
| Other apps | Payments, `frappe_paystack` 15.5.0, `frappe_whatsapp` 1.0.12, `print_designer` 1.6.5 |
| Dropped | CRM and Telephony (CRM needs Frappe 16) |
| Node | 20 via nvm (activate nvm before node/yarn commands) |
| Frontend | `apps/portal/frontend/` — Vue 3 + Vite 5 (+ `frappe-ui`, being installed) |
| Vite manifest | `.vite/manifest.json` (Vite 5 location; the Jinja/boot code reads it from there) |
| Repo | GitHub `evergro/evergro-portal`; Frappe app name `portal`; module name `Evergro` (renamed from "Portal" to avoid a clash) |
| Production | Self-hosted Docker using a **custom image** (Containerfile) that installs the `portal` app from git. **Verify how production is actually deployed before giving deploy instructions; do not assume.** |

Key paths:

```
apps/portal/portal/hooks.py            # fixtures, role_home_page, website routes, scheduler
apps/portal/portal/api/portal.py       # whitelisted API methods for the Vue app
apps/portal/portal/www/login.html|.py  # custom login (replaces Frappe's for everyone)
apps/portal/portal/fixtures/           # exported Custom Fields etc.
apps/portal/portal/evergro/            # module folder for portal's own doctypes (verify actual name)
apps/portal/frontend/                  # Vue/Vite source
```

---

## 3. Architecture decisions already made (do not relitigate without asking)

- **Reuse before building.** Saved cards → `Paystack Customer Authorization`. Support tickets → ERPNext `Issue`. Customers/addresses/contacts → ERPNext `Customer`, `Address`, `Contact`. Invoices → `Sales Invoice`. Payments → `Payment Entry` / Paystack.
- **One login page** (`www/login`) for everyone (customers, employees, System Managers). The username input is `type="text"` (not `email`) so `Administrator` can log in.
- **Routing after login** via `role_home_page` in `hooks.py`: Customer → `/portal`, System Manager → `/app`.
- **Customers must not reach Desk (`/app`).** They are `Website User` user type. The test Customer's user still needs this set (check it).
- **Payment gateway = Paystack** (not PayFast). Amounts to Paystack are in **cents**; currency `ZAR`.
- **Notification channels = Email and WhatsApp only.** No push, no SMS for now.
- **Sidebar** has a "Need a hand? / Talk to us" support widget instead of a plan-status card (a customer, e.g. a property agent, can have multiple properties and plans).
- **Banners come from two sources:** (a) editable promo banners (doctype), (b) automatic account-state banners computed server-side (missing payment method, overdue invoice).
- **Desktop and mobile layouts are designed separately per screen**, not one reflowed layout.
- **Build order:** customer portal → landing page (migrated from WordPress onto this Frappe site) → Connecteam employee app (website/mobile-view first, then webapp, then native).

---

## 4. Data model

### Existing doctypes we depend on
`Customer`, `Contact` (custom field `custom_birthday`), `Address`, `Sales Invoice`, `Payment Entry`, `Item`, `Issue`, `Paystack Customer Authorization`, `Paystack Gateway Setting`.

### Custom fields (must live in fixtures)
- `Contact-custom_birthday`
- `Paystack Customer Authorization-custom_default` (Check) — marks the customer's default card. **The fieldname is `custom_default`.**

`hooks.py` fixtures must export Custom Fields for exactly these (the user already fixed this; keep it working, extend the `name in [...]` list when adding fields).

### `Paystack Customer Authorization` actual fields (verified)
`customer` (Link), `company` (Link), `card_label` (Data), `active` (Check), `customer_code`, `email`, `reusable` (Check), `custom_default` (Check), `channel`, `card_type`, `brand`, `bank`, `last4`, `exp_month`, `exp_year`, `signature`, `authorization_code` (**Password** type: read with `doc.get_password("authorization_code")`).

### New doctypes (planned)

| Doctype | Purpose | Key fields |
|---|---|---|
| **Portal Notification Preference** | Per-customer channel prefs | `customer`, 5 categories × 2 channels (Email, WhatsApp) = 10 Check fields. **Confirm the 5 categories from the mockup before building.** |
| **Service Plan** | Recurring agreement | `customer`, `address`, `item`, `frequency` (weekly / bi-weekly / etc.), `price`, `next_billing_date`, `status` |
| **Service Visit** | One scheduled/completed visit | `plan`, `scheduled_date`, `crew`, `clock_in`, `clock_out`, `status`, `reason_code`, checklist child table, photos child table (before/after), `notes`, `rescheduled_to` |
| **Portal Banner** | Editable promo/info banners | `title`, `image`, `link`, `from_date`, `to_date`, `sort_order`, `enabled` |
| **Evergro Portal Settings** (Single) | Admin-editable content | FAQ, support phone/WhatsApp numbers, referral amounts, visit cut-off time |

Service Visit is the **shared doctype** between the customer portal and the future employee app: employees clock in/out and upload photos; the customer sees the result. The employee app may have its own doctype that creates/updates Service Visit rather than editing it directly. Design Service Visit so that works.

### Calendar semantics (customer Schedule screen)
- **Green** = visit completed. Tap: before/after photos, what was done, arrival/finish time, service notes.
- **Red** = visit blocked by a customer-side issue (access blocked, customer unavailable, other) or by rain/public holiday. Tap: the reason.
- **Yellow** = Evergro's fault. Tap: what happened + link to the rescheduled date.
Drive this from `Service Visit.status` + `reason_code` (define a Select of codes that maps cleanly to the three colours).

---

## 5. Screens (target feature list)

Home/Overview (banners, notifications, next visit, balance) · Schedule/Calendar · Services (prices already specific to the customer's property; "purchase" uses the stored estimate and can add + pay at once; adding a new service uses a chat-style flow to collect specifics such as whole lawn vs partial, which can change the estimate) · Inbox/Notifications · Account (profile: addresses, billing address, picture, birthday, customer-since; **Payment Methods**; **Notification Preferences**) · Support (creates an `Issue`; after a visit the customer is prompted to leave a review) · Logged-out view (home + basic info only).

Nice-to-have ideas the user asked for (ask before building): referral credit, seasonal lawn-care tips, weather-delay notices, loyalty perks (birthday discount, free labour on material jobs).

---

## 6. Payment Methods spec (current task)

Decision: **Option B** — customers can add a card standalone via a **R1 verification charge that is refunded automatically**. Paystack fees on the R1 are accepted.

Flow:
1. `start_add_card()` → server initialises a Paystack transaction: amount `100` (cents), `ZAR`, `channels: ["card"]`, a server-generated reference prefixed `cardverify-`, `metadata: {purpose: "card_verification", customer}`, `callback_url` = `/portal/payment-methods`. Returns `authorization_url`; frontend redirects.
2. Paystack redirects back with `?reference=...`; page calls `confirm_add_card(reference)`.
3. Server verifies the transaction, checks `metadata.purpose` and `metadata.customer` match the **session** customer, checks `status == success` and `amount == 100`, requires `authorization.reusable`, upserts a `Paystack Customer Authorization` (dedupe on `customer` + `signature`; `frappe_paystack`'s own webhook may already have created it), makes it default if the customer has none, then refunds via `POST /refund {transaction: reference}` and returns the card list.
4. Other API methods: `get_payment_methods`, `set_default_payment_method(name)`, `remove_payment_method(name)` (soft delete: `active=0`, clear default, promote another card).

Secret key: `from frappe_paystack.utils import get_gateway_secret` → `get_gateway_secret(<Paystack Gateway Setting name>)`. If there is more than one gateway setting, ask the user which one the portal uses (default assumption: the only/first one).

UI: matches the mockup — default card block with brand chip, `•••• •••• •••• 4242`, expiry, "Default" pill, **Change card** (bottom-sheet to pick another default; disabled with <2 cards) and **Remove**; below it a full-width **+ Add new card**; helper text "We charge R1 to verify your card and refund it straight away."

Known follow-ups: an hourly scheduler job that refunds any `cardverify-` transaction that succeeded but was never refunded (user closed the tab before returning).

---

## 7. Frontend rules

- Vue 3 `<script setup>`, Vite 5, **`frappe-ui`** (install if missing: `yarn add frappe-ui` in `apps/portal/frontend`). After install: register `FrappeUI`, `setConfig("resourceFetcher", frappeRequest)`, add the frappe-ui Tailwind preset and its component path to `tailwind.config.js`. **Check the Tailwind major version against frappe-ui's peer requirements before configuring.** `frappeRequest` needs `window.csrf_token` — confirm the boot HTML sets it.
- Call APIs as `portal.api.portal.<method>` via `createResource`.
- **Check `vue-router` mode (history vs hash) before relying on URL paths or Paystack callbacks.**
- Brand: dark green `#073b24`, lime `#8bc53f`, yellow `#e5d403`, light green surfaces `#f0f7ee`. Look at existing components/tailwind config for the real tokens before inventing new ones.
- Every screen needs loading, empty, and error states, and must be usable at ~360 px width and on desktop.
- Build with the project's existing script (`yarn build` in `frontend/`); confirm output location and that the manifest at `.vite/manifest.json` is picked up.

---

## 8. Backend rules (security-critical)

- **Never trust the client for identity.** Derive the customer from the session via the existing `_get_customer()` helper (verify its name/behaviour by reading it). Never accept `customer` as an API argument.
- **Ownership check on every `name`/`id` argument** (e.g. `_own_card`) before reading or mutating.
- Whitelisted methods are for logged-in users only (default). Use `ignore_permissions=True` only for writes the server fully controls, after the ownership check.
- Money and card data: never log secrets, authorization codes, or full API responses. `frappe.log_error(title=...)` with reference ids only.
- Wrap external HTTP in timeouts; surface user-friendly `frappe.throw` messages, not raw tracebacks.
- Use Frappe 15 APIs only (the repo is not on 16).
- New doctypes: create with `developer_mode` on, give them the `Evergro` module, commit the generated JSON, add permissions for the right roles (customers get access only through whitelisted APIs, not Desk).

---

## 9. Things to double-check / be careful about

**Verify before coding**
- Real fieldnames of any doctype you touch: `frappe.get_meta("<Doctype>").fields` in `bench --site evergro.local console`.
- Signatures of `frappe_paystack` helpers and how its webhook handles `charge.success` (read `apps/frappe_paystack/frappe_paystack/api.py` and `utils.py`; the handoff noted `frappe_paystack.api.saved_cards` exists around line 775).
- How `_get_customer()` resolves the customer and what it returns.
- `hooks.py` contents: fixtures filter, `role_home_page`, `website_route_rules`, `scheduler_events`.
- Whether the Vue router uses history or hash mode.
- Whether the test customer's User is type **Website User** and linked to the Customer (via Contact or portal user table).

**Known landmines**
- **Fixtures and reinstall:** a `bench reinstall`/restore wipes or reverts custom fields. Fixtures only sync on `migrate`, and only if the `hooks.py` filter includes them. After adding any custom field in Desk, run `bench --site evergro.local export-fixtures` and commit. Verify with `frappe.db.has_column(...)`.
- **Schema drift:** an earlier `Contact.is_billing_contact` column error (ERPNext code vs DB) was solved only by reinstalling the dev site. Test Sales Invoice creation after any schema operation.
- **Reinstall wipes data** (customers, items, invoices, Website User settings). Recreate test data after any reinstall.
- **`custom_default` ≠ `custom_is_default`.** Older notes used the wrong name.
- `authorization_code` is a Password field; do not read it through `get_all`.
- Paystack amounts are in cents; `ZAR` currency; minimum-amount behaviour for R1 should be tested in Paystack **test mode** (card `4084 0840 8408 4081`, any future expiry, CVV `408`, OTP `123456`).
- Paystack redirects add `trxref` and `reference` query params; only trust server-side verification, not the redirect.
- `frappe.db.set_value(doctype, {filters}, field, value)` is valid in v15 and updates all matches.
- The portal customer is on **Website User**; permission-restricted `get_all` may return nothing unless the API uses `ignore_permissions` or the doctype has the right role permission. Test as a real portal user, not only as Administrator.
- Docker production builds from git: anything not committed (fixtures, built frontend assets if tracked, doctype JSON) will be missing in production.
- Never put admin passwords, API keys, bank account numbers or SSH details in the repo or in this file.

---

## 10. Standard commands

```bash
cd ~/frappe-bench
bench start                                   # dev server
bench --site evergro.local migrate            # apply doctype/fixture changes
bench --site evergro.local clear-cache
bench --site evergro.local console            # IPython shell
bench --site evergro.local export-fixtures    # after adding/changing custom fields
bench --site evergro.local list-apps
bench build --app portal                      # if portal ships built assets via bench
cd apps/portal/frontend && yarn install && yarn dev     # Vite dev
cd apps/portal/frontend && yarn build                   # production build
```

Verification snippets (console):

```python
[(f.fieldname, f.fieldtype) for f in frappe.get_meta("Paystack Customer Authorization").fields]
frappe.db.has_column("tabContact", "is_billing_contact")
frappe.get_all("Custom Field", filters={"dt": ["in", ["Contact", "Paystack Customer Authorization"]]}, pluck="name")
```

Definition of done for any feature: migrates cleanly on a fresh site, fixtures/doctype JSON committed, API tested as a **portal user** and rejects other customers' ids, UI works at 360 px and desktop with loading/empty/error states, committed with a clear message.

---

## 11. Build roadmap

1. ~~Resolve Contact schema issue~~ (done by dev-site reinstall)
2. **Payment Methods** screen + API (current)
3. **Notification Preferences** screen + `Portal Notification Preference` doctype
4. **Service Plan + Service Visit** doctypes (foundation for Schedule and for the employee app)
5. **Schedule/Calendar** screen (green/red/yellow)
6. **Portal Banner + Evergro Portal Settings** + automatic account-state banners
7. **Home/Overview, Inbox, Account/Profile** completion; **Support** (Issue) + review prompt
8. **Services store** with property-specific pricing and the chat-style add-service flow
9. **Landing page** on the Frappe site (migrate from WordPress)
10. **Employee ("Connecteam") app**: mobile-web view → webapp → native app, sharing Service Visit
11. **Production rollout:** test-install the `portal` app and the new login on a staging copy first, then production

---

## 12. Progress log (update every session)

- [x] Portal app scaffolded; module renamed to `Evergro`; custom login working; customers routed to `/portal`
- [x] Mobile login centering fix committed (`type="text"` username)
- [x] Dev site reinstalled; Contact schema fixed; fixtures for `custom_birthday` and `custom_default` export/import correctly
- [ ] `frappe-ui` installed and configured
- [ ] Payment Methods API + screen
- [ ] (continue the list from section 11)

Session notes: _(append dated one-liners: what changed, what is unverified, what is next)_
