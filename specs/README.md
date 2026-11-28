# Portal specs

One file for each feature. Build in this order. Every spec has a Phase 0 that checks its assumptions on the real site before any code. Assume Frappe v15 only.

The goal of every spec is the one in `AGENTS.md`: a customer sees when the crew comes and what they did, manages their card, pays their invoices and keeps their details up to date, without phoning the office.

## Order

| # | Spec | Mockup screens | Needs | Status |
| :--- | :--- | :--- | :--- | :--- |
| 001 | [Login, landing and root routing](001-login-landing-and-root-routing.md) | `/`, `/login` | none | Done |
| 002 | [Frontend foundation and config](002-frontend-foundation-and-config.md) | whole app | 001 | Done |
| 003 | [Customer API and security](003-customer-api-and-security.md) | whole app | 002 | Draft |
| 004 | [App shell and navigation](004-app-shell-and-navigation.md) | shell, header, tabs | 003 | Draft |
| 006 | [Schedule and service visits](006-schedule-and-service-visits.md) | `ScheduleView`, `VisitDetailView` | 003 | Draft |
| 005 | [Home](005-home.md) | `HomeView` | 003, 006 | Draft |
| 007 | [Account profile and password](007-account-profile-and-password.md) | `AccountView`, `ProfileView`, `PasswordView` | 003 | Draft |
| 008 | [Properties](008-properties.md) | `PropertiesView`, `PropertyView` | 003 | Draft |
| 009 | [Payments](009-payments.md) | `PaymentsView`, `TransactionsView`, `CardView`, `CheckoutView` | 003, `frappe_paystack` | Draft |
| 010 | [Referrals](010-referrals.md) | `ReferView` | 003 | Draft |
| 011 | [Notification settings](011-notification-settings.md) | `NotificationsView`, `ChannelView` | 003 | Draft |
| 012 | [Support](012-support.md) | `SupportView` | 003 | Draft |
| 013 | [Promo onboarding](013-promo-onboarding.md) | `/promo`, `/start/*` | all above | Nice to have. Build last |
| 014 | [Keep the app name](014-rename-app.md) | none | none | Done. Not renamed |

Spec 006 comes before 005 because Home reads visits.

[`data-model.md`](data-model.md) lists every doctype, custom field and setting the specs create. Read it before you build anything that stores data.

## How to use a spec

1. Read the whole spec. Run **Phase 0** first. It records what is really on the site.
2. Do one phase. Run its automated checks and its hand checks. Commit. Stop.
3. Tick the phase in **Progress** and note anything that differed from the plan.

## Test tools

| Level | Tool | Where |
| :--- | :--- | :--- |
| Backend | `bench run-tests` (Frappe test case) | `portal/tests/` |
| Frontend unit | Vitest. Add it in spec 002 | `frontend/src/**/*.test.ts` |
| Flows | Playwright against `evergro.local` | `frontend/e2e/` |

## Decided on 2026-11-27

| Question | Answer |
| :--- | :--- |
| Scope | The four-tab mockup specs. Quotations on Home, support tickets, FAQs, Home alerts and the active plan and billing day screen from the old MVP plan are out of scope for now. Each needs its own spec later |
| Promo onboarding | The portal owns it (spec 013). It is a nice to have and is built last. It replaces `/promo/summer-special` in `frappe_paystack` |
| UI stack | Tailwind 3 with `frappe-ui` for data and, where it fits, components (spec 002) |
| Landing page | Stays at `/` for everyone and never redirects. `/home` is not used (spec 001) |
| Pay now | Any unpaid invoice (spec 009) |
| R1 card check | Kept and credited on the next invoice (spec 009) |
| Customer name | Read only in the portal (spec 007) |
| Visits | New `Service Visit` doctype, not `Maintenance Visit` (spec 006) |
| Support numbers | From the default `Company`: `phone_no` and a new `custom_whatsapp` field (spec 012) |
| Promo payment | R1 at checkout to save the card. The rest is due on the day of service and collected with the saved card. Subscriptions start on the next billing date, and staff invoice the first cycle by hand (spec 013) |
| Lawn map | Google Maps JavaScript API with the site's `google_maps_api_key` (spec 013) |
| App name | Stays `portal`, repo `evergro-portal` (spec 014) |

## Open questions across all specs

1. Where is consent for contact recorded for a promo lead (spec 013, POPIA)? Default: the lead's notes, with the date and the exact wording shown.
2. Should visits be generated from each Subscription automatically (spec 006)? Default: no.
3. Can one login have two customers (spec 003)? Default: no.
