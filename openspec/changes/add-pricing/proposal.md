# Proposal

## Why

Costs drive the planner, the shopping list and the budget, so every product needs a usable price before those features exist. Estimates alone go stale. Users' real prices make the app accurate: they are private to each user, and, anonymously aggregated, they improve everyone's estimates. They must also resist mistakes and abuse.

## What Changes

- **Price resolution:** the user's own price first, then the community median (at least 5 distinct users, the latest price per user, the last 90 days), then the dated estimate. Each price shows its source as a pill: *tu precio*, *comunidad* or *estimado*.
- **Price entry:**
  - Validated in the range `[reference ÷ 2.5, reference × 2.5]`, greater than 0 and with at most two decimals. The reference is the community median when one exists, otherwise the estimate.
  - Limited to 5 attempts per user, product and day (Madrid time), and rejected attempts count.
  - The median is recalculated in the same transaction.
  - Individual entries are never exposed.
- **"Reportar estimación":** creates an estimate report, once per user and product until it is resolved. The admin queue is built in change 14.
- **The price screen** (AppPrecio), price pills, and the "Precios orientativos" disclaimer.

## Capabilities

### New Capabilities

- `pricing/product-prices`: estimated reference price, resolution order, user price entry, range validation, daily limit, community median, reporting a wrong estimate.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–9 (estimates are seed data from change 7).
- **Code:** `packages/shared/src/domain/pricing/`, `safebits_back/src/modules/pricing/`, `safebits_front/src/app/features/prices/`, and migrations for `user_prices`, `community_prices` (with the median function) and `estimate_reports`.
- **Later changes:** lists and receipts (change 13) reuse price entry; the admin queue (change 14) reads the estimate reports.
