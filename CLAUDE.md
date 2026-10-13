# CLAUDE.md — Evergro Portal MVP (Frappe 15)

> Read this fully at the start of every session. Update the **Progress log** (section 13) at the end of every session.
> This file describes the MVP only. Anything not listed in section 3 is OUT of scope. Do not build it, do not stub it, do not add routes for it.

---

## Rules learned the hard way

- **One step at a time.** Do exactly the step the user asked for, then STOP and wait. Do not start the next step, even if it looks obvious.
- Do not create screens, routes, APIs or doctypes that the current step does not name.
- **Phase 1 is code only: no new doctypes, no new custom fields, no schema changes.** If a Phase 1 step seems to need one, stop and tell me.
- **I run the servers.** Do not start, stop or restart `bench start` or the Vite dev server. Assume both are running and hot reloading. You may run the production build (`npm run build` / yarn equivalent) and lint to check your work.
- Never report "done" unless the build succeeds with zero errors and you have told me exactly what to click to verify it.
- Never invent doctype fields, statuses, API names or file paths. Read the doctype meta / code / file first. If something doesn't exist, say so and ask.
- frappe-ui: use `createResource` / `createListResource` (no `useResource`). Trigger with `.submit()` / `.fetch()`; results are in `.data`, not `.message`.
- Python API paths are `portal.api.portal.<method>` (grep to verify before calling).
- **No screen may call `createResource` or hardcode an API path directly.** All data goes through the shared data layer (section 8).
- **One screen = one component for mobile AND desktop.** Differences are CSS only (section 8). Never create a `DesktopX.vue` twin.
- Customers must never be able to change server-controlled fields (invoice status, outstanding amount, visit status, plan status, etc.).
- **An invoice is only ever marked paid by the server after verifying the payment with Paystack. Never trust the redirect or the client.**
- **Never collect, store or log raw card numbers or CVV in our own UI or server.** Card details are only ever typed into Paystack's hosted page.
- Currency is ZAR: show `R`, never `$`.
- After each step, reply with: files changed, commands to run, what I should see, what is unverified, and a suggested commit message. Then stop.

---

## 0. How to work in this repo

1. **Investigate before you write.** Grep, open the file, or run the console query. Past bugs came from guessed names (`custom_is_default` vs the real `custom_default`).
2. **Small, verifiable steps.** After each change, tell me exactly how to verify it in the browser.
3. **I commit, not you**, unless I ask. One logical change per commit, format `area: what changed`. Never commit secrets, `.env`, `node_modules`.
4. **Dev VM only for destructive commands.** Never run `reinstall`, `drop-site`, `remove-app`, `restore`, or `migrate` against production.
5. **Never edit core apps** (`frappe`, `erpnext`, `payments`, `frappe_paystack`, `frappe_whatsapp`, `print_designer`). Extend through the `portal` app: hooks, fixtures, overrides, whitelisted APIs.
6. **Reuse before building.** Prefer an existing ERPNext/Frappe doctype or flow over a new one. A new doctype needs my OK first.
7. **Ask when a decision is genuinely mine** (business rules, copy, pricing). Otherwise decide, state it in one line, continue.
8. **Be honest about uncertainty.** List anything you could not verify under "Unverified".

---

## 1. Project in one paragraph

Evergro Landscapers (Pty) Ltd: lawn maintenance and landscaping, Heidelberg, Gauteng, South Africa. ZAR, ~17 recurring customers, weekly maintenance billed monthly in advance, not VAT-registered. The MVP is a **minimal customer app** (think Naked Insurance: few screens, big clear cards, nothing extra) on Frappe/ERPNext 15, with a public landing page at the domain root. The employee app already works and is **not touched** by this MVP.

The existing screens are Figma Make mockups ported to Vue. Profile data (name, phone, email), invoices and the active card already load dynamically. Keep what works, remove fake data, and cut anything outside section 3.

---

## 2. Environment

| Item | Value |
|---|---|
| Dev machine | Ubuntu 22.04 VM (VMware), 8 GB RAM, 4 vCPU |
| Bench | `~/frappe-bench` (plain bench, no Docker in dev) |
| Dev site | `evergro.local` |
| Frappe / ERPNext | 15.x (verify with `bench version`) |
| Other apps | Payments, `frappe_paystack`, `frappe_whatsapp`, `print_designer` |
| Frontend | `apps/portal/frontend/` — Vue 3 + Vite |
| Repo | GitHub `evergro/evergro-portal`; Frappe app `portal`; module `Evergro` |
| Production | Self-hosted Docker, custom image that installs `portal` from git. **Verify before giving deploy instructions.** |

