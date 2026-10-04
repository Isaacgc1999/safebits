# Spec Delta

## Purpose

Records the cooking equipment available in the user's kitchen, including how many ovens and burners there are, so recipes and the prep session rely only on what the user actually has.

## ADDED Requirements

### Requirement: Equipment page
The app SHALL provide an equipment page, reachable from onboarding and settings, where the user marks which equipment they have from a fixed list:
- horno, placa (hob), microondas, freidora de aire
- olla de cocción lenta, olla a presión, robot de cocina multifunción
- batidora de vaso, batidora de mano, procesador de alimentos
- grill o plancha eléctrica, arrocera, vaporera, tostadora

#### Scenario: Marking equipment
- **WHEN** a user turns on "freidora de aire" and saves
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
