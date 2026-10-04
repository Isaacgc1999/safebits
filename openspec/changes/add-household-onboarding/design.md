# Design

## Context

- **From the design:**
  - **Onboarding:** Main (people), Onboarding2 (days and prep day), 3 (meals), 4 (cuisines), 5 (equipment), 6 (allergies, intolerances and consent), 7 (excluded ingredients), 8 (supermarkets), 9 (budget and high-protein switch), 10 (summary), plus DeskOnboarding as a dialog.
  - **Settings:** AppAjustes ("Tú") holds the preferences.
- **Base:** change 8 provides local-first repositories and sync; change 7 provides the food rules and catalog.

## Goals / Non-Goals

**Goals:**
- Onboarding works offline after the first sign-in and resumes where it stopped.
- Health data is encrypted at rest, and only its owner can ever read it.

**Non-Goals:**
- Plan generation and flagging UI (change 12); account settings (change 15).

## Decisions

### 1. Data

- **`profiles`:** household size (1–12), days, prep day, a meals-per-day matrix, cuisines, chains, maximum chains, budget in cents, `high_protein_only` (default true), theme, contrast, language and onboarding step.
- **`health_restrictions`:** `ciphertext bytea`, holding the allergens, intolerances and diet as a typed JSON payload encrypted with AES-256-GCM (key ID prefix, change 3 utilities). It exists only while health consent is recorded. Withdrawing consent deletes the row.
- **Other tables:** `excluded_foods(user, ingredient | category)`, `user_equipment(user, equipment)` and `kitchen_capacity(user, ovens 0–2, burners 0–6)`, defaulting to a 4-burner hob, 1 oven and a microwave.
- **RLS:** owner-only, and every table is in the harness.

### 2. Decryption boundary

- **On the server:** only the owner's session can trigger decryption, inside the household module, for sync pull, plan revalidation and export.
- **On the device:** health data lives in the per-user Dexie database and is wiped at sign-out (change 8). It is never placed in Cache Storage or logs.

### 3. Eligibility and measures

- **Equipment eligibility:** `packages/shared/src/domain/household/eligibility` checks a recipe's equipment groups (with alternatives) against the household's equipment and counts.
- **Household measures:** `measures` converts grams to household measures (units, spoons, glasses) for users without a scale, using per-ingredient conversion data from the catalog.

### 4. Onboarding UI

- **Engine:** a generic, signal-based `StepFlow<TStep>` drives the ten steps, with required steps 1, 2, 3, 8 and 9.
  - Mobile: `sb-sheet` with "Paso N de 10" and back and next.
  - Desktop: `sb-dialog` (DeskOnboarding).
  - Progress is saved after each step, so onboarding can resume.
- **Health consent (step 6):** a separate unticked checkbox; the selection controls stay disabled until consent is given. Declining shows the persistent warning.
- **Theme and contrast** move from device storage to the profile, which completes the change 4 sync requirement.

### 5. Constraints-changed event

When restrictions, exclusions, diet, cuisines, equipment or the health preference change, the household store emits a typed `ConstraintsChanged` event. The planner (change 12) subscribes to it to flag meals.

## Risks / Trade-offs

- **Health data is decrypted in server memory.**
  - → Only the owner's session can trigger it, it is never logged (redaction from change 3), and keys are rotated through key IDs.
- **Ten steps is long for a first visit.**
  - → Only 5 steps are required, and progress is saved after each one.
