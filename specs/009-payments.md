# Payments

Date: 2026-11-23
Status: **Draft.** Changed 2026-11-27 (Pay now on any unpaid invoice, the R1 is credited).

## Problem

Customers are billed monthly in advance. They need to see their card and billing history, update their card, and pay an overdue invoice without phoning the office.

## Goal

Account > Payments shows the one card and links to billing history. A customer can add or update their card. A customer with an unpaid invoice can pay it with the saved card or a new card.

## What the mockup has

- Types: `PaymentCard { type, last4, expiry, cardholder }`, `Transaction { id, date, amount, status: Paid | Due | Overdue, type: Invoice | Payment }`, `CheckoutOrder { invoiceNumber, propertyAddress, billingAddress, serviceDate, customer, lineItems, discountLabel, discountAmount, savedCards }`.
- Routes: `payments`, `payments/transactions`, `payments/card`, `payments/checkout`.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | One card per customer | No card: **Add card**. A card: brand, `•••• •••• •••• 4242`, expiry, **Update card**. No remove, no list, no change-default |
| 2 | Active card | `custom_default` stays. The one active card is the default. With legacy data (several active cards) `get_payment_method` returns the default, else the newest. The next successful update deactivates the rest |
| 3 | Cardholder | Paystack does not return a cardholder name. The field is returned empty and the card display hides it |
| 4 | Update card | Charges R1 through Paystack to prove the card, and saves it from that payment. The R1 is not refunded. It is recorded as an unallocated advance `Payment Entry` for the customer and allocated to their next invoice, so they pay R1 less on that day. Helper text: "We charge R1 to check your card. It comes off your next invoice." |
| 5 | Payment page | Built by `frappe_paystack` through the Paystack Payment Log. The portal sends the customer there and does not build its own card form. `CheckoutView` becomes an order summary with a **Pay** button |
| 6 | Billing history | Submitted `Sales Invoice` rows (type `Invoice`) and `Payment Entry` rows (type `Payment`), newest first. Status: `Paid` when nothing is outstanding, `Overdue` when due date has passed, else `Due` |
| 7 | Pay now | Offered on any unpaid submitted invoice, overdue or not (confirmed 2026-11-27). Full outstanding amount only. The customer picks the saved card or a new card |
| 8 | Secrets | `authorization_code` is a Password field. Read it with `doc.get_password(...)` inside the server only. Never fetch it with `get_all`, return it or log it |

## Data

| Item | Source |
| :--- | :--- |
| Card | `Paystack Customer Authorization`: `customer`, `company`, `card_label`, `active`, `customer_code`, `email`, `reusable`, `custom_default`, `channel`, `card_type`, `brand`, `bank`, `last4`, `exp_month`, `exp_year`, `signature`, `authorization_code` |
| Invoices and payments | `Sales Invoice`, `Payment Entry` |
| Payment page | `frappe_paystack`: checkout page reading a Payment Log by reference, `create_payment_link` (accepts a partial amount), `record_consent`, `charge_saved_card` |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_payment_method() -> dict | None:
	return payments.get_payment_method(get_customer_for_session())


@frappe.whitelist()
def get_transactions() -> list[dict]:
	return payments.list_transactions(get_customer_for_session())


@frappe.whitelist()
def get_checkout_order(invoice: str) -> dict:
	customer = get_customer_for_session()
	assert_owns("Sales Invoice", invoice, customer)
	return payments.get_checkout_order(invoice)


@frappe.whitelist(methods=["POST"])
def start_card_update() -> dict:
	return payments.start_card_update(get_customer_for_session())  # {"url": "<payment page>"}


@frappe.whitelist(methods=["POST"])
def start_invoice_payment(invoice: str, use_saved_card: bool = True) -> dict:
	customer = get_customer_for_session()
	assert_owns("Sales Invoice", invoice, customer)
	return payments.start_invoice_payment(invoice, use_saved_card)  # {"status": "paid"} or {"url": "..."}
```

```ts
// frontend/src/data/usePayments.ts
export const usePaymentMethod = () =>
  createResource<PaymentCard | null>({ url: `${config.apiPath}.get_payment_method`, method: "GET", auto: true });
export const useTransactions = () =>
  createResource<Transaction[]>({ url: `${config.apiPath}.get_transactions`, method: "GET", auto: true });
export const useStartCardUpdate = () =>
  createResource<{ url: string }>({
    url: `${config.apiPath}.start_card_update`,
    onSuccess: ({ url }) => (window.location.href = url),
  });
```

## Phases

### Phase 0: facts

- Read the four payment views and `PaymentCardDisplay`, and list their fields.
- Record how an advance `Payment Entry` is allocated to the next `Sales Invoice` on this site (by hand, or automatically by ERPNext), for Decision 4.
- Confirm each card field above exists on `evergro.local`. Count active cards for every customer to see how much legacy data there is.
- Read `frappe_paystack`: the arguments and return values of `create_payment_link`, `record_consent` and `charge_saved_card`, and how its callback marks a payment complete. Write them here.

### Phase 1: read the card

- `get_payment_method` as in Decision 2. Backend tests: no card, one card, several active cards (default wins, else newest), another customer's card never returned.
- Security test: no response and no log line contains `authorization_code`. Mutation check: add it to a response and watch the test fail.

### Phase 2: billing history

- `list_transactions`. Backend tests: paid, due and overdue invoices, a payment entry, a cancelled invoice (excluded), another customer's invoices (excluded). Bind `TransactionsView`.
- Playwright: the list matches the test data.

### Phase 3: card screen and update

- `start_card_update` creates the R1 payment through `frappe_paystack` and returns its URL. The customer returns to `/portal/account/payments/card` afterwards.
- On success the new card is active and default, the others are deactivated, and the R1 is recorded as an advance for the next invoice. On failure the old card stays and an error shows.
- Remove `set_default_payment_method` and `remove_payment_method` from `portal/api/portal.py`, and replace `get_payment_methods`.
- Backend tests: success, failure, the R1 advance is created once, and the callback run twice changes nothing more. Hand check in Paystack test mode with a test card.

### Phase 4: checkout and Pay now

- `get_checkout_order` builds the `CheckoutOrder` from the invoice. `start_invoice_payment` charges the saved card on the server or returns a payment page URL.
- Backend tests: another customer's invoice refused, a paid invoice refused, a double tap charges once. Playwright with a mocked Paystack response for success and failure.

### Phase 5: docs

- Light and dark screenshots of every payment screen. Update `docs/`.

## Tests

- Backend: `portal/tests/test_payments.py`.
- Playwright: `e2e/payments.spec.ts` with Paystack mocked.

## Out of scope

- Removing a card or choosing between cards.
- Changing the billing day. That is a sales decision.
- Refunds.

## Open questions

None. Pay now and the R1 were decided on 2026-11-27.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
