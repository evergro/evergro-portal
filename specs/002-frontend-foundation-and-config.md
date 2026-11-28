# Frontend foundation and config

Date: 2026-11-23
Status: **Done on evergro.local.** Changed 2026-11-27 (Tailwind 3 and `frappe-ui` components). Everything that makes the built app talk to Frappe as the logged-in customer.

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
| 4 | Build output | Vite builds to `portal/public/portal`. Assets are served by Frappe at `/assets/portal/portal/`. Frappe renders the hand-written `portal/www/portal/index.html`, which reads the script and CSS names from the Vite manifest (Phase 0). Vite's own `index.html` is not used in production |
| 5 | CSRF and boot data | `www/portal/index.py` puts `csrf_token` in `context.boot` and `www/portal/index.html` prints it as `window.csrf_token`. In dev, `main.ts` fetches the same values from the developer-mode-only method `get_context_for_dev` |
| 6 | One SPA host page for three prefixes | Route rules send `/portal/*`, `/start/*` and the bare `/promo` to the page `portal` (`/promo/<campaign>` waits for spec 013, because `frappe_paystack` serves `/promo/summer-special`). Only `/portal/*` requires login |
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
    // The page is rendered by Jinja, so the plugin must not rewrite index.html or the build output
    frappeui({ frontendRoute: "/portal", jinjaBootData: false, buildConfig: false }),
    vue(),
  ],
  server: { host: "0.0.0.0", port: 8080, strictPort: true, allowedHosts: ["evergro.local"] },
  build: { outDir: "../portal/public/portal", manifest: true },
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

- [x] Phase 0 (2026-11-28). Findings:
  - The page is rendered by `portal/www/portal/index.html` (hand-written Jinja) and `www/portal/index.py`, which reads `.vite/manifest.json` and writes the script and CSS URLs. Scripts load from `/assets/portal/portal/assets/index-<hash>.js`. The built `index.html` is not copied anywhere. Per Open questions, keep this and do not use the `frappe-ui` `indexHtmlPath` option. Decision 4 and the vite code block are changed to match.
  - Deep links `/portal`, `/portal/account`, `/portal/schedule/v1` and `/portal/account/profile` answer 200 for a customer with the same scripts. `/promo` and `/start/locate` answer 404, so finding 10 is real. The route rule is `/portal/<path:app_path>` to `portal` only.
  - `window.csrf_token` is not on the page. `index.py` builds `context.boot` but `index.html` never prints it.
  - Versions: installed `frappe-ui` 0.1.278, `vite` 8.3.1, `tailwindcss` 3.4.19 (the repo was changed to Tailwind 3 on 2026-11-28). `package.json` has `frappe-ui ^0.1.278`, `tailwindcss ^3.4.19`, `vite ^8.0.5`. `package-lock.json` matches `package.json`. `pnpm-lock.yaml` still says Tailwind 4.2.2 and Vite 8.0.5. `frappe-ui` 1.2.0 is the latest release and needs `tailwindcss >=3.4.2 <4`.
  - Bundle: `assets/` is 1.5 MB in 53 files, main chunk 135 kB.
- [x] Phase 0.5 (2026-11-28): `frappe-ui` 1.2.0, `tailwindcss` 3.4, `pnpm-lock.yaml` deleted. `rm -rf node_modules && npm ci && npm run build && npm run typecheck` passes. Differences from the plan: `vue-sonner` is added as a direct dependency because npm nests it under `frappe-ui` and the `frappe-ui` Vite plugin pre-bundles it from the project root, so dev failed without it. `tsconfig.json` is raised to ES2022 because `frappe-ui` 1.x uses `Object.hasOwn`. The `optimizeDeps` workaround from spec 001 is no longer needed and is removed. Looks the same at 390 and 1280 px.
- [x] Phase 1 (2026-11-28). The header and the Home and Account views read the profile through `useProfile`, in the built app and in dev (`evergro.local:8080/portal/`), with no console errors. Differences from the plan:
  - `get_profile` already existed, so it was reshaped, not stubbed: it keeps the Contact lookup and returns the `Customer` type (`name`, `email`, `phone`, `birthday`, `since`, `avatar` initials, and new `image`). `image` is the contact photo URL or `null`. A private photo goes through `get_private_image`, a public one is used as is. The new `UserAvatar.vue` shows the photo when `image` is set and the initials otherwise.
  - The page controller is `portal.www.portal.index`, so the dev boot method is `portal.www.portal.index.get_context_for_dev`. It is `allow_guest` so promo pages work in dev, and it still refuses when `developer_mode` is off. `boot.ts` uses `fetch` with GET because a POST needs the CSRF token that this call is fetching.
  - The CSRF token is printed by our own Jinja template, so `jinjaBootData` and `buildConfig` are off in the `frappe-ui` plugin. The hand-written proxy and `hmr` block are removed (the plugin proxies `/api`, `/app`, `/assets`, `/files`, `/private`). `allowedHosts: ['evergro.local']` is set because the plugin could not run `bench list-app-sites` on this bench. `lucideIcons` stays on because `frappe-ui` imports `~icons/lucide/*`.
  - Route rules: `/start/<path>` and the bare `/promo` go to the portal page. `/promo/<campaign>` is not added, because it would hide the live `frappe_paystack` page `/promo/summer-special`. Spec 013 adds it when it replaces that page. Only `/portal/*` requires login.
  - `window.csrf_token` is already typed by `frappe-ui`, so there is no declaration in `vite-env.d.ts` (a second one breaks typecheck). Phase 5 drops that item.
  - Favicon: the existing `favicon.svg`. Tests: `e2e/foundation.spec.ts` (needs `E2E_CUSTOMER_NAME`) and `portal/tests/test_boot.py`.
