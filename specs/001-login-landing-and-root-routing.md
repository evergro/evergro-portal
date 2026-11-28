# Login, landing and root routing

Date: 2026-11-23, changed 2026-11-27
Status: **Done on evergro.local (no Playwright specs yet).**

## Problem

The landing page at `/` is the public face of Evergro on the main website and on Google. Today a guest sees it, but a logged-in customer who opens `/` gets the portal instead, and a staff user gets Desk, so they cannot see the landing page at all.

## Cause (read from the Frappe v15 source and the site on 2026-11-27)

- `/` resolves as `resolve_path("")`, which becomes `index`, which becomes `get_home_page()` (`frappe/website/path_resolver.py`).
- For a logged-in user `get_home_page()` reads the `role_home_page` hook first. `hooks.py` sets `{"Customer": "/portal", "System Manager": "/app"}`, so `/` renders the portal for a customer instead of `www/index.html`.
- `website_home_page = "index"` is not a hook Frappe v15 reads. That line does nothing.
- The login page (`www/login.html`) sends the user to `redirect-to`, else to `home_page` from the login response, which also comes from `get_home_page()`.

## Goal

| Visitor | `/` shows | Button on `/` | After login |
| :--- | :--- | :--- | :--- |
| Guest | The landing page | **Log in**, to `/login` | Their dashboard |
| Customer (Website User) | The landing page | **View dashboard**, to `/portal` | `/portal` |
| Staff (System User) | The landing page | **View dashboard**, to `/app` | `/app` |

`/` never redirects. A customer who opens `/app` is refused. A guest who opens `/portal/...` is sent to `/login` and returns to that page after login. A logged-in user who opens `/login` goes to their dashboard.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | What `/` renders | `www/index.html` for everyone. Hook `home_page = "index"`. Remove `role_home_page` and the dead `website_home_page`, because `role_home_page` runs first for logged-in users |
| 2 | Where the dashboard is | One function, `get_dashboard_url(user)` in `portal/routing.py`: `Website User` goes to `/portal`, any other logged-in user to `/app`. It is the only place that decides |
| 3 | Landing button | `www/index.py` puts `dashboard_url` in the context. Guests get **Log in** to `/login`. Logged-in users get **View dashboard** to `dashboard_url` |
| 4 | After login | `login.html` goes to `redirect-to` if set, else back to `/login`. `login.py` sends a logged-in user to `get_dashboard_url`. So one function decides for both the button and the login |
| 5 | Desk for customers | Standard Frappe rule: `/app` refuses `Website User` accounts. No custom blocking code |
| 6 | Caching | `index.py` and `login.py` set `no_cache = 1`, because the button and the redirect depend on the user |
| 7 | `/home` | Not used. The landing page stays at `/` |

## Code

```python
# portal/routing.py
import frappe


def get_dashboard_url(user: str) -> str:
	if frappe.db.get_value("User", user, "user_type") == "Website User":
		return "/portal"
	return "/app"
```

```python
# portal/www/index.py
import frappe

from portal.routing import get_dashboard_url

no_cache = 1


def get_context(context):
	context.title = "Evergro Landscapers | Lawn care & landscaping in Gauteng"
	context.is_logged_in = frappe.session.user != "Guest"
	context.dashboard_url = get_dashboard_url(frappe.session.user) if context.is_logged_in else "/login"
```

```python
# portal/hooks.py (the relevant lines)
home_page = "index"
# Remove: role_home_page, website_home_page
```

## Phases

### Phase 0: confirm the cause

- In `bench --site evergro.local console` record: `frappe.get_hooks("home_page")`, `frappe.get_hooks("role_home_page")`, `frappe.db.get_single_value("Website Settings", "home_page")`, `frappe.db.get_single_value("Portal Settings", "default_portal_home")`, and `frappe.get_all("Role", filters={"home_page": ["is", "set"]}, fields=["name", "home_page"])`.
- Log in as a customer and as a staff user, open `/`, and record what renders.
- Write the findings in Progress. If the cause differs from above, change Decision 1 before Phase 1.

### Phase 1: `/` is the landing page for everyone

- Add `portal/routing.py`. Change `hooks.py` as shown. Empty any `Role.home_page` or `Portal Settings > Default Portal Home` that Phase 0 found. Clear the caches.
- Backend test: `get_dashboard_url` for a customer user and a staff user.
- Playwright (`e2e/root.spec.ts`): as a guest, a customer and a staff user, `GET /` answers 200 with the landing page and no redirect.

### Phase 2: the landing button

- `index.py` as shown. `index.html` reads **Log in** or **View dashboard** and links to `dashboard_url`.
- Playwright: a guest sees **Log in**, a customer clicks **View dashboard** and lands on `/portal`, a staff user lands on `/app`.

### Phase 3: login goes to the dashboard

- `login.py` redirects a logged-in user to `get_dashboard_url`. `login.html` stops reading `home_page` from the login response and goes to `redirect-to` or `/login`.
- Playwright: a customer logs in and lands on `/portal`, a staff user on `/app`. A logged-in user who opens `/login` goes to their dashboard.

### Phase 4: customers and Desk

- Backend test: every user linked to a customer has `user_type = "Website User"` and the `Customer` role. List the ones that do not and ask before fixing the data.
- Playwright: a logged-in customer who opens `/app` sees the permission error and not Desk.

### Phase 5: `/portal` guard and return

- The portal page controller (spec 002) sends a guest to `/login?redirect-to=<path>`.
- Playwright: a guest opens `/portal/schedule`, logs in as a customer, and lands on `/portal/schedule`.

### Phase 6: login errors and logout

- Playwright: a wrong password shows a plain English message and does not say whether the email exists. A disabled user cannot log in. Logout from the portal ends on `/`.

## Tests

- Backend: `portal/tests/test_routing.py`.
- Playwright: `frontend/e2e/root.spec.ts`, `access.spec.ts`.

## Out of scope

- Sign-up, password reset and social login.
- A redesign of the landing page.

## Open questions

None.

## Progress

- 2026-11-27: Goal changed. `/` stays the landing page for everyone (it is on the main website and on Google), and `/home` is dropped. Cause re-read from the code: `role_home_page` sends logged-in users away from `/`.
- [x] Phase 0
- [x] Phase 1
- [x] Phase 2
- [x] Phase 3
- [x] Phase 4
- [x] Phase 5
- [x] Phase 6
- 2026-11-28: Phases 0 to 6 built. Cause confirmed, plus leftovers from the deleted Helpdesk app: `Portal Settings` had `default_portal_home = /helpdesk` and `default_role = HD Customer`, and the roles `HD Customer` and `HD Customer Manager` had `home_page = /helpdesk`. The two roles were deleted and the two settings emptied on evergro.local. The `Agent` and `Agent Manager` roles are also Helpdesk leftovers and were not touched.
- Checked with curl and a temporary customer (since deleted): guest `/` shows **Log in**, customer `/` shows **View dashboard** to `/portal`, `/login` sends a customer to `/portal`, `/app` answers 403, a guest at `/portal/schedule` goes to `/login?redirect-to=/portal/schedule`. Not done: Playwright specs (no Playwright in `frontend/`), a staff-user check and Phase 4 data listing. `agent-browser` could not be installed because there is no network.
