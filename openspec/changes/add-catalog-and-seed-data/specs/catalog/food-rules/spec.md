# Spec Delta

## Purpose

Defines the food rules every recipe and product is checked against: units, derived allergens, intolerance triggers and diets, food safety, nutrition, and the high-protein and healthy label.

## ADDED Requirements

### Requirement: Units and conversions
Quantities SHALL be expressed in g, ml or units. Spoon measures and "pizca" MUST convert to g or ml for cost calculations. Unit items MUST convert to grams using their average weight.

#### Scenario: Spoon conversion
- **WHEN** a recipe uses 2 cucharadas of aceite de oliva
- **THEN** 30 ml is used for quantity and cost calculations

### Requirement: Derived allergens, intolerances and diets
A recipe's allergens, traces, intolerance triggers (lactose, fructose, histamine, sorbitol) and diet compatibility SHALL be computed from its ingredients, never entered by hand.

#### Scenario: Allergen follows ingredient
- **WHEN** cheese is added to a recipe
- **THEN** milk and lactose appear among its triggers and it is no longer marked vegan

#### Scenario: Intolerance trigger
- **WHEN** aged cheese is added to a recipe
- **THEN** histamine appears among its intolerance triggers

### Requirement: Allergies versus intolerances
For an allergy, ingredients and products containing the allergen, or labelled with "may contain" traces of it, SHALL be excluded. For an intolerance, only ingredients that trigger it MUST be excluded, and traces are allowed.

#### Scenario: Allergy excludes traces
- **WHEN** a household has a nut allergy
- **THEN** products labelled "may contain nuts" are excluded

#### Scenario: Intolerance allows traces
- **WHEN** a household has lactose intolerance but no milk allergy
- **THEN** products with only "may contain milk" traces remain allowed

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

### Requirement: Derived nutrition
Each recipe's nutrition per serving (energy, protein, fat, saturated fat, carbohydrates, sugars, fibre, salt) SHALL be computed from its ingredients and quantities, not entered by hand.

#### Scenario: Nutrition follows quantities
- **WHEN** the chicken in a recipe goes from 400 g to 600 g
- **THEN** the protein and energy per serving increase accordingly

### Requirement: High-protein and healthy label
A recipe SHALL carry the "Alta en proteína y saludable" label only when, per serving:
- at least 20% of its energy comes from protein, with at least 20 g for a breakfast, 10 g for a tentempié or merienda, and 30 g for a lunch or dinner;
- saturated fat and free sugars each stay at or below 10% of energy;
- a lunch or dinner has at most 1.5 g salt and at least 6 g fibre;
- the nutrition of every ingredient is known.

#### Scenario: Low-protein dinner
- **WHEN** a dinner provides 22 g protein per serving
- **THEN** it does not carry the label

#### Scenario: Salty lunch
- **WHEN** a lunch has 2.1 g salt per serving
- **THEN** it does not carry the label

#### Scenario: Unknown nutrition
- **WHEN** a recipe uses an ingredient with no nutrition values
- **THEN** its nutrition is shown as incomplete and it does not carry the label