**Verify before relying on them** (the file listing suggests they differ from older notes):
- Package manager: `package-lock.json` exists, so it may be **npm**, not yarn. Use whichever lockfile is committed, consistently.
- Tailwind: `@tailwindcss/vite` is installed, which means **Tailwind v4** (CSS-first config, no `tailwind.config.js`). Do not add a v3-style config or the frappe-ui v3 preset without checking installed versions and frappe-ui's peer requirements.
- Whether `frappe-ui` is installed and configured (`setConfig("resourceFetcher", frappeRequest)`, `window.csrf_token` set by the boot HTML).
- The Vite manifest location the Jinja/boot code reads.

Dev workflow (see DEV_SERVER.md): `bench start` (Frappe, port 8000) + Vite dev server (hot reload) run in my terminals. I browse the Vite URL and see changes as you save files.

Key paths:

```
apps/portal/portal/hooks.py            # fixtures, role_home_page, website routes
apps/portal/portal/api/portal.py       # whitelisted API methods for the Vue app
apps/portal/portal/www/                # login and portal/landing pages
apps/portal/portal/fixtures/           # exported Custom Fields
apps/portal/frontend/src/              # Vue source (screens, components, api, composables)
```

---

## 3. MVP scope

### The flow
1. **Domain root `/`** shows the public landing page (what Evergro does, contact, a Log in button). No login screen inside the Vue app.
2. **Log in** uses the existing custom Frappe login at `/login`. This is the only login.
3. After login, via `role_home_page`: **Customer → `/portal`**, **employee roles → `/app`** (already working; do not change employee behaviour).
4. An unauthenticated visitor to `/portal/...` is redirected to `/login` (with redirect back). The Vue app never renders its own login, lock or sign-up screen.

### Three tabs (bottom bar on small screens, side nav on large screens: same component, CSS only)

**Home**
- **Alerts** at the top (section 7)
- Next service visit and last visit
- Quotations (read-only list, tap for detail). Quotations are NOT a tab.
- Refer a friend card

**Schedule**
- Calendar view: **green** = completed, **red** = missed/blocked (customer-side issue, rain, public holiday), **grey** = upcoming/scheduled. Tap a day to see the visit. (Yellow is dropped.)
- List view (toggle Calendar / List).

**Account** (a simple menu of rows, each opening its own URL)
- Personal details (name, phone, email, birthday)
- Payment method (**one card only**: "Add card" if none, "Update card" if one exists)
- Properties (read-only list)
- Billing history (all invoices; **Pay now** only on overdue invoices)
- Refer a friend
- Active plan / subscription (read-only, plus billing day)
- Help & Support
- Log out

### Help & Support (under Account, also linked from Home)
Only: **Create a ticket**, **Email us**, **WhatsApp us**, **Call us**, **FAQs**.
- Ticket → ERPNext `Issue` (subject + description), plus a small read-only list of the customer's own tickets with status. No replies or chat.
- Email / WhatsApp / Call are plain links (`mailto:`, `https://wa.me/...`, `tel:`). Contact details live in ONE constants file.
- FAQs: accordion. Static list in one file for now.

### OUT of scope (do not build, route or nav)
Inbox/notifications, notification preferences, services store, add-service chat flow, reviews, banners/promo content, loyalty, weather notices, quotations tab, quotation accept/decline, partial payments, multiple cards, change-default/remove card, editing properties, referral tracking, ticket replies, dismissing alerts.

Existing screens for out-of-scope features and the separate `Desktop*` pages: remove them from the router and nav, but **do not delete the files** until I ask for a cleanup commit. In-scope screens are reused, merged into one responsive component each, and stripped of fake data.

---

## 4. Build phases

**Phase 1: code only** (no doctype, custom field or schema change). Foundation, auth, routing, shared data layer, Account (details, card, billing history, Pay now, properties), Home (quotations, refer a friend, payment-failed alert), Help & Support.

**Phase 2: needs data decisions.** Schedule and visits (data source), Home next/last visit and visit alerts, active plan, billing day (custom field). Do not start Phase 2 until I say so.

In Phase 1, Account rows for Phase 2 features may show as disabled "Coming soon".

---

## 5. Customer API (all in `portal.api.portal`)

All methods: logged-in users only. Customer is derived from the session by the existing `_get_customer()` helper (read it first). **No method accepts `customer` as an argument.** Every `name`/`id` argument gets an ownership check.

