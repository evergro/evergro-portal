# Home

Date: 2026-11-23
Status: **Draft.** Needs spec 006 (Service Visit) for visit data.

## Problem

Home shows a greeting, the next visit, the last visit and, for new customers, a getting-started checklist and a promo popup. All of it is fake today.

## Goal

A customer opens the app and sees, from real data: who they are, when the crew comes next (with any reschedule notice), what happened last time, and what they still need to set up.

## What the mockup does

`HomeView` calls the customer, next visit and last visit loaders. A "new member" flag in `localStorage` shows a checklist and the `MemberPromoPopup`. The next visit can be `Rescheduled` and then shows its reason.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | One request | `get_home()` returns the customer's first name, `nextVisit`, `lastVisit`, `notice` and `checklist` |
| 2 | Next visit | The earliest `Service Visit` with `scheduled_date >= today` and status `Upcoming` |
| 3 | Reschedule notice | If a `Rescheduled` visit has its original or new date within 7 days, show it with the reason, and a link to the new visit |
| 4 | Last visit | The latest `Service Visit` with status `Completed`, with the before and after photos |
| 5 | Checklist | Server truth, not `localStorage`: account created (always done), contact method chosen (any `Customer Notification Setting` saved), access notes added (any property has `custom_access_notes`), card added (an active card exists) |
| 6 | Checklist dismiss | Stays in `localStorage` for now (per device) |
| 7 | New member | The customer was created in the last 14 days and the checklist is not complete |
| 8 | Promo popup | Content from the static member promos in `src/config/promo/` (moved there from `promoApi.ts`). Shown once per device for a new member. It needs no promo backend, so it does not wait for spec 013 |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_home() -> dict:
	return home.get_home(get_customer_for_session())
```

```ts
// frontend/src/data/useHome.ts
import { createResource } from "frappe-ui";
import { config } from "@/config/env";
import type { HomeData } from "@/types";

export function useHome() {
  return createResource<HomeData>({
    url: `${config.apiPath}.get_home`,
    method: "GET",
    cache: ["portal", "home"],
    auto: true,
  });
}
```

`HomeData` is a new type: `{ firstName, nextVisit: Visit | null, lastVisit: Visit | null, notice: HomeNotice | null, checklist: ChecklistItem[], isNewMember: boolean }`. Add it to `src/types/index.ts`.

## Phases

### Phase 0: facts

- Confirm Service Visit exists with data (spec 006 Phase 1). Count a test customer's upcoming, completed, skipped and rescheduled visits.
- Read `HomeView`, `VisitCard` and the checklist component and list every field they read.

### Phase 1: greeting from the session

- `get_home()` returns only `firstName` and empty everything else. `HomeView` uses `useHome()` and `AsyncState`.
- Backend test for the shape. Playwright: Home shows the test customer's first name.

### Phase 2: next and last visit

- Add `nextVisit` and `lastVisit`. Empty states for none.
- Backend tests: a customer with both, one with neither, one whose visits belong to someone else. Playwright: both cards render.

### Phase 3: reschedule notice

- Add `notice`. Tests: original date in 3 days, new date in 3 days, both 10 days away (no notice), a skipped visit (no notice).
- Playwright: seed a rescheduled pair and see the reason and the link to the new visit.

### Phase 4: checklist and new member

- Add `checklist` and `isNewMember`. Remove the `localStorage` new-member flag. Tests: each item ticks when its data exists; a customer 20 days old is not new.
- Playwright: a new customer sees four items, saving notification settings ticks the second.

### Phase 5: photos and docs

- Before and after photos in the last-visit card, with a placeholder while loading. Light and dark screenshots in `docs/`.

## Tests

- Backend: `portal/tests/test_home.py`.
- Vitest: `useHome` with a fake fetcher.
- Playwright: `e2e/home.spec.ts`.

## Out of scope

- Payment failed alerts. They are not in the mockup. Add them with spec 009 if wanted.
- Editing anything on Home.

## Open questions

None.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
