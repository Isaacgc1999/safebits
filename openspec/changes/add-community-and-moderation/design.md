# Design

## Context

- **From earlier changes:**
  - Change 11: versions and private ingredients.
  - Change 6: aliases and terms (the recipe licence).
  - Change 5: the email usage API.
  - Change 2: the heartbeat.
- **Designs:** AppPublicar (automatic checks), AppReportar, AppAvisos and DeskAdmin (the moderation queue). Community content uses the lilac colour role.
- **No AI at runtime,** so moderation is rule-based plus human review.

## Goals / Non-Goals

**Goals:**
- Clean recipes are published instantly, while risky ones never reach other users unreviewed.
- Every removal gives the author a reason and a way to appeal, as the Digital Services Act requires.

**Non-Goals:**
- AI moderation and email notifications. Notifications are in-app only, to protect the email budget.

## Decisions

### 1. Publishing checks

Run in this order on publish:
1. Required fields and the food rules.
2. Length limits.
3. URL, email and phone regular expressions.
4. The Spanish and English offensive-words blocklist (open licence, vendored with its licence).
5. Private ingredients.
6. Near-duplicates: ingredient-set Jaccard ≥ 0.9 plus title `pg_trgm` similarity ≥ 0.8 against public recipes.

Hard failures go back to the author. Soft flags create a `moderation_item` and the recipe shows "En revisión". The health label is computed for every published version.

### 2. Reports and hiding

- **Reports:** `reports(recipe, reporter, reason, text)`, unique per reporter and recipe.
- **Hiding:** a third distinct reporter sets the recipe to `hidden` and creates a queue item.
- **Pinned plans keep working,** because they reference immutable versions.

### 3. Notifications

`notifications(user, kind, payload, read_at)` hold the moderation outcome for authors and reporters, the reason and the appeal contact (`contacto@isaacgarcia.stream`). They are shown in AppAvisos, synced, and have an empty state.

### 4. Admin

- **Role:** `private.admins` is granted only by SQL. A guard checks the role and a sign-in within the last 12 hours, and non-admins get 404.
- **Queue:** oldest first, including review items, hidden recipes and estimate reports (change 10).
- **Decisions:** approve, reject or remove, with a mandatory reason from a list plus optional text.
  - Promoting a private ingredient requires verified allergens, intolerance flags and nutrition.
  - Changing allergens or nutrition creates new versions of the affected system recipes.
  - Every action is written to the audit log.
- **Operations panels:**
  - email usage and suppressions (change 5 API), with the 80% warning;
  - the last heartbeat, with a warning past 6 days and a "Ejecutar heartbeat" button that calls the change 2 function.
- **Layout:** desktop only (DeskAdmin), using `sb-list<T>` with virtual scrolling.

## Risks / Trade-offs

- **The operator is the only reviewer.**
  - → Automatic checks keep the queue small, and hiding after reports limits exposure.
- **Blocklists cause false positives.**
  - → A blocklist hit sends the recipe to review instead of rejecting it.
