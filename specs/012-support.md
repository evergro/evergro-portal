# Support

Date: 2026-11-23
Status: **Draft.** Small. Contact details only, as in the mockup.

## Problem

The Support tab and the promo pages show a phone number and a WhatsApp number from fake data.

## Goal

The numbers come from one settings record that staff can change without a developer.

## What the mockup has

`SupportView` calls the support loader and shows call and WhatsApp buttons. The promo pages (`PromoLandingView`, `QuoteRequestedView`) show the same numbers to guests.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Where numbers live | `Evergro Portal Settings` (`support_phone`, `support_whatsapp`) |
| 2 | Buttons | `tel:` link and `https://wa.me/<number>` link |
| 3 | Guests | A separate guest method that returns the same two numbers only |
| 4 | Tickets | Not in the mockup. A ticket form on `Issue` is a later spec |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_support() -> dict:
	return support.get_support()


# portal/api/promo.py
@frappe.whitelist(allow_guest=True)
def get_public_support() -> dict:
	return support.get_support()
```

```ts
export const useSupport = () =>
  createResource<Support>({ url: `${config.apiPath}.get_support`, method: "GET", auto: true });
```

## Phases

### Phase 0: facts

- Ask which number customers should see, since Evergro has two phone numbers. Record the answer.

### Phase 1: settings and method

- Fill `Evergro Portal Settings` (created in spec 010 Phase 1). `get_support` returns the numbers. Backend test: it returns the settings values and refuses a guest.
- Playwright: the Support tab buttons have the right `tel:` and `wa.me` links.

### Phase 2: guest method

- `get_public_support` with rate limiting. Backend test: a guest gets the numbers and nothing else, and many calls in a minute are refused. Playwright: the promo landing page shows the numbers.

### Phase 3: docs

- Screenshots in `docs/`. Document where staff change the numbers.

## Tests

- Backend: `portal/tests/test_support.py`.
- Playwright: `e2e/support.spec.ts`.

## Out of scope

- Tickets, live chat and the chatbot.

## Open questions

1. Which phone number and WhatsApp number do customers see?

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
