# Tasks

> The edge Worker, the domain, Resend email and the keep-alive are covered by the change `setup-domain-email-and-keepalive`. Every task here must also meet the engineering standards in design decision 18. Each group keeps the 90% coverage threshold green.

## 1. Workspace, tooling and quality gates

- [ ] 1.1 Create root `package.json` with npm workspaces (`safeBAItes_front`, `safeBAItes_back`, `packages/*`, plus `safeBAItes_edge` once the other change creates it), `.nvmrc` = 24, `engines.node` ">=24 <25 || >=26" and `engine-strict`; verify `npm install` at the root succeeds and `npm ls --workspaces` lists all workspaces
- [ ] 1.2 Generate a new Angular 22 application in `safeBAItes_front` with Angular CLI 22 (standalone, zoneless, routing, strict, Vitest unit-test builder, no SSR server). The deleted v21 scaffold is not reused. Strip every CLI-generated comment; verify `npx ng version` reports 22.x, `npm run build -w safeBAItes_front` passes and the comment check passes
- [ ] 1.3 Configure `outputMode: "static"` with build-time prerendering of the public routes (landing, legal pages, sign-in), with no server bundle; verify the build output contains only browser files and prerendered HTML for those routes
- [ ] 1.4 Create `packages/shared` (TypeScript, Vitest, exported entry point) with the folders `constants`, `enums`, `types`, `interfaces`, `models`, `schemas`, `mappers`, `utils`, `domain`; verify a sample test passes and the front and back both compile an import from it
- [ ] 1.5 Create `safeBAItes_back` (Node 24, TypeScript, Fastify, no static file serving) with `modules/` and the `shared/<kind>/` folders from design decision 18, and `GET /api/health`; verify `curl /api/health` returns 200
- [ ] 1.6 Add a zod-validated environment config to the back (fails fast on missing or invalid secrets) and `.env.example` documenting every variable; verify startup exits with a clear error when a required variable is missing
- [ ] 1.7 Add a strict `tsconfig.base.json` with every flag from design decision 18, extended by all workspaces, plus Angular `strictTemplates`, `strictInjectionParameters` and `strictInputAccessModifiers`; verify type-checking passes everywhere and a fixture with an implicit `any` or an unchecked index access fails
- [ ] 1.8 Configure ESLint (typescript-eslint `strict-type-checked` and `stylistic-type-checked`, angular-eslint, the decision 18 rules and limits, `noInlineConfig`, bans on `innerHTML` and `bypassSecurityTrust*`), stylelint and Prettier. Write the local rules `local/no-comments` (TypeScript, JavaScript and templates) and `local/declarations-in-shared` in `tools/lint` with their own tests, the stylelint no-comment plugin, and a script rejecting comments in SQL and JSON files. Verify each rule fails on a fixture and the codebase passes with `--max-warnings 0`
- [ ] 1.9 Configure dependency-cruiser with the layer rules from design decision 18 (features → shared/core only, shared never → features, no cycles, no cross-module internals in the back); verify a violating fixture fails and the codebase passes
- [ ] 1.10 Set up local services: `supabase init` and `supabase start` (Postgres, Auth, Mailpit), plus a local Redis container; verify the back connects to both from `.env.local`
- [ ] 1.11 Configure Vitest v8 coverage thresholds of 90% (lines, branches, functions, statements) in every workspace; verify a run below the threshold fails
- [ ] 1.12 Add the GitHub Actions CI workflow:
  - `npm ci`, lint with zero warnings, type-check, and unit and integration tests with coverage.
  - Build, comment checks and dependency-cruiser.
  - `npm audit` reporting 0 vulnerabilities of any severity, plus a check that no `overrides`/`resolutions` key and no `legacy-peer-deps`/`force` setting exists.
  - CodeQL, and a SonarQube Cloud analysis with the decision 18 quality gate.
  - A Renovate configuration.

  Verify a run is fully green and the SonarQube gate passes
- [ ] 1.13 Write `README.md` (architecture overview, standards summary, prerequisites, local setup, workspace scripts); verify a fresh clone reaches a running `/api/health` by following it

## 2. Database schema and row-level security