| Method | Phase | Purpose |
|---|---|---|
| `get_profile()` / `update_profile(...)` | 1 | Personal details. Update phone, email, birthday only |
| `get_payment_method()` | 1 | The single active card or `null` |
| `start_add_card()` / `confirm_add_card(reference)` | 1 | Add or replace the card via R1 charge |
| `get_invoices(status=None)` | 1 | Billing history |
| `retry_invoice_payment(invoice)` | 1 | Retry the saved card for an overdue invoice |
| `start_invoice_payment(invoice)` / `confirm_invoice_payment(reference)` | 1 | Pay an overdue invoice with a different card via Paystack checkout |
| `get_properties()` | 1 | `Address`es linked to the customer |
| `get_quotations()` / `get_quotation(name)` | 1 | `Quotation`, read-only |
| `create_ticket(subject, description)` / `get_tickets()` | 1 | `Issue`; customer and email from session |
| `get_alerts()` | 1 (payment) / 2 (visits) | Home alerts (section 7) |
| `get_visits()` | 2 | Schedule, next and last visit |
| `get_plan()` / `set_billing_day(day)` | 2 | Plan + billing day |

Build each method only in the step that needs it.

---

## 6. Payments

### 6a. One card per customer
- No card → **Add card**. Card exists → brand, `•••• •••• •••• 4242`, expiry, and **Update card**.
- No change-default, no remove, no list. `custom_default` still exists; the one active card is the default.
- Legacy data with several active cards: `get_payment_method()` returns the default (else newest); the next successful update deactivates the rest.

Add / update flow (R1 verification charge, refunded automatically; Paystack fees accepted):
1. `start_add_card()` initialises a Paystack transaction: amount `100` (cents), `ZAR`, `channels: ["card"]`, reference prefixed `cardverify-`, `metadata: {purpose: "card_verification", customer}`, `callback_url` back to the payment-method page. Returns `authorization_url`; frontend redirects.
2. Paystack redirects back with `?reference=...`; the page calls `confirm_add_card(reference)`.
3. Server verifies: `metadata.purpose` and `metadata.customer` match the **session** customer, `status == success`, `amount == 100`, `authorization.reusable`. Upserts a `Paystack Customer Authorization` (dedupe on `customer` + `signature`; the `frappe_paystack` webhook may have created it already), sets it `active=1, custom_default=1`, **then** retires the customer's other cards (`active=0, custom_default=0`), refunds via `POST /refund {transaction: reference}`, returns the card.
4. Only trust server-side verification, never the redirect query params.

Secret key: `from frappe_paystack.utils import get_gateway_secret`. If more than one Paystack Gateway Setting exists, ask which one the portal uses.
Helper text: "We charge R1 to verify your card and refund it straight away."
Test mode card: `4084 0840 8408 4081`, any future expiry, CVV `408`, OTP `123456`.

### 6b. Pay now (overdue invoices only)
- **Pay now appears only on invoices that are overdue** (outstanding amount > 0 and past due date; verify status values in the Sales Invoice meta). Unpaid invoices that are not yet due show "Due on <date>" and no button. Paid invoices show a Paid pill.
- Full outstanding amount only. No partial payments.
- Do not assume why an invoice is overdue; show Pay now for any overdue invoice.
- Tapping Pay now opens a sheet: "Your payment didn't go through." with two choices:
  1. **Retry card ending 1234** (only if a card exists). Server charges the saved authorization with Paystack's charge-authorization endpoint. **No CVV is asked for**: that endpoint takes the stored authorization code, email and amount, so there is nothing to confirm. We must not build our own CVV input (that would put raw card data on our server). Handle every response status: success, failed, and any "needs extra step" result (show a friendly message and offer option 2).
  2. **Use a different card.** Opens Paystack's hosted checkout for the invoice amount; the customer types card details on Paystack's page. On success, a reusable card replaces the card on file (same replace rule as 6a). Confirm this behaviour with me before building.
- **Investigate first:** check whether `frappe_paystack` / `payments` already supports charging a saved authorization or paying a Sales Invoice (Payment Request + webhook creating the Payment Entry). Reuse it if it does; hand-roll only if it doesn't, and tell me why.
- If hand-rolled: references prefixed `invoicepay-`; `metadata: {purpose: "invoice_payment", customer, invoice}`; amount = `outstanding_amount * 100` at initiation.
- Server checks before recording payment: Paystack `status == success`, currency `ZAR`, amount equals the invoice's current outstanding amount in cents, `metadata.customer` equals the session customer, the invoice belongs to that customer. Then create the `Payment Entry` against the Sales Invoice.
- **Idempotent:** the same reference never creates a second Payment Entry (handle the webhook arriving first or second). Disable the button while a request is in flight.
- Never log secrets, authorization codes or full Paystack responses.
- Unverified until tested in Paystack test mode: how `charge_authorization` behaves for cards that need extra authentication.

---

