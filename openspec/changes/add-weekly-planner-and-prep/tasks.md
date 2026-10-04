# Tasks

## 1. Planning engine

- [ ] 1.1 Implement the candidate filter on the `RecipeIndex` (every hard constraint, including product traces, the health preference and storage feasibility); verify unit tests and fast-check properties that no candidate breaks a constraint
- [ ] 1.2 Implement the pack and chain optimiser; verify unit tests for the 900 g / 1 kg pack and the 6,40 € split scenarios
- [ ] 1.3 Implement the generator (greedy plus time-limited local search, objective, budget penalty and over-budget amount, repetition rules, seeded determinism, empty slots with limiting filters); verify unit tests and fast-check properties (constraints never broken, repetition rules hold, same seed gives the same plan)
- [ ] 1.4 Run the generator in a Web Worker with progress and cancellation; verify generation runs off the main thread, finishes within 3 s on the full catalog on a mid-range profile, and interactions stay under 200 ms meanwhile

## 2. Plan data and server

- [ ] 2.1 Add the migrations for `plans`, `plan_slots` (pinned recipe version, portions, locked, state) and `prep_progress`, with owner-only RLS and harness entries; verify the migrations and RLS tests
- [ ] 2.2 Register the plan sync handlers with server-side revalidation through the shared filter; verify a tampered entry containing a household allergen is rejected

## 3. Week UI

- [ ] 3.1 Build the week screen (AppSemana; DeskSemana with the five-day grid and side column) with generate, lock, regenerate unlocked slots, costs per day, per serving and in total, the budget meter and the over-budget notice; verify Playwright for the generation, locked-slot and budget-impossible scenarios
- [ ] 3.2 Build the swap sheet (AppCambiar) with ranked suggestions, plus move or exchange, portions, add or remove, and eaten or skipped; verify Playwright for the swap and portions scenarios and keyboard-only swapping
- [ ] 3.3 Implement flagging from `ConstraintsChanged` with the single-fix action and the exclusion from the list; verify Playwright for the egg-allergy tortilla and oven-removed lasagne scenarios
- [ ] 3.4 Implement plan history, "Repetir semana" with revalidation, and the "nueva versión disponible" notice; verify tests for the repeat-week and author-adds-peanuts scenarios

## 4. Prep session

- [ ] 4.1 Implement the storage planner; verify unit tests for the fridge then freezer and the non-freezable scenarios
- [ ] 4.2 Implement the scheduler (merge shared preparation, ovens by temperature, burners, one cook, start times and total duration); verify unit tests for grouped onions and the 200 °C / 180 °C single-oven scenario
- [ ] 4.3 Implement the container list with labels and eat-by dates, and the day-of instructions; verify unit tests for the container-count and salad scenarios
- [ ] 4.4 Build AppPrep (resource lanes with now, heat, passive and done states; synced checklist) and AppTaperes, plus the two-column desktop prep layout derived in change 4; verify ticks made on one context appear on another after sync, axe, and visual comparison with the designs
