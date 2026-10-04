# Spec Delta

## Purpose

Lets users write their own recipes with the same structure and safety rules as system recipes, keep them in a personal cookbook, and change them safely through immutable versions.

## ADDED Requirements

### Requirement: Create own recipes
A user SHALL be able to create a recipe with the same structure and validation rules as system recipes. A new recipe MUST be private, appear in the user's cookbook, and be usable in their plans immediately.

#### Scenario: New private recipe
- **WHEN** a user saves a valid new recipe
- **THEN** it appears in their cookbook as private and can be placed in their plan

### Requirement: Ingredients from the picker only
Recipe ingredient lines SHALL only reference catalog ingredients or the user's own private ingredients. Free-text ingredient lines MUST NOT be accepted.

#### Scenario: Free-text ingredient
- **WHEN** a client submits an ingredient line without a valid ingredient reference
- **THEN** the recipe is rejected

### Requirement: Cookbook
Each user SHALL have a cookbook listing their own recipes, with visibility (private, public, under review) and their favourite recipes.

#### Scenario: Cookbook contents
- **WHEN** a user opens their cookbook
- **THEN** they see their own recipes with visibility labels and a favourites tab

### Requirement: Versions
Every saved edit to a recipe SHALL create a new version. Earlier versions MUST stay unchanged.

#### Scenario: Edit creates a version
- **WHEN** a user edits version 1 of their recipe and saves
- **THEN** version 2 is created and version 1 remains readable unchanged

### Requirement: Plans keep their version
A meal in a plan SHALL keep the recipe version it was planned with. When a newer version exists, the user MUST be told and may switch, but only if the new version passes their household's constraints.

#### Scenario: Author adds an allergen
- **WHEN** an author publishes version 2 adding peanuts, and another user with a peanut allergy has version 1 in their plan
- **THEN** that user's plan still uses version 1
- **AND** version 2 is not offered to them

### Requirement: Delete own recipe
A user SHALL be able to delete their own recipe. It disappears from their cookbook and the catalog and can no longer be planned. Versions already used in existing plans MUST remain readable so those plans keep working.

#### Scenario: Deleted recipe still in a plan
- **WHEN** a user deletes a recipe that is in this week's plan of another user
- **THEN** that plan still shows the planned version
- **AND** the recipe can no longer be added to new plans

### Requirement: Recipe language
A user recipe SHALL be stored in the language it was written in. The author may add a translation in the other supported language.

#### Scenario: No translation provided
- **WHEN** an English-language user views a Spanish-only user recipe
- **THEN** it is shown in Spanish with a "Solo disponible en español" label