## 7. Home alerts

- Computed **server-side** by `get_alerts()` from existing data. **No Alert doctype.** An alert disappears when its condition resolves; no manual dismiss.
- Phase 1: **Payment failed** = the customer has one or more overdue invoices. Text like "Your payment of R450 didn't go through" with a Pay now action that opens the 6b sheet.
- Phase 2: **Visit skipped**, **Visit rescheduled** (from the visit data source).
- Show at most 3 alerts, most urgent first (payment failed, then visit alerts). Each alert links to the relevant screen.
- Alerts are shown only on Home.

---

## 8. Frontend architecture (shared code, single responsive UI)

**Why:** each screen currently loads its own data and desktop and mobile have separate pages. That means every bug is fixed in several places. The rules below create one place to maintain each concern.

**Shared data layer**
- `src/api/` is the ONLY place that knows API paths and calls `createResource`. Example: `src/api/portal.ts` with one typed function per backend method.
- `src/composables/` holds one composable per concern: `useProfile`, `usePaymentMethod`, `useInvoices`, `useQuotations`, `useProperties`, `useTickets`, `useAlerts`, later `useVisits`, `usePlan`. Each is created once and **shared across screens** (module-level cached resource), so Home and Account read the same profile and a refresh updates both. Each exposes `data`, `loading`, `error`, `reload`.
- One shared place for: error handling and toasts, `formatZAR()`, date formatting, status → pill colour/label map, the contact-details constants, and the FAQ list.
- Screens and components only call composables. They never call `createResource`, `fetch` or `frappeRequest` directly and never contain `portal.api.portal.*` strings.
- When fixing a bug in how a thing loads, you change it in `src/api` or its composable, once.

**Single responsive UI**
- One component per screen. Mobile-first Tailwind classes; use breakpoints (e.g. `md:` / `lg:`) to change layout and placement. Bottom tab bar on small screens, side nav on large screens, from one `AppShell` component.
- Same information on all sizes; only style and placement differ. No `DesktopX.vue` / `MobileX.vue` pairs, no `if (isDesktop)` rendering of different pages. (A tiny JS breakpoint check is acceptable only for something CSS truly cannot do, and needs a one-line justification.)
- Test at ~360 px and ~1280 px.

**Routing (must survive refresh)**
- Use real `vue-router` routes with `createWebHistory('/portal')`. Tabs are `<router-link>`s. The active tab comes from the current route, never from component state.
- Every screen has its own URL, e.g. `/portal`, `/portal/schedule`, `/portal/account`, `/portal/account/profile`, `/portal/account/card`, `/portal/account/billing`, `/portal/account/properties`, `/portal/account/refer`, `/portal/account/plan`, `/portal/account/help`, `/portal/quotations/:name`. (Create each route only in the step that builds it.)
- A browser refresh keeps the user on the same screen; the back button works; a screen can be opened in a new browser tab.
- `hooks.py` must send `/portal/<path:app_path>` to the portal page (catch-all). Verify both the route rule and the router mode whenever routing changes. In dev the Vite server must also fall back to the app for deep links.
- Use route query params for payment returns (`?reference=...`).

**Look and feel**
- Vue 3 `<script setup>`, `frappe-ui` where already configured.
- Brand: dark green `#073b24`, lime `#8bc53f`, yellow `#e5d403`, light green `#f0f7ee`. Use tokens already in the project CSS before inventing new ones.
- Minimal: one primary action per screen, large type, generous spacing, no decorative panels. Every screen needs loading, empty and error states. Remove Figma Make leftovers on screens you touch (fake names, sample data, `$`).

---

## 9. Backend rules (security-critical)

- Never trust the client for identity. Derive the customer from the session.
- Ownership check on every `name`/`id` argument (invoice, quotation, ticket, etc.).
- Use `ignore_permissions=True` only for server-controlled writes after the ownership check. Portal users are Website Users, so permission-restricted `get_all` may return nothing; **test as a real portal user, not only Administrator.**
- Never log secrets, authorization codes or full Paystack responses. `frappe.log_error(title=...)` with reference ids only.
- External HTTP calls get timeouts. Use `frappe.throw` with friendly messages.
- Frappe 15 APIs only.
- Customers must not reach Desk (`/app`): they are `Website User` type. Verify for the test customer.

---

## 10. Data sources and open decisions

