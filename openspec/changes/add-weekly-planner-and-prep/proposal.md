# Proposal

## Why

This is the heart of safebits. It generates a week that is safe for the household, fits the budget, reuses ingredients to waste less, and can actually be cooked in one session with the equipment available. The prep timeline and the fridge and freezer plan are what make batch cooking work, and no comparable app offers them.

## What Changes

- **Planner** (`packages/shared`, running in a Web Worker on the device):
  - a hard-constraint candidate filter on the shared `RecipeIndex`;
  - a pack and chain optimiser (cheapest pack combination, exact search over chain subsets);
  - greedy construction plus time-limited local search, minimising cash spent on packs, waste and repetition, with a budget penalty and a favourites bonus;
  - seeded determinism.
- **Week screen** (AppSemana, DeskSemana):
  - generate, lock, and regenerate the unlocked slots;
  - swap with ranked suggestions (AppCambiar);
  - move or exchange meals, change portions, add or remove, mark eaten or skipped;
  - costs per day, per serving and in total, with the budget meter.
- **Safety and history:**
  - meals affected by constraint changes are flagged, with a single fix offered;
  - plan history and "Repetir semana";
  - the "nueva versión disponible" notice;
  - the server revalidates every plan entry.
- **Prep session:**
  - the storage planner (fridge or freezer, with the instruction to move to the fridge the day before);
  - the equipment-aware scheduler (oven temperatures, burners, one cook) that merges shared preparation;
  - the timeline in resource lanes (AppPrep) with a synced checklist;
  - containers and labels (AppTaperes);
  - day-of reheating and same-day steps.

## Capabilities

### New Capabilities

- `planning/weekly-meal-plan`: generation, hard constraints, budget, optimisation, insufficient recipes, editing per day, locking, history, offline planning, server revalidation.
- `planning/batch-prep-session`: storage feasibility, the prep timeline, equipment capacity, portioning and labels, the interactive checklist, day-of instructions.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–11.
- **Code:**
  - `packages/shared/src/domain/planning/` (filter, optimiser, generator, storage planner, scheduler);
  - `safebits_front/src/app/features/week/` and `features/prep/`;
  - `safebits_back/src/modules/planning/`;
  - migrations for `plans`, `plan_slots` (with the pinned recipe version) and `prep_progress`.
- **Verifies** the flagging scenarios of `household/preferences` and `household/kitchen-equipment`, and the "plans keep their version" rule of `recipes/user-cookbook`.
