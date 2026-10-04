# Spec Delta

## Purpose

Lets users share their recipes with everyone through an explicit publish action, with attribution by alias, automatic checks, a report mechanism and moderation decisions that explain their reasons.

## ADDED Requirements

### Requirement: Publish button
Own recipes SHALL be private by default and published only when the author presses "Publicar". The first publication requires accepting the recipe licence terms. The author MUST be able to unpublish at any time.

#### Scenario: Publishing a recipe
- **WHEN** an author presses "Publicar" on a private recipe that passes all checks
- **THEN** it becomes visible to all users in the catalog

#### Scenario: Unpublishing
- **WHEN** an author unpublishes a recipe
- **THEN** it disappears from other users' catalog, while plans that already contain it keep their planned version

### Requirement: Automatic checks on publish
On publish the system SHALL check:
- Required fields and food-safety rules.
- Text length limits.
- No links, emails or phone numbers.
- The offensive-words list (Spanish and English).
- Private ingredients.
- Near-duplicates of existing recipes.

Hard failures are returned to the author to fix. Recipes with private ingredients, blocklist hits or near-duplicates go to admin review.

#### Scenario: Clean recipe
- **WHEN** a recipe passes every check
- **THEN** it is published immediately

#### Scenario: Recipe with a link
- **WHEN** a recipe step contains a URL
- **THEN** publication is refused with a message to remove it

#### Scenario: Private ingredient
- **WHEN** a recipe uses one of the author's private ingredients
- **THEN** it is marked "En revisión" and sent to the admin queue instead of being published

### Requirement: Author attribution
Public user recipes SHALL show the title followed by "por @alias". System recipes and recipes transferred from deleted accounts MUST show "Sistema".

#### Scenario: Attribution shown
- **WHEN** a user views a recipe published by alias "ana.batch"
- **THEN** the title is followed by "por @ana.batch"

### Requirement: Republishing after edits
Editing a published recipe SHALL put the new version through the same checks. The previous public version MUST stay visible until the new one passes.

#### Scenario: Edited version under review
- **WHEN** an author's new version is sent to admin review
- **THEN** other users continue to see the previous public version

### Requirement: Reporting
Any signed-in user SHALL be able to report a public recipe once. They choose a reason (inapropiado, peligroso para la salud, copia o derechos de autor, spam, otro) and may add optional text. The reporter MUST receive confirmation.

#### Scenario: Report submitted
- **WHEN** a user reports a recipe as dangerous with a comment
- **THEN** the report is stored and the user sees a confirmation

#### Scenario: Duplicate report
- **WHEN** the same user tries to report the same recipe again
- **THEN** the second report is refused

### Requirement: Automatic hiding after reports
A public recipe reported by 3 or more distinct users SHALL be hidden from the catalog until an admin decides. Plans that already contain it MUST be unaffected.

#### Scenario: Third report
- **WHEN** a third distinct user reports a recipe
- **THEN** it is hidden from the catalog and placed in the admin queue

### Requirement: Moderation decisions with reasons
When an admin removes or rejects a recipe, the author SHALL receive an in-app notification with the reason and how to contest it. Reporters MUST be notified of the outcome. A removed recipe MUST remain private in the author's cookbook.

#### Scenario: Recipe removed
- **WHEN** an admin removes a reported recipe citing copyright
- **THEN** the author is notified with that reason and the appeal contact
- **AND** each reporter is told the recipe was removed
- **AND** the recipe stays private in the author's cookbook
