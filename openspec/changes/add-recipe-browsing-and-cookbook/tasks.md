# Tasks

## 1. Browsing

- [ ] 1.1 Implement the `RecipeIndex` (bitsets, accent-free title index, compatibility mask) in `packages/shared/src/domain/recipes`; verify unit tests and a benchmark filtering 2,000 recipes in under 50 ms on a mid-range profile
- [ ] 1.2 Build the recipe list (AppRecetas, DeskRecetas) with tabs, search, filters including the health label, incompatible recipes hidden with the "mostrar todas" warning, virtual scrolling, and skeleton, empty and error states; verify Playwright for the gluten-free "pasta" scenario and a long-task check while scrolling
- [ ] 1.3 Build the recipe detail (AppReceta): scaled quantities, household measures, allergens and triggers with the notice, nutrition per serving, label, equipment, storage, cost per serving with price sources, steps, offline detail fetch; verify the 4-to-2 servings scaling test, the nutrition display and visual comparison with the design
- [ ] 1.4 Implement favourites and "No sugerir más" with sync; verify hidden recipes are excluded from candidate lists

## 2. Cookbook

- [ ] 2.1 Add the migrations for `favourites` and `hidden_recipes` and the recipe-ownership RLS policies (own private recipes, harness entries); verify RLS tests that another user's private recipes never appear
- [ ] 2.2 Build the recipe editor (AppEditor; two-column desktop layout derived in change 4) with picker-only ingredients, structured steps with resources, live derived allergens, nutrition and label, validation through the food rules, and an optional translation; verify unit tests for the form model and a Playwright test that creates a recipe offline and syncs it
- [ ] 2.3 Implement immutable versions on every save and soft deletion that keeps pinned versions readable; verify integration tests for versioning and for deletion while pinned in another user's plan
- [ ] 2.4 Implement private ingredients (mandatory allergen declaration, optional nutrition, similar-name suggestion, owner-only visibility); verify integration and RLS tests for the privacy and incomplete-nutrition scenarios
- [ ] 2.5 Build the cookbook view ("Mías" tab with visibility labels and favourites) with its empty state; verify Playwright, axe and visual comparison with the design
