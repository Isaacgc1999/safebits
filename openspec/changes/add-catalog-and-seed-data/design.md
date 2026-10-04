# Design

## Context

- **Owner's constraints:**
  - No AI at runtime. AI is used once, during development, to generate seed data that is committed to the repository.
  - No scraping of supermarket sites.
  - Recipes are high-protein and healthy by default.
- **From the design (`safebits-diseno`):**
  - Meal types: desayuno, tentempiés ("Snacks de proteína para llevar"), comida, merienda ("Algo ligero para la tarde") and cena.
  - Cuisines: española, mediterránea, italiana, griega, francesa, mexicana, americana, asiática, india and oriente medio.
  - Intolerances: lactosa, fructosa, histamina and sorbitol.
  - Equipment: ovens and burners as counters, plus freidora de aire, microondas, olla a presión, robot de cocina, batidora and báscula.

## Goals / Non-Goals

**Goals:**
- Food rules that are exact, property-tested, and shared by the browser and the server.
- A seed that passes every coverage minimum, so restrictive filters still produce varied plans.

**Non-Goals:**
- Browsing UI, prices logic, planner (later changes).

## Decisions

### 1. Food rules (`packages/shared/src/domain/food`)

- **Units:** g, ml and units, with conversions for spoons and "pizca" and an average weight per unit item. The display thresholds for kg and L come from the locale helpers of change 4.
- **Derivation:** a recipe's allergens are the union of its ingredients' allergen tags, and its traces come from products in the user's chains. Its intolerance triggers are the union of the ingredients' intolerance flags, and diet compatibility comes from the diet flags.
- **Filtering:** `isAllowedFor(household)` applies allergy semantics (traces excluded) or intolerance semantics (traces allowed).
- **Food safety:**
  - fridge at most 4 days, at most 2 with fish or seafood, at most 1 with cooked rice;
  - dried red kidney beans need soaking plus at least 10 minutes of boiling before any slow cooking;
  - no raw or undercooked egg in dishes stored for later.
- **Nutrition:** energy, protein, fat, saturated fat, carbohydrates, sugars, fibre and salt, summed per serving from quantities converted to grams.
- **Health label:**
  - protein provides at least 20% of energy;
  - protein per serving: at least 20 g for breakfast, 10 g for tentempié and merienda, 30 g for lunch and dinner;
  - saturated fat and free sugars each 10% of energy or less;
  - lunch and dinner: salt 1.5 g or less and fibre at least 6 g;
  - every ingredient's nutrition must be known.
- **Tests:** fast-check property tests check that derivation is monotonic (adding an ingredient never removes an allergen) and that filtering never admits a restricted item.

### 2. Intolerance flags

- **Lactose:** lactose above 0.1 g per 100 g, from USDA FoodData Central where the value exists; otherwise from dairy rules.
- **Fructose:** excess fructose, where fructose minus glucose is above 0.5 g per 100 g, from FoodData Central values; otherwise from curated fruit, vegetable and sweetener lists.
- **Sorbitol:** curated lists (stone fruits, apples, pears, dried fruit, sugar-free products) plus FoodData Central where present.
- **Histamine:** curated lists (aged cheeses, cured meats, fermented foods, canned or smoked fish, vinegar, spinach, tomato, aubergine, avocado).
- **Documentation and review:** every rule and list is documented in `supabase/seed/SOURCES.md` and reviewed. Flags are conservative: when unsure, the ingredient is flagged.

### 3. Data model

- **Ingredients:** `ingredients(id, name_es, name_en, category, allergens[], intolerances[], diet_flags[], base_unit, avg_unit_g, long_life, nutrition jsonb, nutrition_source, owner_id)`. `owner_id` is null for catalog rows and is used by private ingredients in change 11.
- **Supermarkets:** `chains`, `products(chain, ingredient, desc_es, desc_en, pack_qty, pack_unit, allergens[], traces[])`, `ingredient_chain_unavailable`, `price_estimates(product, cents, estimated_on)`, `equipment`.
- **Recipes:** `recipes(id, owner_id, visibility, published_version, current_version)` and `recipe_versions`. A version is immutable; it holds bilingual text, structured `data` (ingredient lines and steps), derived allergens, traces, intolerances, diets, nutrition and the health label, equipment groups, fridge days, freezable, the same-day step, meal types and cuisine.
- **Indexes:** GIN on the allergen, intolerance, diet and equipment arrays; B-tree on meal type, cuisine and `seq`; `pg_trgm` with `unaccent` for ingredient search.
- **RLS:** catalog rows are readable by everyone signed in; private rows by their owner (change 11). Every table is in the harness.

### 4. Seed generation (one-time, during development)

- **Coverage grid:** 10 cuisines × 5 meal types = 50 batches, with sizes from the minimums: about 40 breakfasts, 25 tentempiés, 55 lunches, 25 meriendas and 55 dinners per cuisine, for 2,000 or more in total.
- **Quotas first:** each batch first fills the allergen-free, intolerance-free, diet, combined-filter, cuisine and equipment quotas, then adds variety.
- **Recipe content:** structured steps `{ action, ingredientRefs, minutes, mode, resource, after }`, fridge days, freezable, reheating, the same-day step, and household measures for users without a scale (change 9).
- **Healthy by default:** lean proteins, legumes, eggs, dairy, tofu and tempeh, whole grains and vegetables, with oven, air-fryer, stew and steam methods, and controlled salt and free sugars.
- **Nutrition:** each ingredient is mapped to a USDA FoodData Central record (public domain, CC0), and the source ID is stored.
- **Products:** generic descriptions (e.g. "Arroz redondo, paquete 1 kg"), with no brand names, logos or photos.
- **Prices:** estimates come from the model's general knowledge of typical Spanish prices, dated and never fetched from supermarket sites.

### 5. Validation and review

- **`tools/seed/validate`** checks:
  - schemas and references;
  - derivations, the health label and food safety;
  - chain coverage;
  - every minimum of the recipe-catalog spec;
  - near-duplicates (ingredient-set Jaccard ≥ 0.9 plus title trigram ≥ 0.8).
- **Human review:** a stratified sample of 100 recipes (2 per cuisine and meal type) plus every flagged recipe. Fixes are recorded in `supabase/seed/REVIEW.md`.
- **Loader:** idempotent, and run by the deployment pipeline in staging, then production.

## Risks / Trade-offs

- **Intolerance data is incomplete in public sources.**
  - → Conservative curated lists, documented and reviewed, plus the label disclaimer from change 6.
- **Nutrition is approximate**, because ingredients are generic and cooking changes the values.
  - → It is labelled approximate, and the thresholds are met with a margin.
- **Generating and reviewing 2,000+ recipes is a large effort with a quality risk.**
  - → Batches, the validator gate, a stratified review and the report button (change 14).
- **Coverage across 5 meal types, 18 restrictions and 10 cuisines is demanding.**
  - → The validator reports gaps per grid cell, so batches can be topped up.
