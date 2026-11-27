# Promo onboarding

Date: 2026-11-23
Status: **Draft. Nice to have. Build it last**, after every other spec (decided 2026-11-27). The portal owns promo onboarding. It replaces the `/promo/summer-special` page in `frappe_paystack`.

## Problem

A visitor from a flyer or an ad should be able to check their address, see a price, choose a plan, create an account and pay, without phoning anyone. The mockup flow works on fake data (`promoApi.ts`), measures the lawn with a map, and keeps its state in the browser.

## Goal

A guest opens `/promo/<campaign>`, enters an address, and ends with an active subscription, a login for the portal, and a payment, or lands in the right alternative: a manual quote request or the waitlist.

## What the mockup has

- Routes: `/promo/:campaign?` (landing), then `/start/*` screens: locate, analysing, guide, plan, checkout, success, waitlist, quote requested.
- State: `usePromoFlow` keeps the answers in `sessionStorage`. The password is never saved.
- Functions in `promoApi.ts`: campaign, active promo, pricing, house layouts, FAQs, how it works, analysis steps, map config, address classification, quote request, waitlist, guide questions, intro slides, plan recommendation, member promos, create account and start subscription.
- Three outcomes for an address: priced automatically (Sky City and Milano and Leopards Rest type stands), quote by hand (Nigel, Heidelberg, Alberton), or waitlist.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Public API | `portal/api/promo.py`. Read-only config methods and lead capture allow guests. Each guest write is rate limited |
| 2 | Campaign | `Promo Campaign`, with the slug as the URL part and a link to a `Coupon Code`, so every signup is tracked on the invoice |
| 3 | Areas | `Service Area` rows with keywords. An address that matches none is waitlisted. Classification is on the server |
| 4 | Prices | `Service Bundle` rows link a tier to an `Item`. The price is read from `Item Price`, so billing and the page can never disagree |
| 5 | Recommendation | A Python function with unit tests, using `Promo Plan` rows, replacing the logic in the browser |
| 6 | Leads | Standard `Lead` with `Lead Source` "Promo Quote Request" or "Promo Waitlist". Consent text is stored in the lead's notes |
| 7 | Static content | Guide questions, intro slides, FAQs, how it works, analysis steps, house layouts, map config and member promos stay in `src/config/promo/*.json` for now |
| 8 | Account and subscription | One call, `start_subscription`, does everything in one database transaction, so a failure leaves no orphan account |
| 9 | Passwords | Sent once over HTTPS in that call and never stored in the browser |
| 10 | Referral link | `?ref=CODE` on the landing page is kept in the flow state. `start_subscription` creates a `Customer Referral` as `Pending`. The first successful payment sets `Signed up` |

## Code

```python
# portal/api/promo.py
import frappe
from frappe.rate_limiter import rate_limit

from portal.services import promo


@frappe.whitelist(allow_guest=True)
def get_campaign(slug: str) -> dict:
	return promo.get_campaign(slug)


@frappe.whitelist(allow_guest=True)
def get_pricing() -> dict:
	return promo.get_pricing()


@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=20, seconds=60)
def classify_address(address: str) -> dict:
	return promo.classify_address(address)  # {"mode": "automatic" | "quote" | "waitlist", "area": str | None}


@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=5, seconds=300)
def submit_quote_request(name: str, phone: str, email: str, address: str, consent: bool) -> dict:
	return promo.create_lead("Promo Quote Request", name, phone, email, address, consent)


@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=5, seconds=300)
def join_waitlist(name: str, phone: str, email: str, address: str, consent: bool) -> dict:
	return promo.create_lead("Promo Waitlist", name, phone, email, address, consent)


@frappe.whitelist(allow_guest=True, methods=["POST"])
def recommend_plans(answers: dict, tier: str) -> list[dict]:
	return promo.recommend_plans(answers, tier)


@frappe.whitelist(allow_guest=True, methods=["POST"])
@rate_limit(limit=3, seconds=300)
def start_subscription(details: dict) -> dict:
	return promo.start_subscription(details)  # {"url": "<payment page>"} or {"status": "active"}
```

```ts
// frontend/src/data/usePromo.ts: guests, so POST reads are fine
export const useCampaign = (slug: () => string) =>
  createResource<Campaign>({
    url: `${config.promoApiPath}.get_campaign`,
    method: "GET",
    makeParams: () => ({ slug: slug() }),
    auto: true,
  });
export const useClassifyAddress = () =>
  createResource<AddressClassification>({ url: `${config.promoApiPath}.classify_address` });
export const useStartSubscription = () =>
  createResource({
    url: `${config.promoApiPath}.start_subscription`,
    onSuccess: ({ url }) => url && (window.location.href = url),
  });
```

