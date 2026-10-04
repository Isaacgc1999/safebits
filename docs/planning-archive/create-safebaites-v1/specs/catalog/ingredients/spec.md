# Spec Delta

## Purpose

Provides the shared vocabulary of generic ingredients, with allergens, diet flags, units and conversions, that recipes, products, prices and allergen checks are built on, plus private ingredients that users add for themselves.

## ADDED Requirements

### Requirement: Generic ingredient catalog
Each generic ingredient SHALL have a Spanish and English name and a category. It SHALL also carry:
- Allergen tags (the 14 EU allergens plus lactose).
- Diet flags (meat, fish or seafood, dairy, egg, other animal origin).
- A base unit (g, ml or unit) and, for unit-based items, an average weight.
- A long-life flag for shelf-stable goods.

#### Scenario: Ingredient data
- **WHEN** the ingredient "cebolla" is viewed
- **THEN** it shows category "Verduras", no allergens, base unit "unit" and an average weight of 150 g

### Requirement: Ingredient nutrition
Every catalog ingredient SHALL have nutrition values per 100 g (or 100 ml): energy, protein, fat, saturated fat, carbohydrates, sugars, fibre and salt, taken from a public-domain food composition source. Private ingredients MAY omit nutrition. A recipe using a private ingredient without nutrition MUST NOT receive the "Alta en proteína y saludable" label.

#### Scenario: Catalog ingredient without nutrition
- **WHEN** seed validation finds a catalog ingredient with no protein value
- **THEN** validation fails and the data is not loaded

#### Scenario: Private ingredient without nutrition
- **WHEN** a user recipe uses a private ingredient with no nutrition values
- **THEN** the recipe shows its nutrition as incomplete and does not carry the health label

### Requirement: Units and conversions
Quantities SHALL be expressed in g, ml or units. Spoon measures and "pizca" MUST convert to g or ml for cost calculations. Unit items MUST convert to grams using their average weight.

#### Scenario: Spoon conversion
- **WHEN** a recipe uses 2 cucharadas of aceite de oliva
- **THEN** 30 ml is used for quantity and cost calculations

### Requirement: Ingredient picker search
The ingredient picker SHALL search ingredients by name in the current language, ignoring accents and capitalisation. Results include global ingredients and the user's own private ingredients.

#### Scenario: Accent-insensitive search
- **WHEN** a user types "limon"
- **THEN** "Limón" appears in the results

### Requirement: Private custom ingredients
A user SHALL be able to add an ingredient that is missing from the catalog. They give its name, category and base unit and must explicitly declare its allergens; "none of the listed allergens" is a valid answer. Private ingredients MUST be visible only to their creator unless an admin promotes them.

#### Scenario: Adding a private ingredient
- **WHEN** a user adds "salsa de la abuela" and declares the allergens egg and mustard
- **THEN** the ingredient is available in that user's picker with those allergens

#### Scenario: Private to the creator
- **WHEN** another user searches for "salsa de la abuela"
- **THEN** it does not appear

#### Scenario: Allergens not declared
- **WHEN** a user tries to save a private ingredient without answering the allergen question
- **THEN** it is not saved

#### Scenario: Similar ingredient already exists
- **WHEN** a user starts adding a private ingredient whose name closely matches a catalog ingredient
- **THEN** the matching catalog ingredient is suggested before creation continues
