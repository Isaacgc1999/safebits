# Design

## Context

- **Owner's rule:** reject prices that differ from the real price by more than 150%. A percentage drop can never exceed 100%, so the literal rule cannot reject 0,01 €. The same ratio is therefore applied downwards: from ÷2.5 to ×2.5.
- **Base:** estimates are seeded in change 7; sync and repositories come from change 8.

## Goals / Non-Goals

**Goals:**
- The same resolution and validation code runs on the device (for instant feedback offline) and on the server (authoritative).

**Non-Goals:**
- Receipt flows (change 13) and the admin queue UI (change 14).

## Decisions

### 1. Domain (`packages/shared/src/domain/pricing`)

- **`resolvePrice(userPrice, communityPrice, estimate)`** returns `{ cents, source, date }`.
- **`validateEntry(cents, reference)`** enforces `cents > 0` and the ratio range, with the reference being the community median when one exists, otherwise the estimate.
- **Money:** always in integer cents, formatted by the change 4 locale helpers.

### 2. Server

- **`POST /api/prices`** runs, in order:
  1. Count the attempt in Redis (`price:{user}:{product}:{yyyy-mm-dd Madrid}`, at most 5, rejected attempts included).
  2. Validate against the current reference.
  3. Insert into `user_prices`.
  4. Recalculate `community_prices` for that product with a SQL function: the median of each distinct user's latest price in the last 90 days, kept only with at least 5 users.
- **Error message:** a rejection returns the generic code `PRICE_OUT_OF_RANGE`, shown as "El precio introducido no coincide con el precio real de este producto".
- **Privacy:** `community_prices` exposes only the median, the contributor count and the update time. `user_prices` is owner-only under RLS. The median function runs on the privileged connection.

### 3. Estimate reports

`estimate_reports(user, product, created_at, resolved_at)`, unique per open report for a user and product. Admins resolve them in change 14.

### 4. Device

Prices sync through the registry, with the `user_prices` latest row and community and estimate summaries in the catalog delivery. Price entry works offline: it validates locally with the cached reference and is revalidated on sync. A server rejection is reported with the reason (change 8).

## Risks / Trade-offs

- **An AI estimate that is far off blocks honest entries.**
  - → "Reportar estimación", admin correction, and community medians replace estimates over time.
- **Large promotions fall outside the range.**
  - → They are entered as a discount line on the receipt (change 13).
