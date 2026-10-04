# Proposal

## Why

The plan only saves money if it becomes a clear list per supermarket that people can tick off in the aisle with one thumb and no signal. Recording what was actually paid closes the loop: real receipts keep prices accurate and show whether the week stayed within budget.

## What Changes

- **Shopping list** (AppLista in-store mode, DeskLista):
  - quantities aggregated from the plan, minus the pantry;
  - only safe products;
  - optimal packs and chains, with the saving shown;
  - grouped by supermarket and section;
  - 60 px rows with packs, a price pill and the recipes each item is for;
  - offline ticking, synced;
  - extra free-text items;
  - totals per supermarket and overall.
- **After plan edits,** the list is recalculated: "Falta por comprar" for new needs, and ticked items that are no longer needed become leftovers.
- **Pantry** (AppDespensa): staples, and long-life leftovers carried over at the week rollover, which can be edited.
- **Receipts** (AppTicket):
  - entered by hand, with discount lines;
  - prefilled from "Terminar compra";
  - each line's price is checked with the pricing rules, and an invalid line blocks saving;
  - history by week and month, with editing and deletion;
  - offline capture, revalidated on sync.
- **Budget** (AppPresupuesto): budget, plan estimate and actual spend per week, plus monthly and per-supermarket totals.

## Capabilities

### New Capabilities

- `shopping/shopping-list`: aggregation, supermarket assignment, pack selection, safe products, layout, ticking, recalculation after edits, pantry, extra items.
- `shopping/purchase-tickets`: manual receipts, the prefill from the list, receipt prices updating user prices, history, budget tracking, offline receipts.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–12 (it reuses the pack and chain optimiser from change 12 and price entry from change 10).
- **Code:** `packages/shared/src/domain/shopping/`, `safebits_front/src/app/features/list/`, `features/pantry/`, `features/receipts/`, `features/budget/`, `safebits_back/src/modules/shopping/`.
- **Migrations:** `shopping_list_items`, `extra_items`, `pantry_items`, `tickets`, `ticket_lines`.
- **Verifies** the allergy and price disclaimers of `legal/terms-and-consent` on the list.
