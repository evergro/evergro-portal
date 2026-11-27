# Frontend foundation and config

Date: 2026-11-23
Status: **Draft.** Changed 2026-11-27 (Tailwind 3 and `frappe-ui` components). Everything that makes the built app talk to Frappe as the logged-in customer.

## Problem

`npm run build` works and the app loads at `/portal`, but every screen reads fake data from `src/services/mockApi.ts` and `promoApi.ts`. `frappe-ui` is installed but never set up, so no request carries the session or the CSRF token. Some config is also wrong or missing (see findings).

## Findings from the mockup

| # | Finding | Effect |
| :--- | :--- | :--- |
| 1 | `main.ts` never calls `setConfig`, so `frappe-ui` has no request function | Calls would not carry the CSRF token |
| 2 | `index.html` still has Figma placeholders: `<html lang="<!-- figma:lang -->">` and `<title><!-- figma:title --></title>` | Invalid language and no page title |
| 3 | `base: 'portal/'` has no leading slash. Vite turns it into `/portal/`, so scripts load from `/portal/assets/...`, the same prefix as the app's routes | A deep link refresh can fail to load scripts |
| 4 | The dev proxy covers `api`, `login`, `logout`, `app` only | Photos (`/files`, `/private`) and `/assets` fail in dev |
| 5 | The hand-written build config does not inject the CSRF token into the built page | Every POST would be refused |
| 6 | `package.json`, `package-lock.json` and `pnpm-lock.yaml` say Tailwind 4 and `frappe-ui` 0.1.278, but `node_modules` has Tailwind 3.4 and `frappe-ui` 1.2.0, and `tailwind.config.js`, `postcss.config.js` and `index.css` use the `frappe-ui` preset and `style.css` | Installs are not repeatable. Pin Tailwind 3 and `frappe-ui` 1.x in `package.json`, drop `@tailwindcss/vite`, keep only `package-lock.json` |
| 7 | `frappeRequest` sends **POST** by default | Every portal read is a POST unless `method: "GET"` is set. Set it for reads |
| 8 | `frappeRequest` sets `e.status` from a string, so it is `undefined` | Read the status from `error.response.status` |
| 9 | Logout only clears `sessionStorage` and navigates | The server session stays alive |
| 10 | The router has `/promo` and `/start/*`, but the server route rule covers `/portal/*` only | Promo pages 404 on refresh |

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | What to use from `frappe-ui` | Data: `createResource`, `createListResource`, `call`, `setConfig`, `frappeRequest`. UI: Tailwind 3 with the `frappe-ui` preset and `style.css`. Use a `frappe-ui` component when we have none for the job, or when it does more than ours, fits the Evergro theme and makes the layout easier |
| 2 | Where data lives | One composable for each kind of data in `src/data/`. Views bind to the resource (`data`, `loading`, `error`, `reload`) and never call `fetch` |
| 3 | Mock vs real | One flag, `VITE_USE_MOCK_API`. `src/services/api.ts` exports each function from the real composable, or from the mock while a screen is not migrated. The flag is `false` in `.env.development` and `.env.production` |
| 4 | Build output | Vite builds to `portal/public/portal`. Assets are served by Frappe at `/assets/portal/portal/`. The built `index.html` is copied to `portal/www/portal.html` so Frappe can render it as a template |
| 5 | CSRF and boot data | `www/portal.py` puts `csrf_token` in `context.boot`. The `frappe-ui/vite` plugin turns that into `window.csrf_token` in the built page. In dev, `main.ts` fetches the same values from a developer-mode-only method |
| 6 | One SPA host page for three prefixes | Route rules send `/portal/*`, `/promo/*` and `/start/*` to the page `portal`. Only `/portal/*` requires login |
| 7 | Base URL | `/assets/portal/portal/` in a build, `/` in dev |

## Code

```ts
// frontend/src/main.ts
import { createApp } from "vue";
import { frappeRequest, setConfig } from "frappe-ui";
import App from "./App.vue";
import router from "./router";
import { loadDevelopmentBoot } from "@/config/boot";
import { goToLogin } from "@/config/session";
import "./index.css";

setConfig("resourceFetcher", frappeRequest);
setConfig("fallbackErrorHandler", (error: any) => {
  if ([401, 403].includes(error?.response?.status)) goToLogin();
});

loadDevelopmentBoot().then(() => createApp(App).use(router).mount("#root"));
```

```ts
// frontend/src/config/env.ts
export const config = {
  useMockApi: import.meta.env.VITE_USE_MOCK_API === "true",
  apiPath: "portal.api.portal",
  promoApiPath: "portal.api.promo",
} as const;
```

```ts
// frontend/src/config/boot.ts: development only; the built page gets these from Jinja
import { call } from "frappe-ui";

export async function loadDevelopmentBoot() {
  if (!import.meta.env.DEV) return;
  const boot = await call("portal.www.portal.get_context_for_dev");
  Object.assign(window, boot);
}
```

```ts
// frontend/src/data/useProfile.ts: the pattern every composable follows
import { createResource } from "frappe-ui";
import { config } from "@/config/env";
import type { Customer } from "@/types";

export function useProfile() {
  return createResource<Customer>({
    url: `${config.apiPath}.get_profile`,
    method: "GET",
    cache: ["portal", "profile"],
    auto: true,
  });
}
```

