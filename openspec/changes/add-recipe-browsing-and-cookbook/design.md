# Design

## Context

- **From earlier changes:**
  - Change 7: the catalog and food rules.
  - Change 8: on-device catalog summaries and details.
  - Change 9: household constraints and equipment eligibility.
  - Change 10: price resolution.
- **Designs:** AppRecetas, DeskRecetas, AppReceta and AppEditor, plus the two-column desktop editor layout derived in change 4.

## Goals / Non-Goals

**Goals:**
- Filtering 2,000+ recipes on a mid-range phone feels instant and works offline.
- An author's edit can never put an allergen into a plan that already uses the recipe.

**Non-Goals:**
- Publishing, reporting and moderation (change 14).

## Decisions

### 1. Filtering on the device

- **Index:** a `RecipeIndex` built from the catalog summaries, holding bitsets per allergen, intolerance, diet, equipment group, meal type, cuisine and health label, plus a normalised (accent-free, lowercase) title index.
- **Filtering:** bitset intersection followed by a text match. The household's compatibility mask is applied unless "mostrar todas" is on, in which case incompatible results carry a rose warning tag with an icon and text and cannot be added to a plan.
- **Shared code:** the index lives in `packages/shared/src/domain/recipes` and is reused by the planner (change 12).
- **Rendering:** results use `sb-list<T>` with CDK virtual scrolling, and a skeleton is shown while the summaries are still downloading.

### 2. Detail

- **Scaling:** quantities are scaled to the household size, with household measures added for users without a scale.
- **Cost per serving:** uses `resolvePrice` in the user's chains with the cheapest safe product.
- **Notices:** the allergy notice and "Precios orientativos" are shown.
- **Offline:** if a recipe's steps have not downloaded yet, the detail requests them first from the background downloader.

### 3. Cookbook and versions

- **Editor:** a generic, signal-based form model with typed sections (ingredients, steps, storage, equipment).
  - The ingredient picker only allows catalog ingredients and the user's private ingredients.
  - Allergens, nutrition and the label are derived live with the change 7 food rules.
- **Versions:** every save inserts a new `recipe_versions` row, which is immutable, and moves `recipes.current_version`.
  - Plan slots (change 12) store the version they were planned with.
  - Deleting a recipe soft-deletes it; versions referenced by plans stay readable.
- **Translation:** each version stores `lang` and an optional translation.

### 4. Private ingredients

- **Storage:** the `ingredients` table with `owner_id` set; RLS makes them visible to the owner only.
- **Creation:** the allergen question is mandatory ("none of the listed" is an explicit answer), nutrition is optional, and a trigram match suggests a similar catalog ingredient before creation.

## Risks / Trade-offs

- **The bitset index uses memory on low-end phones.**
  - → About 2,000 recipes × roughly 40 flags as packed bitsets is well under a megabyte.
- **The editor is complex on mobile.**
  - → Sections follow the AppEditor design, with the two-column desktop layout derived in change 4.