- [ ] 2.1 Create the base migration: `private` schema, extensions (`citext`, `pg_trgm`, `pg_cron`), the global change sequence and triggers setting `seq` and `updated_at`, and the soft-delete convention; verify `supabase db reset` applies cleanly
- [ ] 2.2 Add reference tables (`chains`, `ingredients` with nullable `owner_id` and nutrition per 100 g with source ID, `ingredient_chain_unavailable`, `products`, `price_estimates`, `equipment`); verify the migration applies and a SQL test inserts and reads sample rows
- [ ] 2.3 Add recipe tables (`recipes`, immutable `recipe_versions` with derived allergens, diets, nutrition per serving and health label, and a trigger blocking UPDATE and DELETE; `favourites`, `hidden_recipes`) with GIN and B-tree indexes per design decision 10; verify a SQL test shows updating a recipe version fails and `EXPLAIN` uses the indexes for filtered catalog queries
- [ ] 2.4 Add household tables (`profiles` with unique `citext` alias, theme and `high_protein_only` default true; `health_restrictions` as encrypted `bytea`; `excluded_foods`, `user_equipment`, `kitchen_capacity`, `consents`); verify the migration and constraint tests (household size 1–12, budget 1000–100000 cents, health preference default)
- [ ] 2.5 Add plan, shopping and receipt tables (`plans`, `plan_slots` with pinned `recipe_version`, `prep_progress`, `shopping_list_items`, `extra_items`, `pantry_items`, `tickets`, `ticket_lines`); verify the migration and FK tests
- [ ] 2.6 Add price tables (`user_prices`, `community_prices`) and the SQL function that recalculates the median over the latest price per user in the last 90 days, with at least 5 users; verify SQL tests for the 4-user, 5-user and repeated-entries scenarios
- [ ] 2.7 Add community and admin tables (`reports` unique per reporter and recipe, `moderation_items`, `moderation_decisions`, `notifications`) and private tables (`private.sessions`, `private.processed_mutations`, `private.audit_log`, `private.admins`); verify the migration and that `private` is not exposed through the Supabase REST API
- [ ] 2.8 Enable RLS with deny-by-default on every public table, plus owner and catalog-read policies using `auth.uid()`; verify an automated RLS test suite proves user A cannot read or write user B's rows in every user table and can read only global, public or own catalog rows
- [ ] 2.9 Implement the back's Kysely data layer (pooler in transaction mode with unnamed statements; per-request transaction with `SET LOCAL ROLE authenticated` and claims; a separate privileged connection restricted to named modules) and generate DB types; verify an integration test shows RLS applies through the data layer
- [ ] 2.10 Schedule Supabase Cron jobs: delete accounts not activated within 7 days, purge expired sessions, purge `processed_mutations` older than 30 days; verify SQL tests of the job functions against fixture rows

## 3. Shared domain logic (`packages/shared`)

- [ ] 3.1 Define strict zod schemas, models and mappers for every entity, sync mutation and API payload (unknown keys rejected, no server-controlled fields in inputs). Everything lives in `packages/shared/src/<kind>/`; verify tests that unknown fields and forged `author`/`isSystem` fields are rejected
- [ ] 3.2 Implement units and conversions (g/ml/unit, cucharada, cucharadita, pizca, average unit weight, kg/L display thresholds); verify unit tests including "2 cucharadas aceite = 30 ml" and "1500 g shown as 1,5 kg"
- [ ] 3.3 Implement allergen, trace and diet derivation for ingredients, recipes and products, with allergy (traces excluded) and intolerance (traces allowed) semantics; verify unit tests for the nut-traces, lactose-traces, vegan and cheese-adds-milk scenarios
- [ ] 3.4 Implement the food-safety rules (fridge limits 4/2/1 days, kidney-bean boiling, no raw egg in stored dishes); verify unit tests for every rule scenario
- [ ] 3.5 Implement equipment eligibility (required groups with alternatives, oven and burner counts); verify unit tests for the alternative-equipment and missing-equipment scenarios
- [ ] 3.6 Implement price resolution (own, community, estimate, with source label) and range validation `[ref/2.5, ref×2.5]` (> 0, at most 2 decimals); verify unit tests for 5,00 accepted, 5,01 rejected, 0,80 accepted, 0,01 rejected
- [ ] 3.7 Implement locale helpers (EUR formatting in es/en, dd/mm/yyyy, Madrid day and week boundaries starting Monday); verify unit tests including "4,20 €" and a DST-boundary case
- [ ] 3.8 Implement nutrition derivation per serving and the "Alta en proteína y saludable" label rules: protein ≥ 20% of energy plus the per-meal minimums; saturated fat and free sugars ≤ 10% of energy; salt ≤ 1.5 g and fibre ≥ 6 g for lunches and dinners; incomplete nutrition never labelled. Verify unit tests for the 400→600 g chicken, 22 g dinner, 2.1 g salt and incomplete-nutrition scenarios

