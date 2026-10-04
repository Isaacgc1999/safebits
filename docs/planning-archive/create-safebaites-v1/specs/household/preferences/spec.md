# Spec Delta

## Purpose

Captures who the user cooks for and what the household can and wants to eat, so every plan respects the household's constraints and preferences.

## ADDED Requirements

### Requirement: First-run onboarding
On the first sign-in the app SHALL show an onboarding wizard before any plan can be generated. It covers, in order:
1. Household size
2. Dietary restrictions
3. Excluded foods
4. Cuisines
5. Days and meals
6. Supermarkets
7. Budget
8. Prep day
9. Kitchen equipment
10. Alias

Household size, days and meals, supermarkets, budget, prep day and alias MUST be completed. The other steps are optional.

#### Scenario: Plan blocked until required steps
- **WHEN** a user skips the budget step and tries to generate a plan
- **THEN** the app asks them to complete the budget first

#### Scenario: Onboarding resumes
- **WHEN** a user closes the app halfway through onboarding and returns
- **THEN** onboarding resumes at the first incomplete step with earlier answers kept

### Requirement: Household size
The user SHALL choose a household size of 1, 2, 3 or 4, or enter a custom whole number from 1 to 12. All household members eat the same meals, and recipe quantities MUST be scaled to the household size.

#### Scenario: Custom size accepted
- **WHEN** a user enters 6 in the custom field
- **THEN** the household size is saved as 6

#### Scenario: Invalid custom size
- **WHEN** a user enters 0, 13 or 2.5
- **THEN** the value is refused with the allowed range shown

### Requirement: Dietary restrictions
The user SHALL be able to mark any of the 14 EU allergens as an allergy, mark lactose intolerance, and choose a diet (no restriction, vegetarian, vegan, pescatarian). Restrictions apply to the whole household as hard constraints. Recording allergies or intolerances requires health-data consent.

#### Scenario: Allergy excludes traces
- **WHEN** the household has a nut allergy
- **THEN** recipes with nuts, and products labelled "may contain nuts", are never used in plans or lists

#### Scenario: Intolerance allows traces
- **WHEN** the household has lactose intolerance but no milk allergy
- **THEN** products with only "may contain milk" traces remain allowed

#### Scenario: Vegan diet
- **WHEN** the diet is vegan
- **THEN** no recipe containing an ingredient of animal origin is used

### Requirement: Excluded foods
The user SHALL be able to exclude specific ingredients or whole categories, such as mushrooms, coriander or all offal. Excluded foods MUST never appear in plans.

#### Scenario: Excluded ingredient
- **WHEN** coriander is excluded
- **THEN** no recipe containing coriander is used in any generated plan or offered as a swap

### Requirement: Cuisine selection
The user SHALL select one or more cuisines from the supported list, or "Cualquiera". Generated plans MUST only use recipes from the selected cuisines.

#### Scenario: Not enough recipes for the selected cuisines
- **WHEN** the selected cuisines leave too few compatible recipes to fill the plan
- **THEN** the app fills what it can and suggests adding cuisines

### Requirement: Days and meals to plan
The user SHALL choose which days of the week to plan (Monday to Sunday) and which meals (desayuno, comida, cena, snack). The choice can be the same for every selected day or set per day.

#### Scenario: Specific meals per day
- **WHEN** a user selects dinner only from Monday to Thursday, plus lunch and dinner on Friday
- **THEN** generated plans contain exactly those slots

### Requirement: Preferred supermarkets
The user SHALL choose one or more supermarkets from Mercadona, Lidl, Carrefour and Consum, and a maximum number of supermarkets to visit per week, from 1 up to the number selected. The default maximum is 2.

#### Scenario: Single store
- **WHEN** a user selects Mercadona and Lidl with a maximum of 1 store
- **THEN** each shopping list uses only one of those two chains

### Requirement: High-protein and healthy preference
The profile SHALL include the preference "Solo recetas altas en proteína y saludables", which is on by default. While it is on, plans MUST only use recipes that carry the "Alta en proteína y saludable" label.

#### Scenario: Default for new users
- **WHEN** a new user completes onboarding without touching this preference
- **THEN** the preference is on

#### Scenario: Turned off
- **WHEN** a user turns the preference off
- **THEN** community recipes without the label become eligible for that user's plans

### Requirement: Weekly budget
The user SHALL set an approximate weekly budget in euros between 10 € and 1,000 €.

#### Scenario: Budget out of range
- **WHEN** a user enters 5 €
- **THEN** the value is refused with the allowed range shown

### Requirement: Prep day
The user SHALL choose Saturday or Sunday as the prep day. The planned week is the Monday to Sunday that follows the prep day.

#### Scenario: Sunday prep
- **WHEN** the prep day is Sunday 11 October 2026
- **THEN** the plan covers Monday 12 to Sunday 18 October 2026

### Requirement: Editing preferences
The user SHALL be able to edit any preference at any time. If a change makes recipes in the current or future plans incompatible, for example a new allergy, those meals MUST be highlighted immediately and replacements offered.

#### Scenario: New allergy added
- **WHEN** a user adds an egg allergy while the current plan contains a tortilla
- **THEN** the tortilla is flagged as incompatible
- **AND** compatible replacements are offered
- **AND** the flagged meal is excluded from the shopping list until resolved
