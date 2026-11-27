---
title: Run it locally
---
This page gets the portal running on your computer, with Frappe on port 8000 and the Vue dev server on port 8080.

## 1. Before you start

- A Frappe v15 bench at `~/frappe-bench` with ERPNext, `frappe_paystack` and `portal` installed on the site `evergro.local`.
- `evergro.local` in your hosts file, pointing at the machine that runs the bench.
- Node and npm.
- A test customer with a portal login. Ask a team member for one. Never use a real customer's login.

## 2. Start Frappe

1. Run `cd ~/frappe-bench && bench start`.
2. Open `http://evergro.local:8000`. You see the Evergro landing page.

## 3. Start the Vue dev server

1. Run `cd ~/frappe-bench/apps/portal/frontend && npm install`.
2. Run `npm run dev`.
3. Log in at `http://evergro.local:8000/login` with the test customer.
4. Open `http://evergro.local:8080/portal`. Changes you save in `frontend/src/` show at once.

The dev server sends `/api`, `/login`, `/logout` and `/app` to Frappe on port 8000, so the session cookie works on both ports.

> **Note:** `package.json` and `node_modules` do not match yet. If `npm install` breaks the styles, see finding 6 in [spec 002](../../specs/002-frontend-foundation-and-config.md).

## 4. Build for Frappe

1. Run `npm run build` in `frontend/`. It writes the app to `portal/public/portal/`.
2. Run `bench --site evergro.local clear-cache`.
3. Open `http://evergro.local:8000/portal`. This is the version customers get.

Always test the built version before you say a change is done. The dev server and the build differ in their base path and boot data.

## Related pages

- [First contribution](first-contribution.md)
- [How it works](../introduction/how-it-works.md)