## 4. One-time seed catalog (AI-generated during development)

- [ ] 4.1 Write seed JSON schemas and `tools/seed/validate`. It checks:
  - schemas and references;
  - derived allergens, diets and nutrition, and the health thresholds;
  - food-safety rules and chain coverage per ingredient;
  - every coverage minimum from the recipe-catalog spec (meal type, allergen-free shares, diets, combined filters, cuisine by meal type, equipment, storage);
  - near-duplicates (Jaccard ≥ 0.9 plus title trigram ≥ 0.8).

  Verify it fails on fixture files that break each rule
- [ ] 4.2 Generate the equipment list and about 400 generic ingredients (es/en names, category, allergens, diet flags, base unit, average weight, long-life flag) with nutrition per 100 g mapped from USDA FoodData Central records (source IDs stored; the CC0 notice in `supabase/seed/SOURCES.md`); verify `tools/seed/validate` passes for these files
- [ ] 4.3 Generate products for Mercadona, Lidl, Carrefour and Consum (generic descriptions, pack sizes, allergens and traces, no brand names) and the unavailability marks; verify the chain coverage check passes
- [ ] 4.4 Generate dated reference price estimates (cents) for every product from general knowledge, with no website fetching; verify every product has exactly one current estimate
- [ ] 4.5 Generate at least 2,000 high-protein and healthy bilingual recipes in 40 batches (10 cuisines × 4 meal types, about 50 each), filling the allergen-free, diet and combined-filter quotas first in each batch. Each recipe has structured steps (action, ingredients, minutes, active/passive, resource, dependencies), fridge days, freezable, reheating and same-day steps. Verify `tools/seed/validate` passes, including every coverage minimum and health threshold
- [ ] 4.6 Human-review a stratified sample of 100 recipes (at least 2 per cuisine and meal type) plus every recipe flagged by validation, fix the issues found, and record them in `supabase/seed/REVIEW.md`; verify the file lists the reviewed IDs and resolutions
- [ ] 4.7 Implement the idempotent seed loader into the database; verify `supabase db reset` plus the loader produces the expected counts and that running it twice changes nothing
- [ ] 4.8 Document the seed policy (one-time generation, no AI in the app, nutrition source, how to regenerate and validate) in `supabase/seed/README.md`; verify the documented commands run as written

## 5. Security and abuse-protection foundation (backend)

- [ ] 5.1 Configure `@fastify/helmet` for API responses (CSP with `default-src 'none'` for JSON, HSTS, nosniff, referrer and permissions policies). Headers for static files are set at the edge by the other change. Verify an integration test asserts every header on API responses
- [ ] 5.2 Add a global error handler (generic message plus correlation ID) and pino redaction (password, code, token, cookie, authorization, restrictions); verify tests show no stack trace in responses and no secrets in captured logs
- [ ] 5.3 Wire a zod type provider so every route validates strictly; verify a test showing an unknown field returns 400 without internals
- [ ] 5.4 Implement AES-256-GCM encryption with versioned keys and HMAC-SHA-256 helpers; verify round-trip, wrong-key and tamper-detection unit tests
- [ ] 5.5 Implement the Redis client (TLS) and atomic sliding-window limiter primitives, with fail-closed for auth routes and an in-memory fallback for others; verify tests against local Redis, including Redis-down behaviour
- [ ] 5.6 Issue the `__Host-sb-did` device cookie (random 128-bit, HttpOnly, Secure, SameSite=Lax, 1 year); verify a test asserts its attributes and that it is set on first contact
- [ ] 5.7 Implement per-route limits from one config file (per account and per IP) returning 429 with Retry-After, plus escalating temporary blocks (15 min, 1 h, 24 h within 24 h); verify tests with a fake clock for limits, escalation and block expiry
- [ ] 5.8 Implement server-side Turnstile verification; verify tests using Cloudflare's always-pass and always-fail test keys
- [ ] 5.9 Implement security audit logging into `private.audit_log` (time, account, IP, device ID, event); verify a test that a sign-in failure writes an audit row without secrets
- [ ] 5.10 Document the security architecture (BFF, cookies, CSRF, CSP, limits, encryption, key rotation) in `docs/security.md`; verify every spec requirement in the two security specs is mapped to a section

