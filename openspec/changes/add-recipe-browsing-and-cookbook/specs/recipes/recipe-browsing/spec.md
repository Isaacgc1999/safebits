# Spec Delta

## Purpose

Lets users browse, search and filter the recipes available to them, open a recipe with everything they need to cook and buy it, and keep favourites or hide recipes.

## ADDED Requirements

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