```vue
<!-- In a view: replaces onMounted + await getCustomer() -->
<script setup lang="ts">
import { useProfile } from "@/data/useProfile";
const profile = useProfile();
</script>
<template>
  <AsyncState :resource="profile">
    <p>{{ profile.data.name }}</p>
  </AsyncState>
</template>
```

```python
# portal/www/portal.py
import frappe
from frappe import _

no_cache = 1


def get_boot() -> dict:
	return {"csrf_token": frappe.sessions.get_csrf_token()}


def get_context(context):
	if frappe.local.request.path.startswith("/portal") and frappe.session.user == "Guest":
		frappe.redirect("/login?redirect-to=" + frappe.local.request.path)
	context.boot = get_boot()


@frappe.whitelist()
def get_context_for_dev():
	if not frappe.conf.developer_mode:
		frappe.throw(_("This is for development only."))
	return get_boot()
```

```ts
// frontend/vite.config.ts (relevant parts)
import frappeui from "frappe-ui/vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/assets/portal/portal/" : "/",
  plugins: [
    frappeui({
      frontendRoute: "/portal",
      lucideIcons: false,
      buildConfig: {
        outDir: path.resolve(__dirname, "../portal/public/portal"),
        indexHtmlPath: path.resolve(__dirname, "../portal/www/portal.html"),
        baseUrl: "/assets/portal/portal/",
      },
    }),
    vue(),
  ],
  server: { host: "0.0.0.0", port: 8080, strictPort: true },
}));
```

`frappeui({ frappeProxy })` is on by default. It proxies `/desk`, `/app`, `/login`, `/api`, `/assets`, `/files` and `/private` to Frappe on the port in `common_site_config.json`. Remove the hand-written `proxy` block.

## Phases

### Phase 0: record how the page is served today

- Open the built app at `/portal`. In the Network tab record where `index.html` and the JS come from. Write the answer here: which file renders the page, and the URL of the scripts.
- Refresh on `/portal/account` and on `/portal/schedule/v1`. Record whether scripts load.
- Check whether `window.csrf_token` exists on the page. Record the Frappe route rule for `/portal`.
- List the installed versions of `frappe-ui`, `vite` and `tailwindcss`, and the versions in `package.json` and each lockfile.

### Phase 0.5: one repeatable install

- Set `tailwindcss` 3.4 and `frappe-ui` 1.x in `package.json`, remove `@tailwindcss/vite`, delete `pnpm-lock.yaml`, and run `npm install` so `package-lock.json` matches.
- Automatic check: `rm -rf node_modules && npm ci && npm run build && npm run typecheck` passes.
- Hand check: `/portal` looks the same as before, at 390 px and 1280 px wide.

### Phase 1: one real call end to end

- Clean `index.html` (language `en`, title `Evergro Portal`, real favicon). Add `.env.development` and `.env.production` with `VITE_USE_MOCK_API=false`.
- Add `setConfig`, the `frappe-ui/vite` plugin, `www/portal.py`, the route rules for all three prefixes, `src/config/*` and `useProfile`.
- Add the backend method `get_profile` as a stub returning the session user's full name only.
- Hand check: log in as a customer at `evergro.local:8000/login`, open `/portal`, and the header shows the real name. In dev (`npm run dev`, `evergro.local:8080/portal`) it shows the same name. Cookies are shared across ports on the same host.
- Playwright: customer login, open `/portal`, the name equals the test customer's name.

### Phase 2: production build and deep links

- `npm run build`. Confirm `portal/www/portal.html` is created and contains the boot script. Run `bench --site evergro.local clear-cache`.
- Playwright: open `/portal/account/profile` directly and refresh. The page loads with scripts and the right name. Check `/promo` and `/start/locate` (the second redirects to `/promo` without an address; that is expected).
- Hand check: bundle size. Record the size before and after importing `frappe-ui`. If the increase is large, report it before going on.

### Phase 3: the services switch and the shared state component

- Add `src/services/api.ts` and the flag. Add `AsyncState.vue` (loading, error with retry, empty) and the Vitest setup.
- Vitest: `AsyncState` shows each state and the retry button calls `reload`.
- A lint check (a grep in a test) fails when any file under `src/features` or `src/components` imports `mockApi` or `promoApi` directly.

### Phase 4: session handling

- `goToLogin()` sends the user to `/login?redirect-to=<current path>`. `logout()` calls the Frappe `logout` method, then goes to `/`.
- Playwright: an expired session on `/portal/schedule` ends on `/login`. Logout from the account page ends on `/` and `/portal` then requires login.

### Phase 5: TypeScript and docs

- Add `window.csrf_token` to `src/vite-env.d.ts`. `npm run typecheck` passes.
- Replace `frontend/README.md` (the old Vue template text) with a short file that points to `AGENTS.md`. (`frontend/AGENTS.md` was removed on 2026-11-27.) Document the dev and build steps in `docs/development/`.

## Tests

- Vitest: `AsyncState`, the guard test that views do not import mock files.
- Playwright: `e2e/foundation.spec.ts`.
- Backend: `get_context_for_dev` refuses when `developer_mode` is off.

## Out of scope

- Swapping mockup components for `frappe-ui` ones. Each screen spec decides that for its own screen.
- PWA and push notifications.
- The real data behind each screen (specs 005 to 013).

## Open questions

None. If Phase 0 shows the page is already served some other way that works, keep it and only add the CSRF token and the route rules.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
