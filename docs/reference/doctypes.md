---
title: Doctypes and fields
---
The records the portal reads and the fields it adds to standard doctypes. The full list, including planned doctypes and the reason for each, is [`specs/data-model.md`](../../specs/data-model.md).

## Standard doctypes it reads today

| Doctype | Used for |
| :--- | :--- |
| `User` | The login. Customers are `Website User` accounts |
| `Customer` | The customer and their "customer since" date |
| `Contact` | Name, mobile number, birthday, picture |
| `Address` | The customer's properties |
| `Sales Invoice` | Billing history |
| `Paystack Customer Authorization` | The saved card, from `frappe_paystack` |

## Custom fields today

| Doctype | Field | Type | Why |
| :--- | :--- | :--- | :--- |
| `Contact` | `custom_birthday` | Date | No standard birthday field |
| `Paystack Customer Authorization` | `custom_default` | Check | Marks the one active card |

They ship in `portal/fixtures/custom_field.json` and reach a site on `bench migrate`.

## Related pages

- [API methods](api.md)