## 6. Authentication backend

- [ ] 6.1 Spike: measure Supabase Auth from the server (`admin.createUser` unconfirmed, `signInWithPassword` responses for unconfirmed users and wrong passwords, rate limits from a single IP, session revocation) and record the findings and the required dashboard settings in `docs/auth-spike.md`; verify the document exists and the settings are applied to local and cloud config
- [ ] 6.2 Implement sessions in `private.sessions` (hashed 256-bit ID, `__Host-sb-sid` cookie, 30-day idle, 90-day absolute, rotation, revocation); verify tests for expiry, rotation on sign-in, and that a revoked cookie is unauthenticated
- [ ] 6.3 Implement the session-bound CSRF token (`GET /api/auth/csrf`, `X-CSRF-Token` header check on every state-changing route); verify tests that requests without, or with a foreign, token are rejected
- [ ] 6.4 Implement the password policy (10–128 chars, not equal to email, local common list, Pwned Passwords k-anonymity check); verify unit tests with a mocked range API
- [ ] 6.5 Implement the `Mailer` interface and its `SmtpMailer` adapter for local development and tests, with es/en templates (activation, reset, email change, email-changed notice). The production Resend adapter comes in the other change. Verify tests deliver to the local Mailpit in both languages
- [ ] 6.6 Implement the code service in Redis (6-digit `randomInt`, HMAC storage, `EX 600`, overwrite on reissue, `SET NX` 60 s cooldown, 5-attempt invalidation, hourly account and IP limits, constant-time comparison); verify tests for every one-time-code scenario in the authentication and abuse-protection specs, including TTL expiry
- [ ] 6.7 Implement registration (CAPTCHA, consents, password policy, limits, identical response for existing emails); verify integration tests for success, duplicate email and missing consent
- [ ] 6.8 Implement activation and resend; verify integration tests that an inactive account cannot sign in and that activation enables it
- [ ] 6.9 Implement email/password sign-in (generic errors, CAPTCHA after 3 failures, 15-minute cooldown after 5, inactive account routed to activation); verify integration tests for every wrong-password scenario
- [ ] 6.10 Implement password reset (generic request response, code verification, new password, end other sessions, sign in on the current device); verify integration tests for known and unknown emails
- [ ] 6.11 Implement Google sign-in (nonce endpoint, ID-token endpoint via `signInWithIdToken`, consent capture on first use, linking by verified email, server-side code + PKCE + state fallback with callback on our origin); verify integration tests with mocked Google responses
- [ ] 6.12 Implement sign-out (server-side revocation); verify a test that the old cookie is rejected afterwards

## 7. Design system and frontend foundation

- [ ] 7.1 Brand pipeline:
  - Copy the brand sources from this change's `assets/brand/` to `docs/brand/`, so they survive archiving.
  - Redraw the logo from `docs/brand/logo-source.jpg` as a clean two-tone SVG with a transparent background, plus a simplified favicon glyph.
  - Sample the palette hex values from both brand files.
  - Write `tools/brand` (sharp) to generate `favicon.svg`, `favicon.ico`, `apple-touch-icon`, and 192/512 PWA icons including maskable ones.

  Verify the generated files have the expected sizes, the maskable icon keeps the mark inside the safe zone, and the SVG matches the source in a side-by-side review
