# Spec Delta

## Purpose

Records the cooking equipment available in the user's kitchen, including how many ovens and burners there are, so recipes and the prep session rely only on what the user actually has.

## ADDED Requirements

### Requirement: Equipment page
The app SHALL provide an equipment step and settings page where the user sets their ovens and hob burners with counters and marks which of these they have: freidora de aire, microondas, olla a presión, robot de cocina, batidora and báscula.

#### Scenario: Marking equipment
- **WHEN** a user turns on "Freidora de aire" and saves
- **THEN** the air fryer is stored as available for that user

### Requirement: Oven and burner counts
The user SHALL record the number of ovens (0 to 2) and hob burners (0 to 6). These counts limit what the prep session can schedule at the same time.

#### Scenario: Counts saved
- **WHEN** a user sets 1 oven and 3 burners
- **THEN** the prep session never schedules more than 1 oven task or 3 hob tasks at the same time

### Requirement: Default equipment
New users SHALL start with a hob of 4 burners, 1 oven and a microwave preselected, which they can change.

#### Scenario: New user
- **WHEN** a new user opens the equipment step
- **THEN** a hob with 4 burners, 1 oven and a microwave are preselected

### Requirement: Recipe eligibility by equipment
A recipe SHALL be usable only if every one of its required equipment groups contains at least one item the user has. A group may list alternatives, such as an air fryer or an oven.

#### Scenario: Alternative equipment
- **WHEN** a recipe requires "freidora de aire o horno" and the user has an oven but no air fryer
- **THEN** the recipe is eligible and shows that the oven will be used

#### Scenario: Missing equipment
- **WHEN** a recipe requires a blender and the user has none
- **THEN** the recipe is not used in generated plans or offered as a swap

### Requirement: Equipment changes
Removing equipment SHALL flag any meals in the current or future plans that can no longer be prepared and offer replacements.

#### Scenario: Oven removed
- **WHEN** a user sets ovens to 0 while the plan contains an oven-only lasagne
- **THEN** the lasagne is flagged and replacements without an oven are offered

### Requirement: Kitchen scale
When the user has no kitchen scale, recipe quantities SHALL also be shown in household measures (units, spoons, glasses) wherever a reliable conversion exists.

#### Scenario: No scale
- **WHEN** a user without a scale opens a recipe with 200 g of rice
- **THEN** the quantity is shown as "200 g (≈ 1 vaso)"
