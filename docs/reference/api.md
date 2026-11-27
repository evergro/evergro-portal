---
title: API methods
---
Every method the Vue app calls. Customer methods live in `portal.api.portal` and need a logged-in customer. The full planned list is the method map in [spec 003](../../specs/003-customer-api-and-security.md).

> **Note:** The methods below exist today but are not yet used by the screens, and they return their own shapes, not the types in `frontend/src/types/index.ts`. Spec 003 replaces them one by one. This page is rewritten as each one is replaced.

| Method | What it returns today |
| :--- | :--- |
| `get_profile()` | Name, email, phone, birthday, customer since, and whether there is a picture |
| `update_profile(first_name, last_name, phone, birthday)` | Saves the contact |
| `get_private_image(doctype, name)` | The private image of the customer's own `Contact` or `Address` |
| `get_addresses()` | The addresses linked to the customer |
| `get_invoices()` | Submitted sales invoices, newest first |
| `get_payment_methods()` | Active saved cards. Planned to become `get_payment_method()`, one card ([spec 009](../../specs/009-payments.md)) |
| `set_default_payment_method(name)`, `remove_payment_method(name)` | Card changes. Planned for removal ([spec 009](../../specs/009-payments.md)) |

## Related pages

- [Doctypes and fields](doctypes.md)