- [ ] 7.2 Define the design tokens in `shared/ui` (light and dark colours, spacing, `--sb-chamfer`, motion durations, fluid type scale) and the theme service (system default, manual override saved per device and account); verify unit tests for the theme service and a contrast script showing every text pair ≥ 4.5:1 and every UI/focus pair ≥ 3:1 in both themes
- [ ] 7.3 Self-host the fonts from `@fontsource/chakra-petch` (500, 600) and `@fontsource-variable/atkinson-hyperlegible-next`, using only Latin and Latin Extended WOFF2 subsets, preloading the fonts needed for the first screen, `font-display: swap` and tabular numbers for prices; verify a Playwright test that no font or stylesheet is requested from another host and that ñ, á, ü, ¿ and ¡ render in both fonts
- [ ] 7.4 Build the chamfered components (`sb-button`, `sb-field`, `sb-card`, `sb-panel`, `sb-chip`, `sb-dialog`):
  - The shape uses `corner-shape: bevel` with a two-layer `clip-path` fallback.
  - States: hover trace, press, chamfer-shaped focus ring, disabled, and loading with `aria-busy` and a double-submit guard.
  - Under reduced motion, animations are removed.
  - A development-only component gallery route.

  Verify unit tests per component, Playwright visual regression in both themes and with and without `corner-shape` support, a reduced-motion run and axe checks
- [ ] 7.5 Set up the raster image pipeline (sharp to AVIF/WebP with fallbacks, `srcset` widths, explicit dimensions, `NgOptimizedImage`) and the SVG line-icon sprite for recipe categories; verify a test that a 320 px slot on a 2x screen receives a ~640 px AVIF or WebP
- [ ] 7.6 Build the app shell: lazy feature routes, header with the logo, responsive layout (bottom navigation on mobile, side navigation on desktop), the subtle paper grain, and 44 px touch targets; verify Playwright screenshots at 375 px and 1280 px with no horizontal scroll, and axe target-size checks
- [ ] 7.7 Set up Transloco (es default, en) with bundled translation files, a language switcher persisted per device and account, and a CI script failing on es/en key mismatch; verify the parity script fails on a fixture with a missing key and switching language needs no reload
- [ ] 7.8 Build the HTTP layer (same-origin client, in-memory CSRF token interceptor, error mapping, failed-request offline signal); verify unit tests for the interceptor and error mapping
- [ ] 7.9 Add `@angular/pwa`: manifest with brand colours and the icons from 7.1, a service worker caching only the app shell and assets (no personal API data), and an update prompt; verify a Playwright test shows the installed shell loads offline and a Lighthouse installability check passes
- [ ] 7.10 Build the auth screens with the chamfered components (registration with consents and Turnstile, activation with 60 s resend countdown, sign-in with CAPTCHA escalation, Google button, forgot and new password, offline notice) in es/en; verify Playwright end-to-end tests for registration → activation → sign-in and for password reset, using Mailpit
- [ ] 7.11 Build the prerendered legal pages (aviso legal, privacidad, cookies, términos with recipe licence, transfer on deletion, moderation rules, disclaimers) in es/en, with footer links; verify they appear prerendered in the build output and are reachable signed out
- [ ] 7.12 Add the terms re-acceptance gate on document version change; verify a test that bumping the terms version forces acceptance at next sign-in

## 8. Offline sync engine

- [ ] 8.1 Back: implement `POST /api/sync/push` (ordered mutations, per-mutation transaction, idempotency via `processed_mutations`, an entity handler registry using the shared schemas, ok or rejected per mutation); verify an integration test that a repeated mutation ID is applied once
- [ ] 8.2 Back: implement `GET /api/sync/pull` by `seq` cursor, including tombstones; verify an integration test that a second device receives creates, updates and deletes in order
- [ ] 8.3 Back: implement the catalog endpoints (versioned summary and detail chunks of 250 recipes with `immutable` caching and ETags, a manifest of the current version, and `GET /api/catalog/changes`); verify integration tests that chunks are stable per version, a new public recipe appears in changes and private recipes never do
- [ ] 8.4 Front: implement the per-user Dexie database (name from a user-ID hash), repositories writing the entity and the outbox in one transaction, and UUIDv7 IDs; verify unit tests with fake-indexeddb
- [ ] 8.5 Front: implement the catalog downloader (summaries first, then details in the background with planned and favourite recipes prioritised, progress per chunk, resume after interruption); verify unit tests with an interrupted download resuming at the next chunk
- [ ] 8.6 Front: implement the sync engine (2 s debounce after writes, `online` and `visibilitychange` triggers, backoff from 5 s to 5 min, failed fetch marks offline) and the status indicator with pending count; verify unit tests with fake timers
- [ ] 8.7 Front: handle rejected mutations (remove from outbox, notify the user with the reason); verify a unit test and the UI message
- [ ] 8.8 Front: handle session expiry (keep outbox, flush after the same user re-authenticates), sign-out warning and full local wipe, `navigator.storage.persist()`, quota error message; verify Playwright tests for re-sign-in flush and for the wipe on a shared device
- [ ] 8.9 Document the sync and catalog protocols (mutation format, ordering, idempotency, cursors, conflict rule, chunk versioning) in `docs/sync.md`; verify it matches the implemented schemas
- [ ] 8.10 End-to-end: tick 10 items offline, drop the connection mid-sync, then reconnect; edit the same slot on two browser contexts. Verify Playwright shows exactly 10 ticks server-side and both contexts converge