What `start_subscription` does, inside one transaction: refuse a duplicate email (with the same message whether or not the email exists, so it does not reveal accounts), create the `User` (Website User, role `Customer`) with the password, the `Customer` with a `Portal User` row, the `Contact`, the `Address` (with `custom_service_address` on the subscription pointing at it), the `Subscription` for the chosen plan, then ask `frappe_paystack` for the payment page for the first invoice.

## Phases

### Phase 0: facts

- Read every promo view, `usePromoFlow`, `promoApi.ts` and the components in `features/promo/components/`. List every field the flow collects and every function it calls. Fix the list of functions above.
- Read `frappe_paystack` and the Summer Special page it already contains: how it creates a Payment Log, saves a card, and bills a subscription on a fixed day. This spec replaces that page. Record which of its code and records to reuse, and what to remove from `frappe_paystack` once this spec ships.
- Check which `Item`, `Item Price`, `Subscription Plan` and `Coupon Code` records already exist for the plans in the mockup. Record prices.
- Decide the map option (open question 2) and the payment model (open question 1) before Phase 5.

### Phase 1: doctypes and seed data

- Create `Promo Campaign`, `Service Area`, `Service Bundle` (with children) and `Promo Plan` as in `data-model.md`. Seed them with a patch (safe to run twice): the campaign, three areas, three bundles with nine tier items and the monthly fertiliser item, and the plan ladder.
- Backend tests: the patch twice leaves one copy of each row, every bundle tier has an `Item Price`.

### Phase 2: read-only guest methods and the landing page

- `get_campaign`, `get_pricing` and `get_public_support` (spec 012). Bind `PromoLandingView`. An unknown or inactive slug, or a campaign outside its dates, shows a friendly "this offer has ended" screen.
- Backend tests: active campaign, inactive, expired, over the new-customer limit, unknown slug. Playwright as a guest: the landing page shows real headline and prices.

### Phase 3: address classification and leads

- `classify_address` from `Service Area` keywords. `submit_quote_request` and `join_waitlist` create a `Lead` with the consent text. Bind the locate, quote requested and waitlist screens.
- Backend tests: each area, an unmatched address, an empty address, an over-long address, a lead without consent is refused, the sixth request in five minutes is refused.
- Playwright: three addresses reach the three outcomes.

### Phase 4: recommendation

- `recommend_plans` in Python from `Promo Plan` rows. Reuse the mockup's test cases (write them down from `promoApi.ts` first) as unit tests, so the result matches what the screens expect today.
- Backend tests: each answer combination in the mockup's rules. Playwright: finish the guide and see the plans in the same order.

### Phase 5: account and subscription, no charge yet

- `start_subscription` creates everything and returns the payment page URL, using a test mode switch that stops before charging.
- Backend tests: the full creation, a duplicate email, a weak password, a failure half way (force an error and check nothing is left behind). Playwright: finish the flow in test mode and log in as the new customer.

### Phase 6: payment, success, coupon and referral

- Connect the payment page, the coupon on the first invoice, and the referral status change after the first successful payment. Bind the success screen to real data.
- Backend tests: coupon applied once, referral becomes `Signed up` after payment and not before. Hand check in Paystack test mode. Playwright with Paystack mocked.

### Phase 7: hardening and docs

- Check every guest method for rate limits, input length limits and error messages that reveal nothing. Add the consent wording to the docs. Light and dark screenshots of every promo screen.

## Tests

- Backend: `portal/tests/test_promo_*.py`.
- Playwright: `e2e/promo.spec.ts`, guest only, three outcomes plus the full happy path.

## Out of scope

- A page that lets staff edit the static content.
- Sales Orders and quotes (that is the quote link in `evergro_core`).
- WhatsApp follow-up of leads.

## Open questions

1. **First payment.** The mockup says the first month is paid today. The Summer Special decision was R1 today and the rest on the day of service, with billing on the 25th. Which applies? Phase 5 does not start until this is answered.
2. **Lawn measuring.** The mockup draws on top of an unofficial Google Maps embed (no key). The drawing assumes the embed's zoom and centre match what the code computed, which Google does not promise, so areas can be wrong. Options: the Maps JavaScript API with a key (billed), or Leaflet with a satellite tile source. Which one?
3. Where should consent for contact be recorded for a lead, since POPIA applies? Default: the lead's notes, with the date and the exact wording shown.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
- [ ] Phase 6
- [ ] Phase 7
