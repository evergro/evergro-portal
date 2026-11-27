---
title: How it works
---
The portal has two parts: Jinja pages that Frappe renders on the server, and a Vue app that runs in the browser and asks Frappe for data. This page shows how they fit.

## The parts

| Part | Where | What it does |
| :--- | :--- | :--- |
| Landing page | `portal/www/index.html` | The public page at `/` |
| Login page | `portal/www/login.html` | Sends the email and password to Frappe's standard `login` method |
| Portal host page | `portal/www/portal/index.html` | Loads the built Vue app for every `/portal` URL, and sends guests to `/login` |
| Vue app | `frontend/src/` | The screens. Vue 3, Vue Router, Tailwind 3 and `frappe-ui` |
| API | `portal/api/portal.py` | Whitelisted methods the Vue app calls at `/api/method/portal.api.portal.<method>` |

## A request, step by step

1. The customer opens `/portal/schedule`.
2. Frappe matches the route rule in `portal/hooks.py` and renders `portal/www/portal/index.html`.
3. The page loads the built script from `/assets/portal/portal/`.
4. Vue Router shows the screen for `/portal/schedule`.
5. The screen asks for its data. **Today** it reads sample data from `frontend/src/services/mockApi.ts`. **Planned** ([spec 002](../../specs/002-frontend-foundation-and-config.md)): a composable in `frontend/src/data/` calls `portal.api.portal` through `createResource`.
6. The API method works out the customer from the session, reads ERPNext records and returns the shape in `frontend/src/types/index.ts`.

> **Warning:** Never take the customer from the browser. A method that accepts a customer name lets anyone read anyone's data.

## Related pages

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md)
- [API methods](../reference/api.md)
