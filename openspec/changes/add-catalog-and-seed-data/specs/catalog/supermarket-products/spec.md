# Spec Delta

## Purpose

Maps generic ingredients to purchasable products in each supported supermarket chain, with pack sizes and product-level allergen information, so the app can say what to buy and where.

## ADDED Requirements

### Requirement: Supported chains
Version 1 SHALL support Mercadona, Lidl, Carrefour and Consum. Prices and products are treated as national per chain, not per individual store.

#### Scenario: Chain list
- **WHEN** a user chooses supermarkets during onboarding
- **THEN** exactly Mercadona, Lidl, Carrefour and Consum are offered

### Requirement: Product records
Each product SHALL belong to one chain and link to one generic ingredient. It carries a generic Spanish and English description, a pack size with unit, and product-level allergens and "may contain" traces. Products MUST NOT include supermarket logos or product photos.

#### Scenario: Product shown
- **WHEN** a shopping list line for rice at Mercadona is displayed
- **THEN** it shows a description such as "Arroz redondo, paquete 1 kg" with no logo or product photo

### Requirement: Multiple pack sizes
An ingredient SHALL be able to have several products in the same chain with different pack sizes.

#### Scenario: Two pack sizes
- **WHEN** chicken thighs exist at Lidl in 500 g and 1 kg packs
- **THEN** both are available for pack selection in the shopping list

### Requirement: Chain coverage
Every generic ingredient used by a system recipe SHALL have at least one product in each supported chain, or be explicitly marked as not available in that chain.

#### Scenario: Ingredient unavailable in a chain
- **WHEN** an ingredient is marked not available at Consum and the user shops only at Consum
- **THEN** recipes needing it are not used in that user's plans

### Requirement: Product-level allergen safety
A product whose allergens or traces conflict with a household allergy SHALL never be suggested. If no safe product exists in the user's chains, recipes needing that ingredient MUST NOT be used.

#### Scenario: Traces conflict
- **WHEN** the only chocolate products in the user's chains are labelled "may contain nuts" and the household has a nut allergy
- **THEN** recipes with chocolate are not used in that user's plans
