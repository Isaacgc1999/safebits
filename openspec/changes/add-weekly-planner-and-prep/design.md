# Design

## Context

- **From earlier changes:**
  - Change 11: the `RecipeIndex` (bitsets).
  - Change 10: price resolution.
  - Change 9: household constraints, equipment and the `ConstraintsChanged` event.
  - Change 7: the food rules and structured steps.
- **Designs:** AppSemana, DeskSemana, AppCambiar, AppPrep (lanes Horno, Fuegos and Tú, with now, heat, passive and done states) and AppTaperes.

## Goals / Non-Goals

**Goals:**
- A plan generated on the device in under 3 s on a mid-range phone, offline.
- The server never stores a plan entry that breaks a hard constraint.

**Non-Goals:**
- The shopping list UI and receipts (change 13). The optimiser built here is reused there.

## Decisions

### 1. Candidate filter

For each slot, the filter keeps recipes that pass all of these:
- the meal type and cuisine;
- the household's allergen and intolerance mask, including product traces in the user's chains;
- the diet and exclusions;
- hidden recipes;
- equipment eligibility;
- the health label when the preference is on;
- storage feasibility (days from the prep day ≤ fridge days, or the recipe is freezable).

It works by bitset intersection on the precomputed index. fast-check properties prove that no candidate breaks a constraint.

### 2. Pack and chain optimiser

- **Packs:** for each ingredient and chain, the cheapest combination of pack sizes covering the quantity (a bounded knapsack), reporting the leftover.
- **Chains:** every subset of the user's chains up to their maximum (at most 15 subsets) is tried, and each item goes to its cheapest safe product within the subset. The result is the cash total and the saving compared with a single chain.

### 3. Generator

1. A greedy pass fills slots by marginal pack cost, with a bonus for ingredients already bought.
2. A local search (swap and move), limited to 1.5 s, minimises this objective:
   - cash spent on whole packs;
   - plus a waste penalty;
   - plus a repetition penalty (at most 2 slots per recipe, never two consecutive meals);
   - minus a favourites bonus;
   - plus a large penalty for exceeding the budget.

Random choices use a seed for determinism. When candidates run out, the plan reports the empty slots and the limiting filters. The generator runs in a Web Worker with progress and cancellation.

### 4. Week UI and editing

- **Store:** a signal-based `PlanStore`. Every edit revalidates through the candidate filter and recomputes costs with the optimiser.
- **Swap sheet (AppCambiar):** compatible recipes ranked by cost impact.
- **Flagging:** a `ConstraintsChanged` event marks affected slots with `sb-card--flagged` (rose, icon and text "Contiene huevo · Elegir otra"). They are excluded from the list until resolved.
- **Versions:** slots store the recipe version they were planned with. A newer compatible version shows "nueva versión disponible".
- **Desktop:** the five-day grid with Comida and Cena bands and a side column.

### 5. Server revalidation

Plan slot mutations go through the change 8 registry. The handler decrypts the owner's restrictions (change 9 boundary) and runs the same filter, so a tampered entry is rejected.

### 6. Prep session

- **Storage planner:** fridge when the meal is eaten within the fridge days after the prep day; otherwise freezer with "pasar a la nevera el {día anterior}" if the recipe is freezable; otherwise the placement is refused.
- **Scheduler:** list scheduling over the steps' `{ action, ingredientRefs, minutes, mode, resource, after }`.
  - Shared preparation (same action and ingredient) is merged first.
  - Resources: the number of ovens (one temperature per oven at a time), the number of burners, and one cook for active steps.
  - The output feeds the lanes (Horno, Fuegos, Tú).
- **Containers:** the containers per meal, their storage place, label text with the eat-by date, and the total count (AppTaperes).
- **Checklist:** step ticks are stored in `prep_progress` and synced.

## Risks / Trade-offs

- **The local search may be slow on low-end phones.**
  - → A time limit, the best plan so far always returned, and it runs in a worker.
- **Schedules depend on the quality of the structured steps.**
  - → The seed validator checks step resources and dependencies (change 7).
- **"Last write wins" on plan slots across devices.**
  - → Slots are small, and devices converge on their next sync.
