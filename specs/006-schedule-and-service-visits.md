# Schedule and service visits

Date: 2026-11-23
Status: **Draft.** Creates the `Service Visit` doctype. Home (005) and the crew app depend on it.

## Problem

Schedule has a calendar and a list, and a detail screen for each visit, but the calendar is hard-coded to one June and nothing stores visits.

## Goal

Customers see their visits in a month calendar and a list, and open any visit to see what was done, the times, notes, and before and after photos. For a skipped or rescheduled visit they see the reason.

## What the mockup does

- `ScheduleView`: Calendar and List toggle, a hard-coded 30-day month, dot colours by status.
- Status values: `Completed` (green), `Skipped` (red), `Rescheduled` (yellow accent), `Upcoming` (grey).
- `VisitDetailView`: loads a visit by id and shows times, tasks, notes, the team and the photos when the visit is on site.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Doctype | New `Service Visit` (confirmed 2026-11-27) with child `Service Visit Task` (fields in `data-model.md`). `Maintenance Visit` was rejected: no skipped or rescheduled status, no photos, no arrival and finish times |
| 2 | Colours | Green completed, red skipped, yellow rescheduled, grey upcoming. This follows the mockup and replaces the earlier "no yellow" note |
| 3 | Rescheduled | The original visit has status `Rescheduled` and `rescheduled_to` points to the new visit. The new visit is `Upcoming` |
| 4 | Range | `get_visits(month)` takes `YYYY-MM`. The list view calls it for the current month and loads earlier months on request |
| 5 | Calendar | Real month grid computed from the date, with previous and next month. Today is highlighted |
| 6 | Photos | Private files. Permission hooks let a customer read a `Service Visit` that is theirs, so Frappe serves its private photos to them |
| 7 | Who writes visits | Staff in Desk for now, and the crew app later (`evergro_field`). Both apps use the doctype, so it follows the global shared-doctype rule: the portal creates it only if it does not exist, and if it exists without a field the portal needs, install stops with an error that names the field |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_visits(month: str | None = None) -> list[dict]:
	return visits.list_visits(get_customer_for_session(), month)


@frappe.whitelist()
def get_visit(visit_id: str) -> dict:
	customer = get_customer_for_session()
	assert_owns("Service Visit", visit_id, customer)
	return visits.get_visit(visit_id)
```

```python
# portal/permissions.py
import frappe


def has_service_visit_permission(doc, user=None, permission_type=None):
	if frappe.get_roles(user).count("System Manager"):
		return True
	if permission_type != "read":
		return False
	return doc.customer in get_parents_for_user("Customer", user or frappe.session.user)
```

```python
# portal/hooks.py
has_permission = {"Service Visit": "portal.permissions.has_service_visit_permission"}
```

```ts
// frontend/src/data/useVisits.ts
import { createResource } from "frappe-ui";
import { config } from "@/config/env";
import type { Visit } from "@/types";

export function useVisits(month: () => string) {
  return createResource<Visit[]>({
    url: `${config.apiPath}.get_visits`,
    method: "GET",
    makeParams: () => ({ month: month() }),
    cache: ["portal", "visits", month()],
    auto: true,
  });
}

export function useVisit(visitId: () => string) {
  return createResource<Visit>({
    url: `${config.apiPath}.get_visit`,
    method: "GET",
    makeParams: () => ({ visit_id: visitId() }),
    auto: true,
  });
}
```

## Phases

### Phase 0: facts

- Check `Service Visit` does not already exist (for example from `evergro_field`). Check how the crew records visits today (Connecteam, notes, nothing). Write it here.
- List the status words in `Visit` in `types/index.ts` and in `ScheduleView`. Make sure the doctype's `status` options match them exactly.
- Check the private-file behaviour: attach a private image to any doctype the customer cannot read, and confirm the customer gets 403 on `/private/files/...`.

### Phase 1: the doctype

- Create `Service Visit` and `Service Visit Task` as in `data-model.md`, with validation: `Skipped` needs a reason, `Rescheduled` needs a reason and a `rescheduled_to` visit, `finish_time` after `arrival_time`.
- Backend tests: each validation rule, and that a valid visit saves. Mutation check: remove the rule for `Skipped` and watch the test fail.
- Hand check: create a visit of each status in Desk.

### Phase 2: list view with real data

- `list_visits(customer, month)` returns the `Visit` shape, ordered by date. Add `useVisits` and bind `ScheduleView` to it. The hard-coded 30-day month goes.
- Backend tests: month filter, empty month, only own visits, invalid month text gives a clear error. Playwright: the list shows the test customer's visits.

### Phase 3: calendar

- Compute the month grid. Previous and next month reload through `useVisits`. Keep the chosen view (`?view=list`) in the URL.
- Vitest: the grid for a 28-day, 31-day and leap-year February, and the status to dot colour map. Playwright: move months, refresh, keep the view.

### Phase 4: detail

- `get_visit` returns the full `Visit`: tasks, times, notes, team, photo URLs. `VisitDetailView` uses `useVisit`.
- Backend tests: another customer's visit id gives "not found". Playwright: open a completed and a skipped visit and see the reason.

### Phase 5: photos and permissions

- Add the `has_permission` hook. Backend test: the customer's user can read their visit and cannot read another's. Playwright: a photo loads for the owner and gives 403 for another customer.

### Phase 6: rescheduled link and docs

- On a rescheduled visit, show the reason and a link to the new visit. Light and dark screenshots for `docs/`.

## Tests

- Backend: `portal/tests/test_service_visit.py`, `test_visits_api.py`.
- Vitest: calendar grid and colour map.
- Playwright: `e2e/schedule.spec.ts`.

## Out of scope

- Customers rescheduling or cancelling. That needs rules (one week notice) and its own spec.
- Creating visits from the subscription automatically.
- The crew app.

## Open questions

1. Should visits be generated from each Subscription automatically (one for each week)? Default: no, staff or the crew app create them for now.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
- [ ] Phase 6
