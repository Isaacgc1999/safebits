# Design

## Context

- **From earlier changes:**
  - Change 12: plans and the pack and chain optimiser.
  - Change 10: price resolution and price entry.
  - Change 8: sync.
- **Designs:** AppLista (in-store mode, sticky footer, peach "Terminar compra"), DeskLista, AppTicket (a line to correct), AppDespensa and AppPresupuesto.

## Goals / Non-Goals

**Goals:**
- The list stays correct as the plan changes, without losing what was already bought.
- Shopping works fully offline in the store.

**Non-Goals:**
- Recognising prices from photos (planned for v2).

## Decisions

### 1. List builder (`packages/shared/src/domain/shopping`)

- **Building:** `buildList(plan, pantry, household, prices)` aggregates quantities in base units and subtracts the pantry. It then runs the change 12 optimiser to choose products, packs and chains, and returns lines grouped by chain and section, with leftovers and the saving.
- **Recalculating:** `reconcile(previousList, newNeeds)` keeps ticked lines, adds "Falta por comprar" lines, removes unticked lines that are no longer needed, and moves ticked lines that are no longer needed to leftovers.

### 2. Pantry

- **Staples** are excluded from the list.
- **Week rollover:** the first time the next week is built, on the device or the server, leftovers of long-life ingredients are added to the pantry with their quantities. Fresh leftovers are not carried over.

### 3. Receipts

- **Data:** `tickets(chain, date, total)` and `ticket_lines(product | text, qty, unit_price_cents, discount)`.
- **"Terminar compra"** creates a draft from that supermarket's ticked lines with their current prices.
- **Saving:** each product line is submitted through the change 10 price entry, so the range and daily limits apply. An invalid line blocks saving and is marked with the rose state from the AppTicket design.
- **Offline:** receipts captured offline are revalidated on sync. A rejected line is reported and marked for correction.

### 4. Budget

Per week: budget, plan estimate and the sum of that week's receipts. Monthly and per-supermarket totals are computed from the synced receipts. Display uses the brand voice ("Te sobran 5,70 €").

## Risks / Trade-offs

- **Large promotions fall outside the price range.**
  - → Discount lines on the receipt.
- **Recalculation can be confusing after many edits.**
  - → "Falta por comprar" and leftovers are shown in clearly separated sections.
