# Customer API and security

Date: 2026-11-23
Status: **Draft.** Every data spec depends on this one.

## Problem

The screens call functions in `mockApi.ts`. The real methods must return the same data, only ever for the logged-in customer. Today nothing works out who the customer is, and nothing checks that a requested record belongs to them.

## Goal

- Every method in `portal.api.portal` works out the customer from the session.
- Every method that takes a `name` or `id` checks the record belongs to that customer, and answers "not found" otherwise.
- Every response has the exact shape of `src/types/index.ts`.
- A guest cannot call any of these methods.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Customer lookup | `get_parents_for_user("Customer", frappe.session.user)` from `erpnext.controllers.website_list_for_contact`. It reads the `Portal User` rows on the Customer. Exactly one customer, or a clear error |
| 2 | Ownership | `assert_owns(doctype, name)` for every record id the client sends. A record that is not theirs gives "not found", so ids cannot be guessed |
| 3 | Guests | Methods use `@frappe.whitelist()` with no `allow_guest`. Only `portal.api.promo` has guest methods, and each is read-only config or rate limited |
| 4 | File layout | `portal/api/portal.py` holds the thin whitelisted functions. Logic lives in `portal/services/<topic>.py` (visits, properties, payments, profile, notifications, referrals, support), each under 500 lines |
| 5 | Response shape | The `types/index.ts` shape, in camelCase. Serializers in `portal/services/serializers.py` build it. Dates come twice: a display string (`"18 June 2025"`) and `isoDate` |
| 6 | Errors | `frappe.throw` with a plain English message and a Frappe exception class (`PermissionError`, `DoesNotExistError`, `ValidationError`) |
| 7 | Frontend | A composable for each kind of data in `src/data/`, using `createResource` with `method: "GET"` for reads and `.submit()` for writes |

## Code

```python
# portal/services/customer.py
import frappe
from erpnext.controllers.website_list_for_contact import get_parents_for_user
from frappe import _


def get_customer_for_session() -> str:
	customers = get_parents_for_user("Customer", frappe.session.user)
	if len(customers) != 1:
		frappe.throw(_("Your login is not linked to one customer account."), frappe.PermissionError)
	return customers[0]


def assert_owns(doctype: str, name: str, customer: str, customer_field: str = "customer") -> None:
	if frappe.db.get_value(doctype, name, customer_field) != customer:
		frappe.throw(_("Not found"), frappe.DoesNotExistError)
```

```python
# portal/api/portal.py: every method has this shape
import frappe

from portal.services import visits
from portal.services.customer import get_customer_for_session


@frappe.whitelist()
def get_visits(month: str | None = None) -> list[dict]:
	return visits.list_visits(get_customer_for_session(), month)
```

## Method map

The mock function names are from `mockApi.ts` and `promoApi.ts` at the time of review. Phase 0 checks them against the file and fills the last column.

| Mock function | Real method | Spec | Real source |
| :--- | :--- | :--- | :--- |
| `getCustomer` | `get_profile` | 007 | Customer, Contact, User |
| `updateCustomer` | `update_profile` | 007 | Contact |
| (none) | `update_password` | 007 | User |
| `getVisits` | `get_visits` | 006 | Service Visit |
| `getVisit` | `get_visit` | 006 | Service Visit |
| `getNextVisit`, `getLastVisit` | `get_next_visit`, `get_last_visit` (or one `get_home`) | 005 | Service Visit |
| `getProperties`, `getProperty` | `get_properties`, `get_property` | 008 | Address, Subscription |
| (none) | `update_access_notes` | 008 | Address |
| `getTransactions` | `get_transactions` | 009 | Sales Invoice, Payment Entry |
| `getActiveCard` | `get_payment_method` | 009 | Paystack Customer Authorization |
| `getCheckoutOrder`, `payCheckoutOrder` | `get_checkout_order`, `start_invoice_payment` | 009 | Sales Invoice, `frappe_paystack` |
| (none) | `start_card_update` | 009 | `frappe_paystack` |
| `getNotificationSettings`, `saveNotificationSettings` | `get_notification_settings`, `save_notification_settings` | 011 | Customer Notification Setting |
| `getReferral` | `get_referral` | 010 | Customer Referral, Customer |
| `getSupport` | `get_support` | 012 | Evergro Portal Settings |
| Promo functions | `portal.api.promo.*` | 013 | See spec 013 |
| `logout` (client only) | `logout` (standard Frappe) | 002 | Session |

## Phases

### Phase 0: facts

- In the bench console, run `get_parents_for_user("Customer", "<test customer email>")`. Record the result for a customer with a login. Check how the `Portal User` rows were created.
- List every exported function in `mockApi.ts` and `promoApi.ts`. Fix the method map above.
- Record whether any real method already exists in `portal/api/portal.py`. Reuse it. Do not duplicate it. On 2026-11-27 it had `_get_customer` (finds the customer through `Contact Email`, not `Portal User`), `get_profile`, `update_profile`, `get_private_image`, `get_addresses`, `get_invoices`, `get_payment_methods`, `set_default_payment_method` and `remove_payment_method`. The last two break the one-card rule (spec 009) and go when spec 009 replaces them. Check that every customer has a `Portal User` row before you switch the lookup.
- Create two test customers with portal users and one with none, as fixtures for the tests (`portal/tests/utils.py`: `make_customer_with_login(email)`).

### Phase 1: customer from the session

- Add `portal/services/customer.py`. Backend tests: a customer's user gets their customer, a user with no customer gets the clear error, a user linked to two customers gets the clear error, a guest is refused.
- Mutation check: change `assert_owns` to always pass, confirm the cross-customer test fails, restore it.

### Phase 2: profile end to end

- Implement `get_profile` (spec 007 holds the fields) and `useProfile`. The shell header and the Account screen read the same resource, so one request serves both.
- Backend test for the response shape against `types/index.ts` field names. Vitest for the composable with a fake `fetcher`.
- Hand check: log in as two customers, and each sees their own name.

### Phase 3: guard test for every method

- A test walks every function in `portal.api.portal` and fails if it is whitelisted with `allow_guest`. A second test calls each method as a guest and expects a refusal.
- For each method with a `name` or `id` argument, one test asks for the other customer's record and expects "not found".

### Phase 4: serializers and date format

- `serializers.py` builds each type. A test per serializer compares the keys with the TypeScript type, read from a JSON list of keys kept next to the type.
- Dates: display `dd MMMM yyyy` and an `isoDate`. One shared function. Test it for a leap day and the year end.

## Tests

- Backend: `portal/tests/test_customer_lookup.py`, `test_api_guard.py`, `test_serializers.py`.
- Vitest: each composable against a fake fetcher.

## Out of scope

- The methods for each feature (their own specs).
- Caching and offline use.

## Open questions

1. If a person ever has two customers (for example a landlord with two accounts), should they pick one? Default: no, one login is one customer, as at 17 customers today.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
