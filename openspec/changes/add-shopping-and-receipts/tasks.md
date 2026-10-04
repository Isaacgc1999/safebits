# Tasks

## 1. Domain and data

- [ ] 1.1 Implement `buildList` (aggregation, pantry subtraction, safe products, optimiser, grouping, leftovers, saving); verify unit tests for the 900 g aggregation, the coeliac oat and the 6,40 € saving scenarios
- [ ] 1.2 Implement `reconcile` for plan edits; verify unit tests for the swap-after-shopping scenario
- [ ] 1.3 Implement the pantry rules (staples, lazy rollover of long-life leftovers only); verify unit tests for the rice-carried-over and spinach-not-carried scenarios
- [ ] 1.4 Add the migrations for `shopping_list_items`, `extra_items`, `pantry_items`, `tickets` and `ticket_lines` with owner-only RLS and harness entries, and register their sync handlers; verify the migrations, RLS tests and sync round trips

## 2. Shopping list UI

- [ ] 2.1 Build the in-store list (AppLista: 60 px rows, price pills, recipes per item, offline ticking, totals, sticky footer with "Terminar compra"; DeskLista on desktop) with the allergy and price notices and the empty state; verify a Playwright test of ticking offline, the 400% zoom check, and visual comparison with the designs
- [ ] 2.2 Add extra free-text items with an optional price counted in the total; verify a unit test and the UI flow

## 3. Pantry, receipts and budget

- [ ] 3.1 Build the pantry screen (AppDespensa) with staples and editable leftovers; verify Playwright and visual comparison
- [ ] 3.2 Build receipts (AppTicket): manual entry with discount lines, the "Terminar compra" prefill, line prices through price entry with saving blocked on an invalid line, history by week and month, editing and deletion; verify integration and Playwright tests for every purchase-tickets scenario
- [ ] 3.3 Implement offline receipts revalidated on sync, with the line marked for correction when rejected; verify a Playwright test with a reference price changed on the server between capture and sync
- [ ] 3.4 Build the budget screen (AppPresupuesto): per week budget, estimate and spend, plus monthly and per-supermarket totals; verify a unit test for the 60 / 54,30 / 57,85 € scenario and visual comparison
