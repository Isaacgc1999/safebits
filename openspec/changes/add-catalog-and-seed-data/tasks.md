# Tasks

## 1. Food rules

- [ ] 1.1 Implement units and conversions in `packages/shared/src/domain/food`; verify unit tests including "2 cucharadas aceite = 30 ml"
- [ ] 1.2 Implement the derivation of allergens, traces, intolerance triggers and diets, plus `isAllowedFor(household)` with allergy and intolerance semantics; verify unit tests for the cheese, aged-cheese, nut-traces and lactose-traces scenarios and fast-check properties (monotonic derivation, no restricted item admitted)
- [ ] 1.3 Implement the food-safety rules; verify unit tests for the rice, fish, kidney-bean and raw-egg rules
- [ ] 1.4 Implement nutrition derivation and the health label; verify unit tests for the chicken 400→600 g, 22 g dinner, 2.1 g salt and unknown-nutrition scenarios

## 2. Catalog tables

- [ ] 2.1 Add the migrations for `chains`, `ingredients`, `products`, `ingredient_chain_unavailable`, `price_estimates`, `equipment`, `recipes` and immutable `recipe_versions` (trigger blocking UPDATE and DELETE), with the indexes of design decision 3; verify `supabase db reset`, a failing update on a recipe version, and `EXPLAIN` using the indexes for filtered queries
- [ ] 2.2 Add catalog RLS policies and the tables to the RLS harness; verify signed-in users read catalog rows and cannot write them
- [ ] 2.3 Implement the accent-insensitive ingredient search endpoint (`unaccent` + `pg_trgm`, catalog plus the caller's private rows); verify "limon" finds "Limón" and private rows of others never appear

## 3. Seed validator

- [ ] 3.1 Write the seed JSON schemas and `tools/seed/validate` covering every check of design decision 5, with a per-cell gap report; verify fixtures that break each rule fail with a precise message

## 4. Seed generation

- [ ] 4.1 Generate the equipment list (from the design) and about 400 ingredients with es/en names, categories, allergen tags, intolerance flags (rules in `SOURCES.md`), diet flags, units, average weights, long-life flags and nutrition with USDA FoodData Central source IDs; verify the validator passes for these files
- [ ] 4.2 Generate products for Mercadona, Lidl, Carrefour and Consum (generic descriptions, pack sizes, allergens and traces) and the unavailability marks; verify the chain coverage check passes
- [ ] 4.3 Generate dated reference price estimates for every product from general knowledge, with no website fetching; verify every product has exactly one current estimate
- [ ] 4.4 Generate the recipes in 50 batches (10 cuisines × 5 meal types), filling quotas first, until there are at least 2,000 bilingual recipes with structured steps, storage data, reheating, same-day steps and household measures; verify the validator passes every minimum and the health label on every recipe

## 5. Review and loading

- [ ] 5.1 Review a stratified sample of 100 recipes (2 per cuisine and meal type) plus every flagged recipe, fix the issues, and record them in `supabase/seed/REVIEW.md`; verify the file lists the reviewed IDs and resolutions
- [ ] 5.2 Implement the idempotent loader and add it to the deployment pipeline (staging, then production); verify `supabase db reset` plus the loader gives the expected counts and a second run changes nothing

## 6. Documentation

- [ ] 6.1 Write `supabase/seed/README.md` (one-time generation, no AI in the app, sources and licences, how to regenerate and validate); verify the documented commands run as written