## 9. Onboarding, preferences, equipment and consent

- [ ] 9.1 Back: sync handlers and endpoints for profile, alias (format, uniqueness, blocklist), household size, diet, cuisines, days-and-meals matrix, chains and maximum, budget, prep day, theme, `high_protein_only` and onboarding step; verify integration tests including invalid sizes (0, 13, 2.5), a 5 € budget and the health preference defaulting to on
- [ ] 9.2 Back: health restrictions encrypted with AES-GCM, gated by recorded health-data consent; withdrawal deletes them; verify tests that the DB holds only ciphertext and that withdrawal removes the data
- [ ] 9.3 Back: excluded foods, user equipment and kitchen capacity (ovens 0–2, burners 0–6, defaults of a 4-burner hob, 1 oven and a microwave); verify integration tests
- [ ] 9.4 Front: the 10-step onboarding wizard with resume and required-step gating, in es/en; verify Playwright for completion, resume after reload, and plan generation blocked until the budget is set
- [ ] 9.5 Front: the health-data consent step, the persistent warning when declined or withdrawn, and settings to withdraw; verify Playwright tests
- [ ] 9.6 Front: the equipment page and preference settings pages for later edits, including the "Solo recetas altas en proteína y saludables" switch; verify Playwright that changes persist offline and sync

## 10. Catalog browsing, prices and cookbook

- [ ] 10.1 Front: recipe search and filters (accent-insensitive; meal type, cuisine, time, diet, owned equipment, health label; incompatible recipes hidden, with a "mostrar todas" warning) rendered with CDK virtual scrolling; verify unit tests and a Playwright test for the gluten-free "pasta" scenario
- [ ] 10.2 Front: recipe detail (quantities scaled to the household, allergens with the label notice, nutrition per serving, health label, equipment used, storage, cost per serving with price sources and "Precios orientativos"); verify the 4-to-2 servings scaling test and the nutrition display
- [ ] 10.3 Favourites and "No sugerir más" (sync handlers plus UI); verify tests that hidden recipes are excluded from candidate lists
- [ ] 10.4 Ingredient picker and private ingredients (mandatory allergen declaration, optional nutrition, similar-name suggestion, visible only to the owner); verify integration and RLS tests for the privacy scenario and the incomplete-nutrition label rule
- [ ] 10.5 Back: price entry (range check against community median or estimate, Redis daily limit of 5 per user and product with rejected attempts counted, user price history, median recalculated in the same transaction, no individual data exposed); verify integration tests for every product-prices scenario
- [ ] 10.6 Front: price entry from product view, list and receipt with source labels, and "Reportar estimación"; verify Playwright for the accepted, rejected and daily-limit messages
- [ ] 10.7 Cookbook: recipe editor (structure, picker-only ingredients, structured steps with resources, validation via shared rules, live nutrition and health label), immutable versions on every save, delete that keeps pinned versions readable, optional translation; verify integration tests for versioning and for deletion while pinned in another user's plan

## 11. Planning engine and weekly plan

