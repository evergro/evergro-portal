# Referrals

Date: 2026-11-23
Status: **Draft.** Creates `Customer Referral` and the referral settings.

## Problem

`ReferView` shows a referral code, a link, a goal, rewards and a list of referred friends, all fake.

## Goal

A customer sees their own code and link, how many friends signed up, what they have earned, and each friend's status.

## What the mockup has

`ReferralSummary { code, url, goal, rewardPerReferral, bonus, referrals: [{ name, month, status: "Signed up" | "Pending", reward }] }`. Route `/portal/account/refer`.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Code | New field `Customer.custom_referral_code`, created the first time the customer opens Refer a friend. Same code every time |
| 2 | Code format | First name in capitals plus three digits, checked unique (for example `LINDIWE284`) |
| 3 | Link | `referral_base_url` from `Evergro Portal Settings` plus `/` plus the code |
| 4 | Referrals | One `Customer Referral` row for each friend. The promo flow (spec 013) creates it as `Pending` when a friend uses the link and sets `Signed up` after their first payment |
| 5 | Rewards | Goal, reward for each referral and bonus come from settings. `reward` on a row is the reward amount when `Signed up`, else 0 |
| 6 | Applying the reward | Out of scope. This spec records and shows the reward. Billing applies it later |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_referral() -> dict:
	return referrals.get_referral(get_customer_for_session())
```

```python
# portal/services/referrals.py
def get_or_create_code(customer: str) -> str:
	code = frappe.db.get_value("Customer", customer, "custom_referral_code")
	if code:
		return code
	code = make_unique_code(frappe.db.get_value("Customer", customer, "customer_name"))
	frappe.db.set_value("Customer", customer, "custom_referral_code", code)
	return code
```

```ts
export const useReferral = () =>
  createResource<ReferralSummary>({ url: `${config.apiPath}.get_referral`, method: "GET", auto: true });
```

## Phases

### Phase 0: facts

- Read the referral policy text in the mockup. Check that `Customer` has no referral field. Count customers with a duplicate first name.

### Phase 1: doctypes and fields

- Create `Customer Referral`, `Evergro Portal Settings` and `Customer.custom_referral_code` (fixture). Fill the settings with 5, 150 and 500.
- Backend tests: the doctype saves with each status, the settings return defaults.

### Phase 2: code and link

- `get_or_create_code` and `get_referral` with an empty list. Backend tests: the same code twice, two customers named alike get different codes, another customer's code is never returned.
- Playwright: open Refer a friend and the code and link show. The copy button puts the link on the clipboard.

### Phase 3: referred friends

- Add the `referrals` list and totals. Backend tests: no referrals, a pending one, a signed-up one with the reward, only own referrals.
- Playwright: seed one of each and see the statuses.

### Phase 4: docs

- Screenshots in `docs/`. Document how staff create a referral by hand until spec 013 does it.

## Tests

- Backend: `portal/tests/test_referrals.py`.
- Playwright: `e2e/refer.spec.ts`.

## Out of scope

- Applying the reward to an invoice.
- Sharing through WhatsApp from the app.

## Open questions

None.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
