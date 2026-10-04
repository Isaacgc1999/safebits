# Tasks

## 1. Domain and data

- [ ] 1.1 Implement `resolvePrice` and `validateEntry` in `packages/shared/src/domain/pricing`; verify unit tests for own, community and estimate sources and for 5,00 accepted, 5,01 rejected, 0,80 accepted and 0,01 rejected
- [ ] 1.2 Add the migrations for `user_prices` (owner-only RLS), `community_prices` with the median SQL function (latest per user, 90 days, at least 5 users) and `estimate_reports`, with harness entries; verify SQL tests for the 4-user, 5-user and repeated-entries scenarios

## 2. Server

- [ ] 2.1 Implement `POST /api/prices` (daily limit with rejected attempts counted, validation against the current reference, insert, median recalculated in the same transaction, no individual data exposed); verify integration tests for every product-prices scenario
- [ ] 2.2 Implement "Reportar estimación" (one open report per user and product); verify a duplicate report is refused until the first is resolved

## 3. Device and UI

- [ ] 3.1 Register the price entities with sync, validate locally offline with cached references, and report server rejections; verify a test where an offline entry is rejected on sync after the reference changed
- [ ] 3.2 Build the price screen (AppPrecio) and the reusable price pill (*tu precio*, *comunidad*, *estimado* in butter) with the "Precios orientativos" note, in es and en; verify Playwright for the accepted, rejected and daily-limit messages, axe, and visual comparison with the design
