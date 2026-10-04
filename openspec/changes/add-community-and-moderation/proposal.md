# Proposal

## Why

Users can share their recipes with everyone, which grows the catalog for free. Publicly shared content makes the operator a hosting provider under the EU Digital Services Act. That requires a report mechanism, moderation decisions that explain their reasons, and admin tools. Admins also need one place to watch the email budget and the keep-alive heartbeat.

## What Changes

- **Publishing** (AppPublicar):
  - an explicit "Publicar" button, with the recipe licence accepted on first use;
  - automatic checks: required fields, food safety, lengths, links and contact details, offensive-words blocklist, private ingredients, near-duplicates;
  - clean recipes are published immediately, flagged ones go to review;
  - "por @alias" attribution, unpublishing, and republishing that keeps the previous public version visible.
- **Reporting** (AppReportar): reasons, one report per user and recipe, and automatic hiding after 3 distinct reporters. Pinned plans are not affected.
- **Inbox** (AppAvisos): in-app notifications for moderation results, with reasons and the appeal contact.
- **Admin back office** (DeskAdmin):
  - the admin role is granted only by SQL, needs a sign-in within the last 12 hours, and non-admins get 404;
  - the moderation queue (review items, hidden recipes, estimate reports) and decisions with mandatory reasons;
  - private-ingredient promotion with verified allergens and nutrition;
  - catalog and price maintenance with new system recipe versions when allergens or nutrition change;
  - the audit log;
  - the operations panels: email usage and suppressions (change 5), and the last heartbeat with a manual run (change 2).

## Capabilities

### New Capabilities

- `recipes/community-sharing`: the publish button, automatic checks, attribution, republishing, reporting, automatic hiding, moderation decisions with reasons.
- `admin/back-office`: the admin role, recent authentication, the moderation queue, decisions, catalog and price maintenance, the audit log.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–13.
- **Code:** `safebits_back/src/modules/community/`, `modules/admin/`, `safebits_front/src/app/features/community/`, `features/inbox/`, `features/admin/`.
- **Migrations:** `reports`, `moderation_items`, `moderation_decisions`, `notifications`, `private.admins`.
- **Completes** the admin-facing requirements `email-delivery` "Email usage monitoring" and `service-keepalive` "Heartbeat visibility" and "Manual heartbeat".
