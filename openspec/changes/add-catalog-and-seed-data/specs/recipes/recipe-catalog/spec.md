# Spec Delta

## Purpose

Provides the shared library of system recipes, with the structured data that the planner, allergen checks, prep session and shopping list rely on, and enough variety for every combination of filters.

## ADDED Requirements

### Requirement: System recipes
At launch the catalog SHALL contain at least 2,000 system recipes, each in Spanish and English and labelled with the author "Sistema", including at least 400 breakfasts, 250 tentempiés, 550 lunches, 250 meriendas and 550 dinners.

#### Scenario: Catalog size at launch
- **WHEN** the catalog is counted after the initial data load
- **THEN** there are at least 2,000 system recipes in both languages and every meal type meets its minimum

#### Scenario: Meal type below minimum
- **WHEN** the recipe data is validated and it contains 230 meriendas
- **THEN** validation fails and the data is not loaded

### Requirement: Allergen, intolerance and diet coverage
For each meal type, and for each of the 14 EU allergens and the 4 intolerances, at least 25% of system recipes (and never fewer than 60) SHALL be free of it. For each meal type there MUST be at least:
- 60 recipes each for vegetarian, vegan and pescatarian;
- 40 that are both gluten-free and lactose-free;
- 30 that are both vegan and gluten-free.

#### Scenario: Intolerance coverage
- **WHEN** the recipe data is validated
- **THEN** for every meal type at least 25% and at least 60 recipes are free of each allergen and of each intolerance trigger

#### Scenario: Combined filters
- **WHEN** the recipe data is validated and only 25 meriendas are both vegan and gluten-free
- **THEN** validation fails and the data is not loaded

### Requirement: Cuisine coverage
Each of the 10 cuisines offered (española, mediterránea, italiana, griega, francesa, mexicana, americana, asiática, india and oriente medio) SHALL have at least 20 system recipes in each meal type, of which at least 6 MUST be gluten-free, 6 lactose-free and 6 vegetarian.

#### Scenario: Cuisine with few meriendas
- **WHEN** the recipe data is validated and the "india" cuisine has 15 meriendas
- **THEN** validation fails and names the cuisine and meal type

### Requirement: Equipment and storage coverage
At least 400 system recipes SHALL need no oven, and at least 120 SHALL need neither oven nor hob. Among lunches and dinners, at least 60% MUST keep 3 or more days in the fridge, and at least 40% MUST be freezable.

#### Scenario: Batch-friendly share
- **WHEN** the recipe data is validated and only 50% of dinners keep 3 or more fridge days
- **THEN** validation fails and the data is not loaded

### Requirement: High-protein and healthy system recipes
Every system recipe SHALL carry the "Alta en proteína y saludable" label as defined in the food rules.

#### Scenario: Recipe without the label
- **WHEN** seed validation finds a system recipe that does not meet the label thresholds
- **THEN** validation fails for that recipe

### Requirement: Recipe structure
Each recipe SHALL include:
- Title, description, meal types, cuisine and base servings.
- Ingredient lines (ingredient, quantity, unit, optional flag).
- Ordered steps, each with active or passive time and the equipment used, and the total time.
- Required equipment groups.
- Days it keeps in the fridge once cooked, whether it is freezable, reheating instructions, and any same-day finishing step.
- Difficulty, author and version.
- Derived nutrition per serving and the "Alta en proteína y saludable" label when it applies.

#### Scenario: Incomplete recipe rejected
- **WHEN** a recipe without fridge days or freezable information is saved
- **THEN** it is rejected with the missing fields listed

### Requirement: Catalog visibility
The catalog a user sees SHALL be the system recipes, public community recipes, and that user's own private recipes.

#### Scenario: Another user's private recipe
- **WHEN** a user searches the catalog
- **THEN** private recipes of other users never appear
