# Support

Date: 2026-11-23, changed 2026-11-27
Status: **Draft.** Small. Contact details only, as in the mockup.

## Problem

The Support tab and the promo pages show a phone number and a WhatsApp number from fake data.

## Goal

The numbers come from the company record in ERPNext, so staff change them in one place without a developer.

## What the mockup has

`SupportView` calls the support loader and shows call and WhatsApp buttons. The promo pages (`PromoLandingView`, `QuoteRequestedView`) show the same numbers to guests.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Which company | The default company: `Global Defaults > default_company` (`Evergro` on `evergro.local`) |
| 2 | Phone | The standard `Company.phone_no` field |
| 3 | WhatsApp | New custom field `Company.custom_whatsapp` (Data, digits with country code, for example `27...`). Company has no standard WhatsApp field |
| 4 | Buttons | `tel:` link and `https://wa.me/<number>` link. A button whose number is empty is hidden |
| 5 | Guests | A separate guest method that returns the same two numbers only |
| 6 | Tickets | Not in the mockup. A ticket form on `Issue` is a later spec |

## Code

```python
# portal/services/support.py
import frappe


def get_support() -> dict:
	company = frappe.db.get_single_value("Global Defaults", "default_company")
	phone, whatsapp = frappe.db.get_value("Company", company, ["phone_no", "custom_whatsapp"])
	return {"phone": phone or "", "whatsapp": whatsapp or ""}
```

```python
# portal/api/portal.py
@frappe.whitelist()
def get_support() -> dict:
	return support.get_support()


# portal/api/promo.py
@frappe.whitelist(allow_guest=True)
@rate_limit(limit=30, seconds=60)
def get_public_support() -> dict:
	return support.get_support()
```

```ts
export const useSupport = () =>
  createResource<Support>({ url: `${config.apiPath}.get_support`, method: "GET", auto: true });
```

## Phases

### Phase 0: facts

- Record the default company, its `phone_no`, and that `Company` has no WhatsApp field yet. Read the `Support` type in `types/index.ts` and list its keys.

### Phase 1: field, method and Support tab

- Add `Company.custom_whatsapp` as a fixture. Fill it and `phone_no` on the default company. `get_support` returns the numbers.
- Backend tests: it returns the company values, an empty WhatsApp gives `""`, a guest is refused.
- Playwright: the Support tab buttons have the right `tel:` and `wa.me` links.

### Phase 2: guest method

- `get_public_support` with rate limiting. Backend test: a guest gets the two numbers and nothing else, and too many calls in a minute are refused.
- Playwright: the promo landing page shows the numbers.

### Phase 3: docs

- Screenshots in `docs/`. Document that staff change the numbers in Desk on the default **Company**.

## Tests

- Backend: `portal/tests/test_support.py`.
- Playwright: `e2e/support.spec.ts`.

## Out of scope

- Tickets, live chat and the chatbot.

## Open questions

None. Decided 2026-11-27: the numbers come from the default company.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