- [x] Phase 2 (2026-11-28). Differences from the plan:
  - There is no `portal/www/portal.html`. The hand-written `www/portal/index.html` is the page (Phase 0), and it contains the boot script. `bench --site evergro.local clear-website-cache` after a build picks up new asset names.
  - A guest was thrown to `/login` from `/promo`: the app mounted before the router resolved the first route, so the portal header rendered for a moment and called `get_profile`, which answers 403. `main.ts` now mounts after `router.isReady()`.
  - Playwright (`e2e/foundation.spec.ts`): `/portal/account/profile` loads and survives a refresh with no failed `/assets/` request and the right name. A guest gets `/promo` and `/start/locate` ends on `/promo`. `/promo/summer-special` is still served by `frappe_paystack`.
  - Bundle: before (Phase 0, `frappe-ui` 0.1.278, only partly used) the JS was 135 kB and the CSS 279 kB, 1.3 MB in 53 files. Now (`frappe-ui` 1.2.0) the main JS is 122 kB (43 kB gzipped) and the CSS is 727 kB (62 kB gzipped), 1.7 MB in 44 files. The CSS grew because Tailwind 3 must scan all of the `frappe-ui` source (`content` from `frappe-ui/tailwind`). That CSS size equals the build from before spec 001. Judged acceptable at 62 kB gzipped, so work went on.
- [x] Phase 3 (2026-11-28). Differences from the plan:
  - `src/services/api.ts` is `export *` from `mockApi` and `promoApi`. All views and components now import from it, none from the mock files. The profile is the only migrated function, and its composable reads it from the real API.
  - The flag `VITE_USE_MOCK_API` works inside `useProfile`: when `true` it passes the mock `getCustomer` as that resource's `resourceFetcher`. It is `false` in both env files. Each later composable follows the same pattern.
  - `AsyncState.vue` (loading, error with retry, empty) wraps the profile greeting on Home and the profile header on Account. Vitest runs only `src/**/*.test.ts` (`npm test`), so it does not pick up the Playwright specs: 4 `AsyncState` tests and the import guard, which fails when a feature or component file imports a mock file (checked by adding one).
- [x] Phase 4 (2026-11-28). `logout()` and `goToLogin()` are in `src/config/session.ts`. `logout()` calls the Frappe `logout` method and then goes to `/`. `AppShell` and `AccountView` both used their own `useCall` copy that went to `/login`, and now share `logout()`. `e2e/session.spec.ts`: logout from the account page ends on `/`, and `/portal` then goes to `/login?redirect-to=/portal`. With the cookies cleared on `/portal/schedule`, the next profile request answers 403 and the app ends on `/login?redirect-to=` for the schedule or account page. Which page it names depends on whether the 403 lands before or after the click.
- [x] Phase 5 (2026-11-28). `window.csrf_token` is typed by `frappe-ui`, so `vite-env.d.ts` needs nothing and `npm run typecheck` passes with `lib` and `target` at ES2022. `frontend/README.md` now points to `AGENTS.md` and the docs. `docs/development/run-locally.md` covers dev, build and all three test runners, and `first-contribution.md` and `how-it-works.md` are updated.
- 2026-11-28: `portal/public/portal` (the build output) is no longer tracked and is in `.gitignore`. Every fresh clone and every deploy must run `npm run build`.
