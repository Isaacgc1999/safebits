# Spec Delta

## Purpose

Generates, and lets users adjust, a weekly meal plan that respects every household constraint and the budget, optimised for batch cooking, low cost and minimal waste.

## ADDED Requirements

### Requirement: Plan generation
The user SHALL be able to generate a plan for the week after their prep day. It fills exactly the selected day and meal slots with recipes scaled to the household size.

#### Scenario: Plan generated
- **WHEN** a user with dinners Monday to Friday generates a plan
- **THEN** each of the 5 dinner slots has a recipe with portions for the household

### Requirement: Hard constraints
Generated and edited plans SHALL never contain a recipe that breaks any of these:
- Dietary restrictions, including traces for allergies.
- Excluded foods, diet or hidden recipes.
- Missing equipment.
- The meal type of the slot or the selected cuisines.
- The "Solo recetas altas en proteína y saludables" preference, when it is on.
- The storage limits of the prep session.
- The lack of a safe product in the user's chains.

#### Scenario: Excluded food never planned
- **WHEN** any number of plans are generated for a household that excludes mushrooms
- **THEN** none contains a recipe with mushrooms

#### Scenario: Health preference on
- **WHEN** the high-protein and healthy preference is on and a community recipe lacks the label
- **THEN** that recipe is never placed in a generated plan or offered as a swap

#### Scenario: Manual choice of an incompatible recipe
- **WHEN** a user tries to place a recipe that contains an allergen of the household
- **THEN** the placement is blocked with the reason shown

### Requirement: Budget
The plan's estimated cost SHALL be the cost of the packs actually bought, minus what is already in the pantry. It MUST not exceed the weekly budget when a compliant plan exists. If none exists, the app MUST show the cheapest plan found and by how much it exceeds the budget.

#### Scenario: Budget impossible
- **WHEN** the cheapest compliant plan costs 72 € and the budget is 60 €
- **THEN** the 72 € plan is shown with a notice that it exceeds the budget by 12 €

### Requirement: Cost and waste optimisation
Among compliant plans within budget, generation SHALL prefer lower total cost and less leftover from bought packs, and favour shared ingredients and favourite recipes. A recipe MUST fill at most 2 slots per week, never two consecutive meals.

#### Scenario: Shared ingredient preferred
- **WHEN** two candidate plans cost the same but one buys a pack of coriander used by three recipes and the other buys coriander for one recipe
- **THEN** the plan using the coriander in three recipes is chosen

#### Scenario: Repetition limit
- **WHEN** a plan is generated
- **THEN** no recipe occupies more than 2 slots or two consecutive meals

### Requirement: Insufficient recipes
If the constraints leave too few recipes to fill every slot, the plan SHALL fill what it can, list the empty slots, and name the filters that limit it.

#### Scenario: Too restrictive
- **WHEN** only 3 compatible breakfasts exist for 7 breakfast slots
- **THEN** the plan uses them within the repetition limit, leaves the rest empty, and suggests widening cuisines

### Requirement: Editing meals per day
For any slot, the user SHALL be able to:
- Swap the recipe, with compatible suggestions ranked by cost impact.
- Pick any compatible recipe, or move or exchange meals between slots.
- Change portions, remove the meal, add a meal to an empty slot, or mark it eaten or skipped.

Each edit MUST revalidate the hard constraints and update costs, the shopping list and the prep session.

#### Scenario: Swap updates list and cost
- **WHEN** a user swaps Tuesday dinner for another recipe
- **THEN** the plan cost, shopping list and prep timeline update accordingly

#### Scenario: Portions changed
- **WHEN** a user changes Wednesday lunch from 2 to 4 portions
- **THEN** the quantities and cost for that meal double

### Requirement: Locking and regeneration
The user SHALL be able to lock slots and regenerate the whole week or only the unlocked slots.

#### Scenario: Locked slot kept
- **WHEN** a user locks Monday dinner and regenerates
- **THEN** Monday dinner is unchanged and all other slots may change

### Requirement: Plan history
Past weekly plans SHALL be kept and viewable. A past week MUST be reusable as the new plan, subject to the current constraints.

#### Scenario: Repeat a week
- **WHEN** a user reuses a past week that contains a now-incompatible recipe
- **THEN** that recipe is replaced or flagged and the rest is reused

### Requirement: Offline planning
Plan generation and editing SHALL work without a network connection, using the data stored on the device.

#### Scenario: Generating offline
- **WHEN** a user with no connection generates a plan
- **THEN** a valid plan is produced and synced when the connection returns

### Requirement: Server-side revalidation
The server SHALL refuse to store any plan entry that breaks the household's current hard constraints, even if the client sends it.

#### Scenario: Tampered client
- **WHEN** a modified client submits a plan entry containing a household allergen
- **THEN** the server rejects it and the user is notified
