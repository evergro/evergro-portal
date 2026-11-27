# Maintain the docs

This file tells you how to write the docs in [`docs/`](docs/). Agents: read it before you add or edit a page. The docs follow the way the Frappe Framework and ERPNext docs are organised and written. Use their structure and habits, not their words: never copy text from them.

## Who reads the docs

A new team member who can code but does not know Frappe or Evergro. Often an intern. They need to understand what the portal does, run it on their computer and make a first change. Staff who set up records in Desk read the guide pages too.

## What the Frappe docs do, and what we copy

The Frappe and ERPNext docs work because every page has one job and readers always know where they are. Copy these habits:

| Habit | What it means here |
| :--- | :--- |
| Three kinds of page | Every page is a **concept** (what it is and why), a **guide** (how to do one task) or a **reference** (facts to look up). Never mix two on one page |
| Docs follow the product | The table of contents follows the four tabs and the Account menu, the way ERPNext's docs follow its modules |
| Short opening | The page starts with one or two sentences that say what the thing is and why it matters. No history, no "In this page we will" |
| Where to find it | A screen page says how to reach it, as a path of the names the UI shows: **Account** > **Payments** > **Active card**, and its URL |
| Numbered sections | Long guide pages number their main headings: `## 1. Before you start`, `## 2. Add a card`, `## 3. What happens next`, `## 4. Related pages` |
| Before you start | When a task needs something to exist first (a customer with a login, a built frontend), the guide lists it first |
| Steps, then a picture | Steps are a numbered list, one action each. A screenshot follows the steps it shows, never before |
| Tables for fields | Settings and doctype fields are a table: field, what it holds, notes |
| Callouts | A side note that saves the reader from a mistake is a quote block that starts with **Note:** or **Warning:**. At most two on a page |
| Code with its place | A code block is preceded by a sentence that says where it goes, and the first line is a comment with the file path |
| API entries | Each method is its own `###` heading with its call signature, a sentence, an arguments table, the response shape and one example |
| Related pages | Every page ends with links to the pages a reader needs next |

What the Frappe docs are not good at, so we do better: they often skip the reason for a rule and the error a reader will see when they get it wrong. Say both.

## Folders

| Folder | Kind | What goes in it |
| :--- | :--- | :--- |
| `docs/index.md` | Concept | Start here: what the portal is and a map of the docs |
| `docs/introduction/` | Concept | What the portal is, who uses it, how a request flows |
| `docs/guides/` | Guide | One task each, for customers' screens and for staff in Desk (for example "Set up a customer's login", "Add a service visit") |
| `docs/development/` | Guide | Run it locally, tests, build, first contribution |
| `docs/reference/` | Reference | API methods, doctypes and fields, routes, settings |
| `docs/images/<folder>/` | | Screenshots for the pages in that folder |

Add a guide page when you add a screen. Add a reference entry when you add a method, doctype or setting. One page per doctype group.

## Write a page

- Write in simple English. Short sentences. One instruction for each step.
- Use the names the UI shows, in bold: **Pay now**, **Schedule**.
- Put the usual case first and the edge cases after it.
- Say what the reader will see when a step works, and the message they get when it fails.
- Keep each paragraph on one line. Do not hard-wrap.
- Link to other pages with relative paths to the `.md` file. Link the first mention of a concept.
- Mark anything that does not exist yet as **Planned** with the spec number, or leave it out. Never describe planned behaviour as if it works.
- Check every statement against the running app. If the app changed, change the page in the same commit.

### Concept page

```markdown
---
title: How the portal works
---
One or two sentences on what this is and why it matters.

## The parts

A short paragraph or a table for each part.

## Related pages

- [Run it locally](../development/run-locally.md)
```

### Guide page

```markdown
---
title: Update a card
---
One or two sentences on what the task is and when a customer or staff member does it.

To find it: **Account** > **Payments** > **Active card** (`/portal/account/payments/card`).

## 1. Before you start

- What must exist first.

## 2. Update the card

1. Do the first thing.
2. Do the next thing.

<picture>…</picture>

> **Note:** A side note that prevents a mistake.

## 3. What happens next

What the reader sees, and what the system does.

## 4. Related pages

- [Payments reference](../reference/api.md#get_payment_method)
```

### Reference entry

````markdown
### get_payment_method

`portal.api.portal.get_payment_method()`

Returns the customer's one active card, or `null`. GET. Logged-in customers only.

| Argument | Type | Notes |
| :--- | :--- | :--- |
| none | | The customer comes from the session |

Response: `PaymentCard` in `frontend/src/types/index.ts`.

```ts
const card = usePaymentMethod();
```
````

## Screenshots

- Add a screenshot for every screen a user sees. Use the `agent-browser` skill.
- Take each one in light and dark: `docs/images/<folder>/<screen>-light.webp` and `<screen>-dark.webp`.
- Take phone screens at 390 px wide and desktop screens at 1280 px.
- Use demo data. Never use real customer names, phone numbers, addresses or card details.
- Embed both versions, and write `alt` text that tells what the image shows:

```html
<picture>
  <source srcset="../images/guides/home-dark.webp" media="(prefers-color-scheme: dark)">
  <img src="../images/guides/home-light.webp" alt="The portal home page with the next visit and the last visit">
</picture>
```

- Open each image before you commit. Check that the text is sharp, nothing is loading or cut off, and the image shows what the text says.

## Before you commit

- The page is one kind: concept, guide or reference.
- The page matches the running app, planned things are marked, and the links work.
- Each new screenshot has a light and a dark version.
- The commit message uses `docs(<folder>): summary`.
