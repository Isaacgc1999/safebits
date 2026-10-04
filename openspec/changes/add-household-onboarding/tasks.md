# Tasks

## 1. Data and sync

- [ ] 1.1 Add the migrations for `profiles`, `health_restrictions`, `excluded_foods`, `user_equipment` and `kitchen_capacity` with owner-only RLS, constraints (household size 1–12, budget 1000–100000 cents, ovens 0–2, burners 0–6, `high_protein_only` default true) and harness entries; verify the migrations, the constraint tests and the RLS tests
- [ ] 1.2 Register sync handlers for every household entity, with validation; verify integration tests including invalid sizes (0, 13, 2.5), a 5 € budget and the health preference defaulting to on
- [ ] 1.3 Implement encrypted health restrictions gated by recorded consent, with withdrawal deleting them; verify the database holds only ciphertext, withdrawal removes the data, and no health value appears in logs

## 2. Domain logic

- [ ] 2.1 Implement equipment eligibility (groups with alternatives, oven and burner counts) and household measures for users without a scale; verify unit tests for the alternative-equipment, missing-equipment and "200 g (≈ 1 vaso)" scenarios
- [ ] 2.2 Implement the typed `ConstraintsChanged` event in the household store; verify a unit test that each relevant change emits it

## 3. Onboarding and settings UI

- [ ] 3.1 Build the generic `StepFlow<TStep>` and the ten onboarding steps from the designs (sheet on mobile, dialog on desktop), with required-step gating and resume; verify Playwright for completion, resume after reload, and plan generation blocked until the budget is set
- [ ] 3.2 Build step 6 with the explicit health consent, the persistent warning when declined, and the controls disabled until consent is given; verify Playwright for consent, decline and later withdrawal
- [ ] 3.3 Build the "Tú" preferences screen (AppAjustes) for later edits, including the health preference, equipment, theme and contrast saved to the profile; verify changes persist offline and sync to a second browser context
- [ ] 3.4 Run axe and visual comparison against the onboarding and AppAjustes designs; verify zero violations and screenshots within tolerance
