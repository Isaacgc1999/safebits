# Spec Delta

## Purpose

Provides the shared catalog of generic ingredients, with allergens, intolerance flags, diet flags, units and nutrition, that recipes, products, prices and filters are built on.

## ADDED Requirements

### Requirement: Generic ingredient catalog
Each generic ingredient SHALL have a Spanish and English name and a category, and carry:
- allergen tags for the 14 EU allergens;
- intolerance flags for lactose, fructose, histamine and sorbitol;
- diet flags (meat, fish or seafood, dairy, egg, other animal origin);
- a base unit (g, ml or unit), an average weight for unit-based items, and a long-life flag.

#### Scenario: Ingredient data
- **WHEN** the ingredient "cebolla" is viewed
- **THEN** it shows category "Verduras", no allergens, base unit "unit" and an average weight of 150 g

### Requirement: Ingredient nutrition
Every catalog ingredient SHALL have nutrition values per 100 g (or 100 ml): energy, protein, fat, saturated fat, carbohydrates, sugars, fibre and salt, taken from a public-domain food composition source, together with the source reference.

#### Scenario: Catalog ingredient without nutrition
- **WHEN** seed validation finds a catalog ingredient with no protein value
- **THEN** validation fails and the data is not loaded

### Requirement: Ingredient picker search
The ingredient picker SHALL search ingredients by name in the current language, ignoring accents and capitalisation. Results include global ingredients and the user's own private ingredients.

#### Scenario: Accent-insensitive search
- **WHEN** a user types "limon"
- **THEN** "Limón" appears in the results
