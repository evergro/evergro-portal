# Properties

Date: 2026-11-23
Status: **Draft.**

## Problem

A customer can have more than one property. Each has an address, a photo, a plan with a price per visit, and a last visit. None of it is real today.

## Goal

Account > My properties lists the customer's properties. Opening one shows its plan, last visit, access notes and photo, and lets the customer edit the access notes.

## What the mockup has

`Property` type: `id`, `address`, `photo`, `lastVisit`, `plan { name, frequency, pricePerVisit }`. Routes: `/portal/account/properties` and `/portal/account/properties/:id`.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | A property is | An `Address` linked to the customer through the standard link row |
| 2 | Address text | `address_line1` and, when set, `address_line2` (the suburb), else `city` |
| 3 | Photo | New custom field `Address.custom_photo`. A placeholder shows when empty |
| 4 | Access notes | New custom field `Address.custom_access_notes`. The customer can edit it. The crew sees it |
| 5 | Plan | The active `Subscription` whose new field `custom_service_address` points at the address. Name from its `Subscription Plan`. Frequency and price per visit come from the plan's new field `custom_visits_per_month` |
| 6 | Frequency text | 4 visits a month is "Weekly", 2 is "Every 2 weeks", 1 is "Monthly" |
| 7 | Price per visit | Plan cost divided by `custom_visits_per_month`, rounded to the cent |
| 8 | Last visit | The latest completed `Service Visit` for the address |
| 9 | No plan | The plan block is hidden and the property still shows |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_properties() -> list[dict]:
	return properties.list_properties(get_customer_for_session())


@frappe.whitelist()
def get_property(property_id: str) -> dict:
	customer = get_customer_for_session()
	properties.assert_owns_property(property_id, customer)
	return properties.get_property(property_id)


@frappe.whitelist(methods=["POST"])
def update_access_notes(property_id: str, notes: str) -> dict:
	customer = get_customer_for_session()
	properties.assert_owns_property(property_id, customer)
	return properties.update_access_notes(property_id, notes)
```

```python
# portal/services/properties.py (ownership through the standard link row)
def assert_owns_property(address: str, customer: str) -> None:
	is_linked = frappe.db.exists(
		"Dynamic Link",
		{"parenttype": "Address", "parent": address, "link_doctype": "Customer", "link_name": customer},
	)
	if not is_linked:
		frappe.throw(_("Not found"), frappe.DoesNotExistError)
```

```ts
// frontend/src/data/useProperties.ts
export const useProperties = () =>
  createResource<Property[]>({ url: `${config.apiPath}.get_properties`, method: "GET", auto: true });
export const useProperty = (propertyId: () => string) =>
  createResource<Property>({
    url: `${config.apiPath}.get_property`,
    method: "GET",
    makeParams: () => ({ property_id: propertyId() }),
    auto: true,
  });
```

## Phases

### Phase 0: facts

- Read `PropertiesView` and `PropertyView` and list their fields. Reuse or replace the existing `get_addresses` method.
- For two test customers, record their `Address` rows and the `Dynamic Link` rows. Check how existing subscriptions relate to a property today.
- Check that `Subscription Plan` has `cost` and that the plan names match what the mockup shows.

### Phase 1: custom fields and fixtures

- Add the four custom fields from `data-model.md` as fixtures. Run `bench migrate`. Backend test: the fields exist after a fresh migrate.
- Fill the fields for the test customers.

### Phase 2: list

- `list_properties` and `useProperties`. Backend tests: two properties, no property, another customer's property not included. Playwright: the list shows the test addresses.

### Phase 3: detail

- `get_property` with plan, last visit and notes. Backend tests: property with a plan, with none, with no completed visit, another customer's id gives "not found". Frequency and price per visit tests for 4, 2 and 1 visits a month.
- Playwright: open a property and see its plan.

### Phase 4: edit access notes

- `update_access_notes` with a length limit. Backend tests: save, too long, another customer's property refused. Playwright: edit, save, refresh, the notes remain.

### Phase 5: docs

- Screenshots in `docs/`. Document the fields staff must fill so the portal shows a plan: the address link and the plan's visits a month.

## Tests

- Backend: `portal/tests/test_properties.py`.
- Playwright: `e2e/properties.spec.ts`.

## Out of scope

- Adding, removing or moving a property. That is a sales action.
- Changing the plan.

## Open questions

None.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
