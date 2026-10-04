# Tasks

## 1. Data

- [ ] 1.1 Add the migrations for `reports`, `moderation_items`, `moderation_decisions`, `notifications` and `private.admins`, with RLS, harness entries and sync registration for notifications; verify the migrations and RLS tests

## 2. Community

- [ ] 2.1 Implement publish and unpublish (licence acceptance on first publish, the check order of design decision 1, published or review or error outcomes, label computed); verify integration tests for the clean, link and private-ingredient scenarios
- [ ] 2.2 Implement republishing that keeps the previous public version visible while the new one is under review; verify an integration test
- [ ] 2.3 Implement reports (reasons, one per user and recipe) and automatic hiding after 3 distinct reporters, without affecting pinned plans; verify integration tests
- [ ] 2.4 Build AppPublicar ("por @alias" preview, check results), AppReportar and the lilac community badges, plus the Comunidad tab content; verify Playwright, axe and visual comparison with the designs

## 3. Notifications

- [ ] 3.1 Implement notifications for authors and reporters, and the AppAvisos inbox with its empty state; verify the author receives the moderation reason and the appeal contact

## 4. Admin

- [ ] 4.1 Implement the admin guard (SQL-granted role, 12-hour recent sign-in, 404 for non-admins) and connect the change 5 email API to it; verify integration tests
- [ ] 4.2 Implement the moderation queue and decisions (mandatory reasons, promotion with verified allergens, intolerances and nutrition, notifications, removed recipes kept private for the author); verify integration tests for every moderation scenario
- [ ] 4.3 Implement catalog and estimate maintenance with the audit log, where allergen or nutrition changes create new system recipe versions; verify the soy-allergen-correction integration test
- [ ] 4.4 Build DeskAdmin: queue, decisions, catalog and price editor, audit log, email usage and suppressions panel, heartbeat panel with "Ejecutar heartbeat"; verify Playwright as an admin, including the 76-email warning and the stale-heartbeat warning
