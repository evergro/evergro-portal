# Data model

Everything the portal stores or reads. Standard doctypes come first. Every new doctype and custom field has a reason. Names are plain English. All are created in the `portal` app (module `Evergro`) and ship in the repo, so a fresh site gets them on `bench migrate`.

## Standard doctypes the portal reads or writes

| Doctype | Used for | Access |
| :--- | :--- | :--- |
| `User` | Login, picture, `user_type = Website User`, role `Customer` | Read. Password change through the standard helper |
| `Customer` | Name, "customer since" (`creation`), `portal_users` rows that link the login to the customer | Read |
| `Contact` | Mobile number, email, birthday (`custom_birthday`) | Read, write mobile and birthday |
| `Address` (linked to the customer) | A property | Read, write access notes |
| `Subscription`, `Subscription Plan` | The plan on a property | Read |
| `Sales Invoice`, `Payment Entry` | Billing history and Pay now | Read |
| `Paystack Customer Authorization` | The one card (fields in spec 009) | Read, update through `frappe_paystack` |
| `Paystack Payment Log` | Payment page reference | Created by `frappe_paystack` |
| `Lead`, `Lead Source` | Quote requests and waitlist from the promo flow | Create (guest, rate limited) |
| `Company` | Support phone (`phone_no`) and WhatsApp (`custom_whatsapp`) of the default company | Read |
| `Sales Order` | A once-off promo service, delivered and charged on the day of service | Create (spec 013) |
| `Coupon Code` | Campaign discount tracking | Read |
| `Item`, `Item Price` | Promo prices per bundle and tier | Read |

## New doctypes

| Doctype | Kind | Why no standard doctype works | Spec |
| :--- | :--- | :--- | :--- |
| `Service Visit` | Normal, shared | `Maintenance Visit` has no skipped or rescheduled status, no before and after photos and no arrival and finish times. The crew app (`evergro_field`) writes it too, so it is created only if it does not exist (global shared-doctype rule) | 006 |
| `Service Visit Task` | Child of Service Visit, shared | A list of what was done | 006 |
| `Customer Notification Setting` | Normal, one row per customer and channel | Ten switches would need ten custom fields on `Contact` | 011 |
| `Customer Referral` | Normal | Nothing standard records a referred person, status and reward | 010 |
| `Evergro Portal Settings` | Single | Referral goal, reward and link. (`Portal Settings` already exists in Frappe, so this name is different. Support numbers live on `Company`, spec 012) | 010 |
| `Promo Campaign` | Normal | Campaign copy, dates, discount and the link to a `Coupon Code` | 013 |
| `Service Area` | Normal | Which addresses are priced automatically, quoted by hand, or waitlisted | 013 |
| `Service Bundle` | Normal | A named bundle with what it includes | 013 |
| `Service Bundle Include` | Child of Service Bundle | One included service per row | 013 |
| `Service Bundle Price` | Child of Service Bundle | Tier to `Item` link. The price itself is read from `Item Price` | 013 |
| `Promo Plan` | Normal | The ordered plan ladder the recommender picks from | 013 |

### Service Visit

| Field | Type | Notes |
| :--- | :--- | :--- |
| `customer` | Link Customer | Required |
| `address` | Link Address | Required. The property |
| `subscription` | Link Subscription | |
| `service` | Link Item | For example Lawn care |
| `scheduled_date` | Date | Required |
| `window_start`, `window_end` | Time | The time window shown to the customer |
| `status` | Select | `Upcoming`, `Completed`, `Skipped`, `Rescheduled`. Default `Upcoming` |
| `reason` | Small Text | Required when `Skipped` or `Rescheduled` |
| `rescheduled_to` | Link Service Visit | Required when `Rescheduled` |
| `arrival_time`, `finish_time` | Time | Finish must be after arrival |
| `summary`, `notes` | Small Text | |
| `team`, `team_note` | Data | |
| `before_photo`, `after_photo` | Attach Image | Private files |
| `tasks` | Table Service Visit Task | |

Naming: `SV-.YYYY.-.#####`. Permissions: System Manager full. `Customer` role gets read on rows where `customer` is theirs, through the permission hooks in spec 006.

### Customer Notification Setting

`customer` (Link Customer), `channel` (Select `Email`, `WhatsApp`), and five Check fields: `reminders` (default on), `completed` (on), `invoices` (on), `promotions` (off), `referrals` (on). Name is `{customer}-{channel}`, so one row exists for each pair.

### Customer Referral

`referrer` (Link Customer), `referred_name` (Data), `referred_customer` (Link Customer, empty until sign-up), `status` (`Pending`, `Signed up`), `reward_amount` (Currency), `referred_on` (Date).

### Evergro Portal Settings (single)

`referral_goal` (5), `referral_reward` (150), `referral_bonus` (500), `referral_base_url` (`evergro.co.za/refer`).

### Promo Campaign

`slug` (unique), `campaign_name`, `headline`, `highlight`, `tagline`, `terms`, `badges` (Small Text, one per line), `discount_percent`, `hero_image` (Attach Image), `banner_title`, `banner_text`, `coupon_code` (Link Coupon Code), `valid_from`, `valid_to`, `max_new_customers`, `is_active`.

### Service Area

`area_name`, `keywords` (Small Text, one per line, matched against the typed address), `pricing_mode` (`Automatic`, `Manual quote`), `is_active`. An address that matches no area is waitlisted.

### Service Bundle and Promo Plan

`Service Bundle`: `bundle_name`, `tagline`, `includes` (child, `text`), `prices` (child: `tier` Select `Essential`, `Standard`, `Complete`, and `item` Link Item). `Promo Plan`: `plan_name`, `tagline`, `cadence` (`Weekly`, `Fortnightly`), `bundle` (Link Service Bundle), `includes_fertiliser` (Check), `sort_order` (Int).

## Custom fields (fixtures)

| Doctype | Field | Type | Why | Spec |
| :--- | :--- | :--- | :--- | :--- |
| `Contact` | `custom_birthday` | Date | Exists | 007 |
| `Company` | `custom_whatsapp` | Data | Company has a phone field but no WhatsApp field | 012 |
| `Paystack Customer Authorization` | `custom_default` | Check | Exists | 009 |
| `Customer` | `custom_referral_code` | Data, unique, read only | The code a customer shares | 010 |
| `Address` | `custom_photo` | Attach Image | The property photo on the card | 008 |
| `Address` | `custom_access_notes` | Small Text | Gate and access notes the crew sees | 008 |
| `Subscription` | `custom_service_address` | Link Address | Ties a plan to one property | 008 |
| `Subscription Plan` | `custom_visits_per_month` | Int | Gives frequency and price per visit | 008 |

## Roles and permissions

- `Customer` is a standard role. Customers are `Website User` accounts, so Desk (`/app`) refuses them.
- The portal never opens standard `/api/resource` access to customers. Customers read data only through `portal.api.portal`, which checks ownership (spec 003). The `Service Visit` permission hooks add defence in depth and let private photos load.

## Static content kept in the frontend (v1)

Marketing copy that changes rarely stays in `frontend/src/config/promo/*.json`, reviewed in pull requests: guide questions, intro slides, FAQs, how-it-works steps, analysis steps, house layouts, map config, member promos. Move one into a doctype only when someone other than a developer needs to edit it. The Google Maps key is never in these files: it comes from the site config `google_maps_api_key` through `get_map_config` (spec 013).