Reuse, don't build:
- Personal details → `Customer`, `Contact` (custom field `custom_birthday`)
- Properties → `Address` linked to the Customer
- Card → `Paystack Customer Authorization`. Verified fields: `customer`, `company`, `card_label`, `active`, `customer_code`, `email`, `reusable`, `custom_default` (Check), `channel`, `card_type`, `brand`, `bank`, `last4`, `exp_month`, `exp_year`, `signature`, `authorization_code` (**Password** type: read with `doc.get_password(...)`, never via `get_all`, never logged or returned).
- Invoices → `Sales Invoice`; payments → `Payment Entry`
- Quotations → `Quotation` (verify `quotation_to` / `party_name` in meta)
- Tickets → `Issue`

Custom fields live in fixtures: `Contact-custom_birthday`, `Paystack Customer Authorization-custom_default` (already added).

**Open decisions (ask me before the related step):**
1. **Pay now option 2** (6b): confirm that paying with a different card via Paystack checkout also replaces the card on file.
2. **Who charges the card on file today?** Does anything (frappe_paystack scheduler, manual process) auto-charge on billing day? Step 1 reports this; the portal does not build auto-charging.
3. **Schedule data source** (Phase 2): find out what the working employee app records. If nothing suitable exists, propose the smallest `Service Visit` doctype: `customer`, `address`, `scheduled_date`, `status`, `reason`, `notes`. No photos, checklist or plan link.
4. **Active plan** (Phase 2): reuse ERPNext `Subscription` if Evergro uses it; else propose the smallest option. No doctype without my OK.
5. **Billing day** (Phase 2): proposed custom field `custom_billing_day` (Int 1–28) on `Customer`, editable in the plan section. Evergro applies it manually when invoicing.
6. **Refer a friend:** a card with reward text and a "Share on WhatsApp" button (pre-filled message with the customer's first name). Evergro credits the reward manually. I supply the wording.
7. **FAQs:** static list for now. Check whether Frappe's Help Article / Help Category could be Desk-editable later; propose, don't build.
8. **Contact details** (email, WhatsApp, phone) for the constants file: I will provide them.
9. **Properties:** read-only; changes go through a ticket.

---

## 11. Landmines and commands

- Fixtures only sync on `migrate` and only if the `hooks.py` filter includes them. A reinstall wipes custom fields and data.
- Docker production builds from git: anything uncommitted (fixtures, doctype JSON, built assets if tracked) will be missing.
- Paystack amounts are in cents. `frappe.db.set_value(doctype, {filters}, field, value)` is valid in v15.
- The dev server and the production build behave differently (boot data, CSRF token, base path). Before calling a phase finished, I test the **built** version served by Frappe at `/portal`.
- Never put passwords, API keys, bank details or SSH info in the repo or this file.

```bash
cd ~/frappe-bench
bench start                                   # I run this
bench --site evergro.local migrate
bench --site evergro.local clear-cache
bench --site evergro.local console
bench --site evergro.local export-fixtures
cd apps/portal/frontend && <npm|yarn> run dev      # I run this (hot reload)
cd apps/portal/frontend && <npm|yarn> run build    # you may run this to check your work
```

---

## 12. Definition of done for a step

Builds cleanly; works at 360 px and desktop with loading/empty/error states; refresh on the screen's URL keeps the user on that screen; API tested as a portal user and rejects other customers' ids; uses the shared data layer; one clear commit.

---

## 13. Progress log (update every session)

- [x] Custom Frappe login works; customers go to `/portal`, employees to `/app`
- [x] Profile (name, phone, email), invoices and active card load dynamically (but per-screen; to be moved to the shared data layer)
- [x] `custom_birthday` and `custom_default` custom fields added and in fixtures

**Phase 1 (code only)**
- [ ] Step 0: hot reload dev server
- [ ] Step 1: investigation report (no code)
- [ ] Step 2: landing page at domain root
- [ ] Step 3: remove in-portal login, guard `/portal` with Frappe session
- [ ] Step 4: real routing + three-tab responsive shell (one UI for mobile and desktop)
- [ ] Step 5: shared data layer; migrate existing profile, invoices and card loading
- [ ] Step 6: Account menu + personal details
- [ ] Step 7: payment method (add / update one card)
- [ ] Step 8: billing history
- [ ] Step 9: Pay now for overdue invoices
- [ ] Step 10: properties
- [ ] Step 11: quotations on Home
- [ ] Step 12: Help & Support
- [ ] Step 13: refer a friend
- [ ] Step 14: Home alerts (payment failed) and Home assembly
- [ ] Step 15: Phase 1 hardening, production build test

**Phase 2 (needs data decisions; do not start until told)**
- [ ] Step 16: Schedule (calendar + list)
- [ ] Step 17: Home next/last visit + visit alerts
- [ ] Step 18: active plan + billing day
- [ ] Step 19: final hardening and release checklist

Session notes: _(append dated one-liners: what changed, what is unverified, what is next)_