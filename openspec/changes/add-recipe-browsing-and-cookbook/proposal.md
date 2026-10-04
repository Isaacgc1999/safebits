# Proposal

## Why

Users need to find recipes that are safe for their household and see everything needed to cook and buy them. They also want to write their own recipes. A cookbook with versioned recipes and private ingredients lets them do that without ever weakening the allergen guarantees of plans that already use those recipes.

## What Changes

- **Recipe list** (AppRecetas, DeskRecetas):
  - tabs: Catálogo, Mías, Comunidad;
  - accent-insensitive search;
  - filters for meal type, cuisine, time, diet, owned equipment and the "Alta en proteína y saludable" label;
  - incompatible recipes hidden by default, with a "mostrar todas" warning;
  - virtual scrolling for 2,000+ recipes.
- **Recipe detail** (AppReceta): quantities scaled to the household, household measures when there is no scale, allergens and intolerance triggers with the label notice, nutrition per serving, the health label, equipment, storage, cost per serving with price sources, and the steps.
- **Favourites and "No sugerir más".**
- **Cookbook:**
  - The recipe editor (AppEditor; two-column desktop layout derived in change 4) uses picker-only ingredients and structured steps with resources, with live allergens, nutrition and the health label.
  - Every save creates an immutable version, and plans keep their pinned version.
  - Deleting a recipe keeps its pinned versions readable.
  - Authors can add an optional translation.
- **Private ingredients** with a mandatory allergen declaration, optional nutrition, a similar-name suggestion, and visibility for the owner only.

## Capabilities

### New Capabilities

- `recipes/recipe-browsing`: browse, search and filter; recipe detail; favourites and hidden recipes.
- `recipes/user-cookbook`: create own recipes, picker-only ingredients, the cookbook, versions, plans keeping their version, deletion, recipe language, private ingredients and their nutrition.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–10.
- **Code:** `safebits_front/src/app/features/recipes/` and `features/cookbook/`, `safebits_back/src/modules/recipes/`, and migrations for `favourites` and `hidden_recipes` (private ingredients use `ingredients.owner_id` from change 7).
- **Later changes:** publishing and reporting arrive in change 14. The "Comunidad" tab shows public recipes once they exist.
