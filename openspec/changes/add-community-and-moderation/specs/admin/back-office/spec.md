# Spec Delta

## Purpose

Gives authorised administrators the tools to moderate community content, maintain catalog data and reference prices, and watch the operational panels, with every action audited.

## ADDED Requirements

### Requirement: Admin role
The admin role SHALL be assignable only directly in the database by the operator, never through the app or its API. Admin screens and actions MUST be inaccessible to other users.

#### Scenario: Non-admin access
- **WHEN** a regular user requests an admin endpoint
- **THEN** the response is HTTP 404 and nothing is revealed

### Requirement: Recent authentication for admin actions
Admin actions SHALL require a session that signed in within the last 12 hours.

#### Scenario: Old admin session
- **WHEN** an admin whose sign-in was 13 hours ago tries to moderate
- **THEN** they are asked to sign in again first

### Requirement: Moderation queue
Admins SHALL have a queue of three kinds of item, oldest first:
- Recipes sent to review on publish.
- Recipes hidden after reports.
- Reported price estimates.

Each item shows the recipe version or product, the reasons and the reports.

#### Scenario: Queue contents
- **WHEN** an admin opens the queue
- **THEN** all pending items are listed with their reasons, oldest first

### Requirement: Moderation decisions
An admin SHALL be able to approve or reject a recipe, and remove a recipe that was hidden after reports. Rejection and removal require a reason from a list plus optional text. When approving a recipe with private ingredients, the admin MUST either promote each ingredient to the global catalog with verified allergens or reject the recipe.

#### Scenario: Approval with ingredient promotion
- **WHEN** an admin approves a recipe that uses a private ingredient and promotes the ingredient with verified allergens
- **THEN** the ingredient becomes global and the recipe is published

### Requirement: Catalog and price maintenance
Admins SHALL be able to edit generic ingredients, products and reference estimates (with their date). Every change MUST be logged. A change that alters a system recipe's allergens MUST create a new version of that recipe.

#### Scenario: Allergen correction
- **WHEN** an admin adds the soy allergen to an ingredient used by system recipes
- **THEN** those recipes get new versions with soy listed
- **AND** households with a soy allergy are no longer offered them

### Requirement: Admin audit log
Every admin action SHALL be logged with the admin, time, target and reason, and MUST be viewable by admins.

#### Scenario: Action logged
- **WHEN** an admin removes a recipe
- **THEN** the audit log records who, when, which recipe and why
