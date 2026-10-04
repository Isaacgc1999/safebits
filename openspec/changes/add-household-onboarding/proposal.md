# Proposal

## Why

Every plan depends on knowing the household: how many people, which days and meals, cuisines, equipment, allergies and intolerances, excluded foods, supermarkets, budget and prep day. The design defines a ten-step onboarding sheet for this, plus the "Tú" settings to edit it later. Allergy data is health data, so it needs explicit consent and encryption.

## What Changes

- **Profile and household data:**
  - household size;
  - days, the prep day and meals per day (desayuno, tentempiés, comida, merienda, cena);
  - cuisines (10, or "Me gustan todas");
  - supermarkets and the maximum per week;
  - weekly budget;
  - the "Solo recetas altas en proteína y saludables" preference, on by default;
  - theme and contrast preferences (stored on the account, completing change 4).
- **Dietary restrictions:** the 14 EU allergens, intolerances to lactose, fructose, histamine and sorbitol, and a diet. These are encrypted with AES-256-GCM and gated by a separate, explicit health-data consent that can be withdrawn.
- **Excluded foods:** ingredients or whole categories.
- **Kitchen equipment:** oven and burner counters, plus air fryer, microwave, pressure cooker, food robot, blender and scale. Recipe eligibility follows equipment groups with alternatives, and quantities appear in household measures for users without a scale.
- **Onboarding:** the ten steps from the design (sheet on mobile, dialog on desktop) with resume and required-step gating, the "Tú" preferences screen, and sync of every entity through the change 8 registry.
- **A "constraints changed" event** that the planner (change 12) uses to flag affected meals.

## Capabilities

### New Capabilities

- `household/preferences`: onboarding, household size, dietary restrictions, health-data consent, excluded foods, cuisines, days and meals, supermarkets, the health preference, budget, prep day and later edits.
- `household/kitchen-equipment`: the equipment page, oven and burner counts, defaults, recipe eligibility, equipment changes and the kitchen scale.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–8.
- **Code:**
  - `safebits_back/src/modules/household/`;
  - `packages/shared/src/domain/household/` (eligibility, household measures);
  - `safebits_front/src/app/features/onboarding/` and `features/tu/`;
  - migrations for `profiles`, `health_restrictions`, `excluded_foods`, `user_equipment` and `kitchen_capacity`.
- **Later verification:** flagging planned meals after a preference or equipment change is verified in `add-weekly-planner-and-prep`.