- [ ] 11.1 Shared: candidate filter applying every hard constraint (derived allergens, product traces in the user's chains, diet, exclusions, hidden recipes, equipment, meal type, cuisine, health preference, storage feasibility from the prep day) on precomputed bitset indexes; verify unit tests and fast-check property tests that no candidate breaks a constraint
- [ ] 11.2 Shared: list optimiser (cheapest pack combination per ingredient and chain; exact search over chain subsets up to the user's maximum; savings amount); verify unit tests for the 900 g / 1 kg pack and 6,40 € split scenarios
- [ ] 11.3 Shared: plan generator (greedy plus time-limited local search, objective of pack cost, waste, variety and favourites, budget handling with the over-budget amount, at most 2 slots per recipe and none consecutive, seeded determinism, empty slots with limiting filters); verify unit tests and fast-check properties (constraints never broken, repetition rules hold, same seed gives the same plan)
- [ ] 11.4 Front: run the generator in a Web Worker with progress and cancellation; verify a test that generation runs off the main thread and finishes within 3 s on the full 2,000+ seed catalog on a mid-range profile
- [ ] 11.5 Back: plan sync handler that revalidates hard constraints with the shared filter; verify an integration test that a tampered entry containing a household allergen is rejected
- [ ] 11.6 Front: weekly plan UI (grid on desktop, day list on mobile), generate, lock, regenerate unlocked slots, swap with ranked suggestions, move or exchange, portions, add or remove, eaten or skipped, costs per day, per serving and total; verify Playwright tests for the swap, portions and locked-slot scenarios
- [ ] 11.7 Front: flag meals made incompatible by preference or equipment changes, offer replacements, and exclude flagged meals from the list; verify Playwright for the egg-allergy tortilla and oven-removed lasagne scenarios
- [ ] 11.8 Plan history and "Repetir semana" with revalidation, plus the "nueva versión disponible" notice that allows switching only to compatible versions; verify tests for the repeat-week and author-adds-peanuts scenarios

## 12. Batch prep session

- [ ] 12.1 Shared: storage planner (fridge if within fridge days of the prep day, else freezer with a move-to-fridge-the-day-before instruction, else not allowed); verify unit tests for the fridge/freezer and non-freezable scenarios
- [ ] 12.2 Shared: prep scheduler (merge shared prep by action and ingredient, list scheduling with ovens by temperature, burners and one active cook, start times and total duration); verify unit tests for grouped onions and the 200 °C / 180 °C single-oven scenario
- [ ] 12.3 Shared: portioning list (containers per meal, fridge or freezer, label text with eat-by date, total count) and day-of instructions (reheat, same-day finishing step); verify unit tests for the container-count and salad scenarios
- [ ] 12.4 Front: prep session UI (timeline, synced interactive checklist, portioning list, day-of cards); verify Playwright that ticks made on one context appear on another after sync

## 13. Shopping list, pantry and receipts

- [ ] 13.1 Shared and front: build the list from plan and pantry (aggregation, safe products only, sections, lines with packs, price source and recipes, allergen notice); verify unit tests for the 900 g aggregation and coeliac oat scenarios
- [ ] 13.2 Shared: recalculate after plan edits (ticked items kept, "Falta por comprar", unticked unneeded items removed, ticked unneeded items become leftovers); verify unit tests for the swap-after-shopping scenario
- [ ] 13.3 Pantry: staples, lazy week rollover carrying over only long-life leftovers, editing; verify unit tests for the rice-carried-over and spinach-not-carried scenarios
- [ ] 13.4 Extra free-text items with optional price counted in the total; verify a unit test
- [ ] 13.5 Front: in-store list mode (large tap targets, offline ticking, totals per supermarket and overall, virtual scrolling for long lists); verify a Playwright test of ticking in offline mode
- [ ] 13.6 Receipts: manual entry with discount lines, "Terminar compra" prefill, line prices submitted through price validation (save blocked on an invalid line), history by week and month, edit and delete; verify integration and Playwright tests for every purchase-tickets scenario
- [ ] 13.7 Budget tracking views (budget against planned against spent per week; monthly and per-supermarket totals); verify a unit test for the 60 / 54,30 / 57,85 € scenario
- [ ] 13.8 Offline receipts revalidated on sync, with a line marked for correction when rejected; verify a Playwright test with a reference price changed on the server between capture and sync

## 14. Community sharing and admin back office

- [ ] 14.1 Back: publish and unpublish (licence acceptance on first publish; checks for required fields, food safety, lengths, URL/email/phone, blocklist, private ingredients and near-duplicates via `pg_trgm`; health label computed); published, review or error outcomes; verify integration tests for the clean, link and private-ingredient scenarios
- [ ] 14.2 Back: republish flow that keeps the previous public version visible while the new one is under review; verify an integration test
- [ ] 14.3 Back: reports (reasons, one per user per recipe) and auto-hide at 3 distinct reporters without affecting pinned plans; verify integration tests
- [ ] 14.4 Notifications inbox (back endpoints plus front UI); verify Playwright that the author receives the moderation reason
- [ ] 14.5 Back: admin access via `private.admins` with a 12-hour recent-auth requirement and 404 for non-admins; verify integration tests
- [ ] 14.6 Back: moderation queue (review items, hidden recipes, estimate reports, oldest first) and decisions (approve, reject or remove with a mandatory reason; private-ingredient promotion with verified allergens and nutrition; author and reporters notified; removed recipes stay private for the author); verify integration tests for every moderation scenario
- [ ] 14.7 Back: catalog and estimate maintenance with audit log, where allergen or nutrition changes create new versions of affected system recipes; verify the soy-allergen-correction integration test
- [ ] 14.8 Front: community UI ("Publicar", "por @alias", "Reportar" with reasons) and admin screens (queue, decisions, catalog and price editor, audit log, virtual scrolling); verify Playwright as a user and as an admin

## 15. Account management

- [ ] 15.1 Alias change propagating to published recipes; password change ending other sessions; setting a password for Google accounts via code; verify integration tests
- [ ] 15.2 Email change via a code sent to the new address, plus a notice to the old address; verify an integration test with Mailpit
- [ ] 15.3 Active sessions list (device and browser, last activity) with revoke-one and revoke-others; verify integration tests that revoked sessions fail immediately
- [ ] 15.4 Data export as JSON including decrypted health data for the owner; verify a test that the file contains every category in the spec
- [ ] 15.5 Account deletion (re-authentication; delete personal data, private recipes and private ingredients; transfer published recipes to "Sistema"; anonymise price entries; end sessions; wipe the client); verify integration tests that another user's plan still works and the email can register as a new account
- [ ] 15.6 Front: account settings screens for all of the above, including theme selection, in es/en; verify a Playwright end-to-end test of deletion

## 16. Performance and scalability

- [ ] 16.1 Add Lighthouse CI for the landing, plan, recipe list and shopping list pages with the Core Web Vitals and score thresholds, and align the Angular budgets with the JavaScript budget; verify the pipeline fails on a fixture that breaks a budget and passes on the app
- [ ] 16.2 Add a Playwright performance trace that scrolls the full 2,000+ recipe list and generates a plan under mid-range emulation; verify no main-thread task exceeds 50 ms while scrolling and interactions respond within 200 ms during generation
- [ ] 16.3 Write k6 scripts in `tools/load/` (realistic mix of sync, catalog, prices and auth) and a Docker reference instance (1 vCPU, 1 GB, local Postgres and Redis); verify 100 requests per second for 10 minutes meets the p95 and error thresholds, and two instances reach at least 1.8 times the throughput of one
- [ ] 16.4 Document the measured results, the reference instance and the scaling path in `docs/performance.md`; verify every requirement in the performance spec maps to a measurement

## 17. Deployment and system integration

- [ ] 17.1 Provision Supabase (EU region), apply migrations, run seed validation and load the seed, enable the Cron jobs, and apply the auth settings from the spike; verify production row counts match the seed
- [ ] 17.2 Provision Upstash Redis (EU, TLS), Turnstile keys and the Google OAuth client (consent screen with legal URLs; origin and redirect on `https://safebaites.isaacgarcia.stream`); verify a smoke test of each from the deployed back
- [ ] 17.3 Deploy the Node service on Render free (EU region) with every secret as an environment variable, reachable only through the edge from the other change; verify `/api/health` responds through `https://safebaites.isaacgarcia.stream/api/health`
- [ ] 17.4 Grant the admin role by SQL and confirm admin access; verify the admin queue loads in production
- [ ] 17.5 Run an OWASP ZAP baseline scan against the deployment in CI; verify it reports no high or medium alerts, or each one is documented as a false positive
- [ ] 17.6 Run the full journey end-to-end in es and en against the deployment (register, activate, onboard, plan, prep, offline list, receipt, budget, publish, report, delete account) on desktop Chrome/Edge and Android Chrome; complete a manual checklist on an iPhone installed PWA, including Google sign-in; verify the checklist in `docs/release-checklist.md` is fully ticked
- [ ] 17.7 Document deployment, secrets, key rotation and free-tier limits (sleep behaviour, quotas) in `docs/deployment.md`; verify a fresh environment can be redeployed by following it
