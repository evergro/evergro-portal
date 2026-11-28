---
title: Run it locally
---
This page gets the portal running on your computer, with Frappe on port 8000 and the Vue dev server on port 8080.

## 1. Before you start

- A Frappe v15 bench at `~/frappe-bench` with ERPNext, `frappe_paystack` and `portal` installed on the site `evergro.local`.
- `evergro.local` in your hosts file, pointing at the machine that runs the bench.
- Node and npm.
- `developer_mode` on. It is set in `sites/common_site_config.json` on the dev bench. The dev server needs it to get the CSRF token (see step 3).
- A test customer with a portal login. Ask a team member for one. Never use a real customer's login.

## 2. Start Frappe

1. Run `cd ~/frappe-bench && bench start`.
2. Open `http://evergro.local:8000`. You see the Evergro landing page.

## 3. Start the Vue dev server

1. Run `cd ~/frappe-bench/apps/portal/frontend && npm install`.
2. Run `npm run dev`.
3. Log in at `http://evergro.local:8000/login` with the test customer.
4. Open `http://evergro.local:8080/portal`. Changes you save in `frontend/src/` show at once.

The dev server sends `/api`, `/login`, `/app`, `/desk`, `/assets`, `/files` and `/private` to Frappe on port 8000, so the session cookie works on both ports. Before it mounts the app, the page calls `portal.www.portal.index.get_context_for_dev` to get the CSRF token that the built page gets from Jinja.

> **Warning:** If you open the dev server at a host other than `evergro.local` you see "Blocked request. This host is not allowed". Add the host to `server.allowedHosts` in `frontend/vite.config.ts`.

## 4. Build for Frappe

1. Run `npm run build` in `frontend/`. It writes the app to `portal/public/portal/`. Git ignores that folder, so run the build on every fresh clone and on every deploy. Until you do, `/portal` shows "Frontend not built yet".
2. Run `bench --site evergro.local clear-cache` and `bench --site evergro.local clear-website-cache`, so the page picks up the new file names.
3. Open `http://evergro.local:8000/portal`. This is the version customers get.

Always test the built version before you say a change is done. The dev server and the build differ in their base path and boot data.

## 5. Run the tests

1. In `frontend/`, run `npm test` for the component tests (Vitest).
2. Run `npx playwright install chromium` once, then `npm run test:e2e` for the browser tests. They need a test customer: set `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD` and `E2E_CUSTOMER_NAME`, and for the staff test `E2E_STAFF_EMAIL` and `E2E_STAFF_PASSWORD`. A test that needs an account that is not set is skipped.
3. Run `bench --site evergro.local run-tests --app portal` for the backend. If it says "Testing is disabled for the site", run `bench --site evergro.local set-config allow_tests true`.

> **Note:** On a server without a desktop, Chromium needs the `libasound2t64` package (`sudo apt install libasound2t64`). Without it the browser tests fail with "error while loading shared libraries: libasound.so.2".

## Related pages

- [First contribution](first-contribution.md)
- [How it works](../introduction/how-it-works.md)
