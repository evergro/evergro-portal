# Notification settings

Date: 2026-11-23
Status: **Draft.** Creates `Customer Notification Setting`.

## Problem

Customers should choose which messages they get, by email and by WhatsApp. Nothing stores the choice, and nothing that sends messages reads it.

## Goal

Account > Notifications lists Email and WhatsApp. Each opens a screen with five switches. The choice is saved, and the code that sends messages can ask whether a message is allowed.

## What the mockup has

`NotificationSettings { reminders, completed, invoices, promotions, referrals }`, routes `/portal/account/notifications` and `/portal/account/notifications/:channel`.

## Decisions

| # | Decision | Choice |
| :--- | :--- | :--- |
| 1 | Storage | `Customer Notification Setting`, one row for each customer and channel, created the first time it is read |
| 2 | Defaults | Reminders, completed visits, invoices and referrals on. Promotions off |
| 3 | Channels | `Email` and `WhatsApp`. The `:channel` route value is `email` or `whatsapp` |
| 4 | Save | One Save button for the screen. Unsaved changes ask before leaving |
| 5 | Who reads it | A helper `is_message_allowed(customer, channel, kind)` in `portal/services/notifications.py`. The sender (Frappe or n8n) calls it. The sender's own spec adds the call |

## Code

```python
# portal/api/portal.py
@frappe.whitelist()
def get_notification_settings(channel: str) -> dict:
	return notifications.get_settings(get_customer_for_session(), channel)


@frappe.whitelist(methods=["POST"])
def save_notification_settings(channel: str, settings: dict) -> dict:
	return notifications.save_settings(get_customer_for_session(), channel, settings)
```

```ts
export const useNotificationSettings = (channel: () => string) =>
  createResource<NotificationSettings>({
    url: `${config.apiPath}.get_notification_settings`,
    method: "GET",
    makeParams: () => ({ channel: channel() }),
    auto: true,
  });
export const useSaveNotificationSettings = () =>
  createResource({ url: `${config.apiPath}.save_notification_settings` });
```

## Phases

### Phase 0: facts

- Read `NotificationsView` and `ChannelView`. Check how WhatsApp and email messages are sent today (Frappe notifications, `frappe_whatsapp`, n8n) and write down where each would call `is_message_allowed`.

### Phase 1: doctype

- Create `Customer Notification Setting` with the name `{customer}-{channel}`. Backend tests: defaults, one row for each pair, a second row for the same pair is refused.

### Phase 2: read

- `get_settings` creates the row with defaults when missing. Backend tests: first read creates it, an unknown channel gives a clear error, another customer's row never returned. Playwright: both channels show.

### Phase 3: save

- `save_settings` accepts only the five known keys as booleans. Backend tests: a valid save, an unknown key is refused, a non-boolean is refused. Playwright: change a switch, save, refresh, it stays.

### Phase 4: the helper

- `is_message_allowed` with a test for each kind and channel, and for a customer with no row (defaults apply).

### Phase 5: docs

- Screenshots in `docs/`. Document where the sender calls the helper.

## Tests

- Backend: `portal/tests/test_notifications.py`.
- Playwright: `e2e/notifications.spec.ts`.

## Out of scope

- Changing the sender to use the helper.
- Push notifications and SMS.

## Open questions

None.

## Progress

- [ ] Phase 0
- [ ] Phase 1
- [ ] Phase 2
- [ ] Phase 3
- [ ] Phase 4
- [ ] Phase 5
