---
title: What is the portal
---
The portal is a small Frappe app that gives Evergro's recurring customers their own screens on top of ERPNext. Staff keep working in Frappe Desk. Customers never see Desk.

## Who uses it

| Person | Where they go | What they do |
| :--- | :--- | :--- |
| A visitor | `/` | Reads the landing page and clicks **Customer login** |
| A customer | `/portal` | Uses the four tabs: **Home**, **Schedule**, **Support** and **Account** |
| A staff member | `/app` | Works in Frappe Desk as before |

A customer is a `Website User` with the `Customer` role, linked to one ERPNext `Customer`.

## What works today

- The landing page at `/` and the Evergro login page at `/login`.
- After login, customers go to `/portal` and staff go to `/app`.
- The portal screens and their URLs, from the design mockup. They show sample data. Each screen gets real data in its own spec.

> **Note:** A logged-in customer who opens `/` lands in the portal, not on the landing page. [Spec 001](../../specs/001-login-landing-and-root-routing.md) changes this.

## Related pages

- [How it works](how-it-works.md)
- [Run it locally](../development/run-locally.md)
