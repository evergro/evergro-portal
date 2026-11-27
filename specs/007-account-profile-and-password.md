# Account profile and password

Date: 2026-11-23
Status: **Draft.**

## Problem

The Account screen and header show a customer from fake data. The profile and password screens need real data and saving.

## Goal

A customer sees their name, email, phone, birthday and "customer since", edits what they are allowed to edit, and changes their password.

## What the mockup has

`Customer` type: `name`, `email`, `phone`, `birthday`, `since`, `avatar`. Routes: `/portal/account`, `/portal/account/profile`, `/portal/account/password`. The Account menu also links to properties, payments, refer, notifications and logout.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Sources | Name and `since` from `Customer` (`customer_name`, `creation`). Phone from `Contact.mobile_no`. Birthday from `Contact.custom_birthday`. Email from the `User` (the login). Picture from `User.user_image` |
| 2 | Editable | Phone and birthday. Email is the login, so it is read only. The customer's name is read only because billing records use it. Both change through Support |
| 3 | Avatar | Initials when there is no picture. Picture upload is its own phase |
| 4 | Password | Check the old password, check strength with Frappe's own checker, then set the new one. The same session stays logged in |
| 5 | Validation | On the server first, then on the screen. Plain English messages next to the field |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_profile() -> dict:
	return profile.get_profile(get_customer_for_session())


@frappe.whitelist(methods=["POST"])
def update_profile(phone: str, birthday: str | None = None) -> dict:
	return profile.update_profile(get_customer_for_session(), phone, birthday)


@frappe.whitelist(methods=["POST"])
def update_password(old_password: str, new_password: str) -> None:
	profile.update_password(frappe.session.user, old_password, new_password)
```

```python
# portal/services/profile.py (password part)
import frappe
from frappe import _
from frappe.utils.password import check_password, update_password as set_password
from frappe.utils.password_strength import test_password_strength


def update_password(user: str, old_password: str, new_password: str) -> None:
	check_password(user, old_password)
	strength = test_password_strength(new_password)
	if not strength["feedback"]["password_policy_validation_passed"]:
		frappe.throw(_("Choose a stronger password."), frappe.ValidationError)
	set_password(user, new_password)
```

```ts
// frontend/src/data/useProfile.ts adds the writer
export function useUpdateProfile() {
  return createResource({ url: `${config.apiPath}.update_profile` });
}
// In ProfileView: updateProfile.submit({ phone, birthday }).then(() => profile.reload())
```

## Phases

### Phase 0: facts

- Read `ProfileView` and `PasswordView` and list the fields they show.
- The existing `update_profile` lets the client change `first_name` and `last_name`. Decision 2 makes the name read only, so Phase 2 removes those arguments.
- On a test customer, record which `Contact` is linked, which field holds the mobile number, and where the picture is stored.
- Check `check_password` and `test_password_strength` exist with these names in the installed Frappe.

### Phase 1: read the profile

- Implement `get_profile` (stub from spec 002 becomes real). Backend test for each field and for a customer with no birthday or phone.
- Playwright: `/portal/account` and `/portal/account/profile` show the test customer's real details.

### Phase 2: edit phone and birthday

- `update_profile` validates a South African mobile number format and a birthday that is a past date, and ignores any customer or contact id from the client.
- Backend tests: valid save, bad phone, birthday in the future, an attempt to edit another customer's contact. Playwright: edit the phone, save, refresh, the new value shows. Leaving with unsaved changes asks first.

### Phase 3: change password

- Implement `update_password` and bind `PasswordView`.
- Backend tests: wrong old password, weak new password, success, old password no longer works. Playwright: change the password, log out, log in with the new one.

### Phase 4: profile picture (optional)

- Upload through a whitelisted method that accepts an image up to a size limit and attaches it to the user's own record. Backend test refuses a non-image and a file that is too large.

### Phase 5: docs

- Light and dark screenshots of Account, Profile and Password in `docs/`.

## Tests

- Backend: `portal/tests/test_profile.py`.
- Vitest: phone validation.
- Playwright: `e2e/profile.spec.ts`.

## Out of scope

- Changing name or email in the portal.
- Account deletion.

## Open questions

None. The name is read only (Decision 2), confirmed 2026-11-27.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
