# Proposal

## Why

Everything the user sees depends on one trustworthy catalog: plans, lists, prices and filters. It needs:
- generic ingredients with nutrition, allergens and intolerance flags;
- products in Mercadona, Lidl, Carrefour and Consum;
- at least 2,000 high-protein, healthy recipes in both languages, varied enough that even a household avoiding several allergens and intolerances, cooking one cuisine without an oven, still gets a varied week.

The food rules that derive allergens, nutrition and food safety must be exact, because they protect people with allergies.

## What Changes

- **Food rules** in `packages/shared/src/domain`:
  - units and conversions;
  - derived allergens, traces, intolerance triggers (lactose, fructose, histamine, sorbitol) and diets;
  - allergy versus intolerance semantics;
  - food-safety rules;
  - derived nutrition;
  - the "Alta en proteína y saludable" label.
- **Catalog tables:** chains, ingredients (nutrition with source, allergen and intolerance flags), products with pack sizes and traces, equipment, recipes and immutable recipe versions with derived fields and indexes.
- **Seed validator:** schemas, references, derivations, the health label, food safety, chain coverage, every coverage minimum and near-duplicates.
- **One-time AI-generated seed,** created during development and committed:
  - the equipment list from the design;
  - about 400 ingredients, with nutrition mapped from USDA FoodData Central (public domain) and documented intolerance rules;
  - products for 4 chains;
  - dated reference price estimates;
  - 2,000+ bilingual recipes across 5 meal types and 10 cuisines.
- **Human review** of a stratified sample of 100 recipes plus every flagged one, and an idempotent loader.
- **Ingredient search** (accent-insensitive) for pickers.

## Capabilities

### New Capabilities

- `catalog/food-rules`: units, derived allergens, intolerances and diets, allergy versus intolerance, food safety, derived nutrition, the health label.
- `catalog/ingredients`: the generic ingredient catalog, nutrition and picker search.
- `catalog/supermarket-products`: the supported chains, product records, pack sizes, chain coverage and product-level allergen safety.
- `recipes/recipe-catalog`: system recipes, coverage by meal type, allergen, intolerance, diet, cuisine, equipment and storage, the health label on every system recipe, recipe structure and catalog visibility.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–3.
- **Code:** `packages/shared/src/domain/`, `safebits_back/src/modules/catalog/`, `supabase/migrations/` (catalog tables), `supabase/seed/` (JSON, `SOURCES.md`, `REVIEW.md`), `tools/seed/`.
- **Later changes:**
  - Price estimates are data for `add-pricing`.
  - Catalog delivery to devices is in `add-offline-sync`.
  - Browsing is in `add-recipe-browsing-and-cookbook`.
