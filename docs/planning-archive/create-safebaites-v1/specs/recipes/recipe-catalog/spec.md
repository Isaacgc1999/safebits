# Spec Delta

## Purpose

Provides the shared library of system and community recipes, with the structured data that the planner, allergen checks, prep session and shopping list rely on, and lets users browse, search and favourite them.

## ADDED Requirements

### Requirement: System recipes
At launch the catalog SHALL contain at least 2,000 system recipes, each in Spanish and English and labelled with the author "Sistema". The minimums per meal type are 400 breakfasts, 550 lunches, 550 dinners and 300 snacks.

#### Scenario: Catalog size at launch
- **WHEN** the catalog is counted after the initial data load
- **THEN** there are at least 2,000 system recipes, each with Spanish and English text, and every meal type meets its minimum

#### Scenario: Meal type below minimum
- **WHEN** the recipe data is validated and it contains 380 breakfasts
- **THEN** validation fails and the data is not loaded

### Requirement: Allergen and diet coverage
For each meal type, and for each of the 14 EU allergens and lactose, at least 25% of system recipes (and never fewer than 60) SHALL be free of it. For each meal type there MUST be at least:
- 60 recipes each for vegetarian, vegan and pescatarian;
- 40 that are both gluten-free and lactose-free;
- 30 that are both vegan and gluten-free.

#### Scenario: Allergen coverage
- **WHEN** the recipe data is validated
- **THEN** for every meal type, at least 25% and at least 60 recipes are free of each allergen and of lactose

#### Scenario: Combined filters
- **WHEN** the recipe data is validated and only 25 snacks are both vegan and gluten-free
- **THEN** validation fails and the data is not loaded

### Requirement: Cuisine coverage
Every cuisine offered in preferences SHALL have at least 20 system recipes in each meal type. Within each cuisine and meal type, at least 6 MUST be gluten-free, 6 lactose-free and 6 vegetarian.

#### Scenario: Cuisine with few breakfasts
- **WHEN** the recipe data is validated and the "india" cuisine has 15 breakfasts
- **THEN** validation fails and names the cuisine and meal type

### Requirement: Equipment and storage coverage
At least 400 system recipes SHALL need no oven, and at least 120 SHALL need neither oven nor hob. Among lunches and dinners, at least 60% MUST keep 3 or more days in the fridge, and at least 40% MUST be freezable.

#### Scenario: Batch-friendly share
- **WHEN** the recipe data is validated and only 50% of dinners keep 3 or more fridge days
- **THEN** validation fails and the data is not loaded

### Requirement: Derived nutrition
Each recipe's nutrition per serving (energy, protein, fat, saturated fat, carbohydrates, sugars, fibre, salt) SHALL be computed from its ingredients and quantities, not entered by hand.

#### Scenario: Nutrition follows quantities
- **WHEN** the chicken in a recipe goes from 400 g to 600 g
- **THEN** the protein and energy per serving increase accordingly

### Requirement: High-protein and healthy system recipes
Every system recipe SHALL get at least 20% of its energy from protein. It MUST also reach at least 20 g protein per breakfast serving, 30 g per lunch or dinner, and 10 g per snack. Per serving, saturated fat and free sugars MUST each stay at or below 10% of energy. Lunches and dinners MUST have at most 1.5 g salt and at least 6 g fibre.

#### Scenario: Low-protein recipe rejected
- **WHEN** a system dinner provides 22 g protein per serving
- **THEN** seed validation fails for that recipe

#### Scenario: Salty main meal rejected
- **WHEN** a system lunch has 2.1 g salt per serving
- **THEN** seed validation fails for that recipe

#### Scenario: Community recipes labelled
- **WHEN** a community recipe meets every high-protein and healthy threshold
- **THEN** it carries the "Alta en proteína y saludable" label, and otherwise it does not

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

### Requirement: Derived allergens and diets
A recipe's allergens, traces and diet compatibility SHALL be computed from its ingredients, not entered by hand.

#### Scenario: Allergen follows ingredient
- **WHEN** cheese is added to a recipe
- **THEN** milk appears in its allergens and it is no longer marked vegan

### Requirement: Food-safety rules
Every recipe SHALL pass the food-safety rules:
- At most 4 days in the fridge, at most 2 for dishes with fish or seafood, and at most 1 for dishes with cooked rice.
- Dried red kidney beans must include soaking and at least 10 minutes of boiling before any slow cooking.
- Raw or undercooked egg must not be in a dish stored for later.

#### Scenario: Rice dish fridge limit
- **WHEN** a recipe with cooked rice declares 3 fridge days
- **THEN** it fails validation with a message that the limit is 1 day

#### Scenario: Unsafe kidney beans
- **WHEN** a slow-cooker recipe uses dried red kidney beans without a boiling step
- **THEN** it fails validation

### Requirement: Catalog visibility
The catalog a user sees SHALL be the system recipes, public community recipes, and that user's own private recipes.

#### Scenario: Another user's private recipe
- **WHEN** a user searches the catalog
- **THEN** private recipes of other users never appear

### Requirement: Browse, search and filter
Users SHALL be able to search recipes by text, ignoring accents, and filter by meal type, cuisine, total time, diet, owned equipment and the "Alta en proteína y saludable" label. Recipes incompatible with the household restrictions MUST be hidden by default. If shown on request, they MUST carry a visible incompatibility warning and cannot be added to a plan.

#### Scenario: Incompatible recipes hidden
- **WHEN** a household with a gluten allergy searches "pasta"
- **THEN** only gluten-free pasta recipes are listed unless they choose to show all

### Requirement: Recipe detail
A recipe detail SHALL show:
- Ingredients scaled to the household size.
- Allergens, required equipment and storage information.
- The estimated cost per serving in the user's supermarkets, with price sources.
- Nutrition per serving (energy, protein, fat, saturated fat, carbohydrates, sugars, fibre, salt).
- The steps.

#### Scenario: Scaled quantities
- **WHEN** a 4-serving recipe is viewed by a household of 2
- **THEN** all quantities and costs are halved

### Requirement: Favourites and hidden recipes
Users SHALL be able to mark recipes as favourites, which the planner prefers, and hide recipes with "No sugerir más", which the planner never uses for that user.

#### Scenario: Hidden recipe
- **WHEN** a user hides a recipe
- **THEN** it is never used in that user's generated plans or offered as a swap
