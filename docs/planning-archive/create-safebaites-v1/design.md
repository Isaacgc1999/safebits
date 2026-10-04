# Design

## Context

- **What exists today:**
  - The repository (GitHub `Isaacgc1999/safeBAItes_app`) contains no application code. The earlier Angular 21 scaffold (`safeBAItes_front/`, with SSR, Express and Tailwind 4) has been deleted, so a fresh Angular 22 application is generated from scratch.
  - OpenSpec is set up with no specs.
  - The machine runs Node 22.22.3.
- **Current upstream versions:** Angular 22.2.1 (engines `^22.22.3 || ^24.15.0 || >=26`); Node 24 "Krypton" is the active LTS, and Node 26 is "Current" and due to become LTS in late October 2026.
- **Hosting, email and keep-alive** are designed in the change `setup-domain-email-and-keepalive`:
  - The app is served at `https://safebaites.isaacgarcia.stream/` from a Cloudflare Worker, with `/api/*` proxied to Node on Render.
  - Email goes through Resend in its EU region.
  - A Cloudflare cron heartbeat keeps Supabase active.
- **Hard constraints from the product owner:**
  - **Zero running cost.** Free tiers only, and no paid APIs.
  - **AI used once only.** AI is used once, during development, to create the catalog. There is no AI in the running app.
  - **Lowest legal risk.** No scraping of supermarket sites, no third-party recipe data.
  - **Nothing secret in the browser.** No API keys, tokens or secrets reach the browser, and nothing sensitive goes in localStorage or in cookies that scripts can read.
  - **Real accounts with offline-first sync.**
  - **Market:** Spain first; Spanish with English; euros and metric units.
  - **Engineering standards:** see decision 18.
  - **Visual identity:** from the provided logo and the button reference (decision 20), with sources in `assets/brand/`.
- **Behaviour** is defined in `specs/`. This document covers how to build it.

## Goals / Non-Goals

**Goals:**
- One origin for the browser: the static PWA comes from Cloudflare's edge and the API is proxied to Node, so cookies are first-party and no CORS is needed.
- The planner, list optimiser and prep scheduler run on the device, so they work offline and cost nothing on the server. The server revalidates every hard constraint before storing anything.
- Defence in depth: validation in the API, plus row-level security in Postgres, plus encrypted health data.
- Every requirement scenario can be turned into an automated test, including property-based tests of the planner's hard constraints.
- Code meets the standards in decision 18, enforced by tooling rather than by review alone.

**Non-Goals (v1):**
- Photo upload of receipts or shelf labels, and price recognition from photos (planned for v2).
- Recipe photos uploaded by users. Recipes use category illustrations, which also removes file upload from the attack surface.
- Supermarkets beyond Mercadona, Lidl, Carrefour and Consum; per-store prices; store locations or maps.
- Nutrition tracking or intake logging (recipes only show nutrition per serving), push notifications, and real-time push between devices (sync happens on events and intervals).
- Machine translation of user recipes. The browser's own on-device translation may be offered later as an optional extra.
- Multiple household members with different diets (the whole household shares one profile).
- Sustaining millions of simultaneous requests on free tiers. The architecture scales horizontally (decision 19), but that scale needs paid capacity.

## Decisions

### 1. Repository layout: npm workspaces monorepo

```
safeBAItes_app/
  package.json            workspaces: safeBAItes_front, safeBAItes_back, safeBAItes_edge, packages/*
  safeBAItes_front/       Angular 22 PWA (static build, new application)
  safeBAItes_back/        Node 24 + Fastify: backend-for-frontend and API (no static serving)
  safeBAItes_edge/        Cloudflare Worker: static assets, API proxy, cron (other change)
  packages/shared/        TypeScript shared across apps: constants, enums, types, interfaces,
                          models, schemas, mappers, utils, and pure domain logic
                          (allergens, nutrition, units, food safety, planner, optimiser, scheduler)
  supabase/               SQL migrations, RLS policies, seed/ (generated JSON) + loaders
  tools/                  seed/ validation, brand/ asset pipeline, load/ k6 scripts, lint/ local rules
  openspec/
```

The shared package is the reason for a monorepo. The same constraint and validation code runs in the browser (offline planning) and on the server (revalidation), so the two cannot drift apart. The folders inside each workspace are fixed by decision 18.

### 2. Versions and a new Angular application

- **Angular:** a new application is generated with Angular CLI 22: `ng new safeBAItes_front`, standalone, zoneless, strict, routing, no SSR server. Nothing is carried over from the deleted v21 scaffold. Public pages (landing, legal pages, sign-in) are prerendered at build time.
- **Node:** target 24 LTS (`engines`, `.nvmrc`). Move to 26 once it becomes LTS; that is only a configuration change.
- **TypeScript:** whatever Angular 22 requires, everywhere, with the strict flags of decision 18.

### 3. One origin for the browser

- **Angular build:** `outputMode: "static"` with prerendered public routes, built into the edge Worker's asset folder.
- **Hosting:** the Cloudflare Worker on `safebaites.isaacgarcia.stream` serves the static files and proxies `/api/*` to Node (see `setup-domain-email-and-keepalive`). Fastify serves no files.

**Why:** one origin gives first-party cookies and no CORS. Serving the shell from the edge keeps the app instant even while the free backend is asleep.

**Alternatives considered:**
- Node serving the PWA: the shell would wait on backend cold starts.
- Angular server-side rendering as the backend: mixes UI rendering with the API, and rendering on the server adds nothing to an offline-first app.

### 4. Backend-for-frontend; Supabase reachable only from the server

```
 Browser (PWA)                    Node 24 / Fastify                     Supabase (EU)
 +-------------------+  same     +-----------------------------+       +---------------+
 | Angular UI        |  origin   | helmet (CSP, HSTS, ...)     |       | Auth (users,  |
 | Web Worker:       |  via edge | edge secret + client IP     | admin | passwords,    |
 |  planner          | --------> | rate limit / lockout (Redis)| ----> | Google token) |
 | IndexedDB (Dexie) | __Host-sb-| CSRF (session-bound token)  |       +---------------+
 |  data + outbox    | sid       | zod validation (strict)     |  SQL  | Postgres      |
 | in-memory CSRF    | HttpOnly  | session -> user id          | ----> |  RLS on every |
 | token only        |           | Kysely + per-request tx     |       |  table        |
 +-------------------+           |  SET LOCAL ROLE + claims    |       +---------------+
                                 +------+--------------+-------+
                                        |              |
                                   Upstash Redis   Resend (EU region)
                                   (EU, TLS)
```

- **Database access:** Node connects to Postgres directly through the Supabase connection pooler, using Kysely (parameterised, typed queries).
  - Each user request runs in a transaction that sets `SET LOCAL ROLE authenticated` and the user ID into `request.jwt.claims`, so row-level-security policies using `auth.uid()` apply as a second safety net.
  - Privileged work (seed loading, auth administration, community median recalculation, account deletion, moderation) uses a separate privileged connection, and only from named modules.
- **No Supabase key, URL or token ever reaches the browser.**
- **Why direct SQL rather than the supabase-js REST API:** sync pushes need multi-statement transactions and idempotency tables, which the REST API cannot do without wrapping everything in database functions. A direct connection also avoids an extra HTTP hop.
  - Alternative: supabase-js on the server. Simpler, but has no transactions.

### 5. Authentication: Supabase Auth stores identities, Node owns the rules

- **Supabase Auth's role:** it stores users, hashes passwords and checks Google ID tokens.
- **Supabase's built-in emails are never triggered.** The app never calls `signUp`, `resetPasswordForEmail` or `signInWithOtp`.

**Registration:**
1. Node checks the CAPTCHA, the password rules (including a Pwned Passwords k-anonymity range lookup, which is free and needs no key, plus a local common-password list) and the limits.
2. `auth.admin.createUser({ email, password, email_confirm: false })`. A duplicate email gets the same response as a success.
3. Node issues an activation code.
4. On a valid code, `auth.admin.updateUserById(id, { email_confirm: true })`.

**Sign-in:** `auth.signInWithPassword` server-side checks the password. Node reads the user ID and immediately revokes the Supabase session. The app's own session is the only one that matters, so no provider tokens are kept.

**Google sign-in:**
- **Main path:** the Google Identity Services button, which uses FedCM or a popup with no page redirect. The browser sends Node the ID token and a nonce that Node issued and bound to the session. Node calls `auth.signInWithIdToken({ provider: 'google', token, nonce })` and asks for consent on first use. Scopes are `openid email profile`.
- **Fallback for iOS installed apps, where popups and FedCM fail:** an authorisation-code flow with PKCE and `state`, run entirely by Node with `/api/auth/google/callback` on our origin.

**Codes:**
- **Storage:** Redis key `code:{purpose}:{userId}`, holding an HMAC-SHA-256 of the code (key from a secret) and an attempt counter, with `EX 600`.
- **Generation:** `crypto.randomInt(0, 1_000_000)`, zero-padded to 6 digits.
- **One active code per purpose:** a new code overwrites the key, which is how the previous one becomes invalid.
- **Deletion:** `DEL` on use or on the fifth wrong attempt. Redis deletes expired keys itself, which meets the "deleted on expiry" rule literally.
- **Cooldown:** key `cooldown:{purpose}:{userId}` with `EX 60` (`SET NX`).
- **Comparison:** constant time.

**Sessions:**
- **Storage:** a Postgres table in the `private` schema, not exposed to the REST API. Each row holds a SHA-256 of the session ID, user, device ID, sign-in time, last-seen time and user-agent summary.
- **Cookie:** `__Host-sb-sid` (HttpOnly, Secure, SameSite=Lax, Path=/), with a 256-bit random value.
- **Lifetime:** 30 days idle (sliding) and 90 days absolute.
- **Rotation:** a new ID on sign-in and on password or privilege changes. Revoking a session means deleting its row, effective immediately.
- **Why Postgres and not Redis:** sessions must survive running out of Redis quota and be listable for "Active sessions".

**CSRF:** the token is derived from the session secret using HMAC. The app fetches it from `GET /api/auth/csrf`, keeps it in memory only and sends it as `X-CSRF-Token`. Together with the SameSite cookie, every state-changing request is checked. No cookie that scripts can read is used.

**Alternative considered:** a fully custom auth stack (argon2id plus a Google ID-token library). That means more security-critical code to own. Supabase Auth keeps password storage and token checking in vetted code, while every rule the user asked for is enforced in Node.

### 6. Abuse protection: Redis counters keyed by IP, device and account

- **Device ID:** the cookie `__Host-sb-did` holds a random 128-bit value, issued on first contact and lasting 1 year. It is HttpOnly, used only for security, and counts as strictly necessary, so no consent is needed.
  - The product owner asked for MAC-address blocking. That is impossible: a MAC address never leaves the local network, and browsers cannot read one. The device cookie, combined with the account and IP keys and with CAPTCHA escalation, is the replacement.
- **Counting:** atomic sliding windows (a Lua script, or `INCR` plus `PEXPIRE` in a `MULTI`) under keys such as `rl:{route}:{ip}`, `rl:{route}:{account}`, `fail:pw:{email}:{device}`, `fail:pw:{email}:{ip}` and `block:{ip|device}`, with escalation counters stored for 24 h.
- **Client IP:** taken only from the header the edge sets, and only after the edge secret checks out (see `setup-domain-email-and-keepalive`). Client-sent forwarding headers are ignored.
- **CAPTCHA:** Cloudflare Turnstile (free), always checked server-side through `siteverify`.
- **If Redis is unavailable:**
  - Auth-sensitive endpoints (codes, sign-in, registration, reset) fail closed with HTTP 503.
  - Other endpoints fall back to a per-instance in-memory limiter and log a warning.
- **Per-route limits** live in one config file.

### 7. Application hardening

- **`@fastify/helmet`** for API responses, and the edge `_headers` file for static files, with a strict content security policy:
  - `script-src 'self'` plus `https://accounts.google.com/gsi/client` and `https://challenges.cloudflare.com`, plus the hashes that Angular `autoCsp` generates for `index.html`.
  - `font-src 'self'` and `style-src 'self'`, so no remote fonts or stylesheets.
  - `frame-src` for the Google and Turnstile widgets only.
  - `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`.
  - `require-trusted-types-for 'script'`, with Angular's Trusted Types policy.
- **HTTPS:** HSTS for one year.
- **Input validation:** every route has zod schemas using `.strict()` (unknown fields rejected), through a Fastify type provider. Server-controlled fields do not exist in input schemas.
- **Errors:** a single error handler returns generic messages with a correlation ID.
- **Logging:** pino, with redaction of `password`, `code`, `token`, `cookie`, `authorization` and restriction payloads.
- **Health data encryption:** allergies and intolerances are encrypted in the application with AES-256-GCM, using a versioned key from the environment, and stored as `bytea`. Node decrypts them only for their owner (sync, revalidation, export).
- **XSS:** user content is only ever shown through Angular interpolation. Lint rules forbid `innerHTML` and the `bypassSecurityTrust*` APIs.
- **CI security:** CodeQL, `npm audit` with zero findings (decision 18), and an OWASP ZAP baseline scan against a preview deployment.

### 8. Offline-first sync: Dexie, an outbox and a server change sequence

- **On the device:**
  - **Database:** one Dexie database per user, named after a hash of the user ID, mirroring the user's entities, plus `outbox`, `meta` (cursors, last user, catalog download progress) and a catalog cache.
  - **Writes:** every local write goes in one Dexie transaction that updates the entity and appends `{ mutationId: uuidv7, entity, op, payload, baseSeq }` to the outbox.
  - **IDs:** UUIDv7, generated on the device.
- **Push (`POST /api/sync/push`):** mutations are sent in order, up to 100 per batch.
  - The server applies each one in a transaction.
  - It records `mutationId` in `private.processed_mutations` (idempotency) and validates exactly as the online endpoints do.
  - It returns `ok` or `rejected` with a reason for each mutation.
- **Pull (`GET /api/sync/pull?cursor=`):**
  - Every user-owned table has a `seq bigint` column, set by a trigger from one global sequence on insert and update.
  - Pull returns rows with `seq > cursor`, including tombstones (`deleted_at`).
  - A server-assigned sequence avoids clock-skew problems. "Last write wins" means the last write *the server applies*.
- **Catalog sync** is separate and comes in two tiers, both delivered as chunks (decision 19):
  - **Tier 1, summaries.** Everything the planner needs: IDs, titles, tags, derived allergens and diets, nutrition, equipment, storage data, and ingredient lines. It is downloaded first, in chunks of 250 recipes.
  - **Tier 2, details.** Steps and texts. Downloaded in the background afterwards, with planned and favourite recipes first.
  - **Resuming:** progress is stored per chunk, so an interrupted download resumes.
  - **Updates:** `GET /api/catalog/changes?cursor=` sends updates.
- **When sync runs:**
  - After each local write (debounced by 2 s), on the `online` event, on `visibilitychange` back to visible, and on an exponential-backoff timer (5 s up to 5 min).
  - A failed fetch marks the app offline, whatever `navigator.onLine` says.
- **Session expiry:** the outbox stays in the per-user database and is sent only after that user signs in again. A different user gets a different database.
- **Sign-out:** warns about unsynced changes, then deletes the user's Dexie database and any personal entries in Cache Storage.
- **Service worker:** Angular's service worker caches the app shell and assets only. Personal API responses are never cached, so personal data lives only in IndexedDB, under the app's control.
- **Persistent storage** is requested at first sign-in with `navigator.storage.persist()`.

### 9. Planning engine in `packages/shared`, running in a Web Worker

- **Candidate filter** (hard constraints) for each slot:
  - Derived allergens, plus product traces in the user's chains.
  - Diet, exclusions, hidden recipes, equipment groups, meal type and cuisine.
  - The high-protein and healthy label when the preference is on.
  - Storage feasibility: days from the prep day ≤ fridge days, or the recipe is freezable.
- **Building the week:**
  1. A greedy pass fills slots by marginal pack cost, with a bonus for reusing ingredients already bought.
  2. A local search (swap and move steps), limited to about 1.5 s, minimises this objective:
     - cash spent on whole packs, in the best combination of chains;
     - plus a waste penalty;
     - plus a variety penalty (at most 2 slots per recipe, never two consecutive meals);
     - minus a favourites bonus;
     - plus a large penalty for exceeding the budget.
  3. Random choices use a fixed seed, so the same inputs and seed always give the same plan, which makes tests reproducible.
- **Precomputation:** with 2,000+ recipes, a candidate index is built once per catalog version and household profile (bitsets per allergen, diet, equipment, meal type and cuisine), so filtering is a cheap bitset intersection.
- **List optimiser:**
  - **Packs:** for each ingredient and chain, the cheapest combination of pack sizes covering the quantity (a small bounded knapsack).
  - **Chains:** with only 4 chains, every subset of size ≤ the user's maximum (at most 15 subsets) is tried, and each item goes to its cheapest chain within the subset. This is exact and fast.
- **Prep scheduler:** list scheduling over structured recipe steps `{ action, ingredientRefs, minutes, mode: active|passive, resource: oven(temp)|burner|none, after: [...] }`.
  - Resources: the number of ovens (one temperature per oven at a time), the number of burners, and one cook for active steps.
  - Preparation steps with the same action and ingredient across recipes are merged first.
- **The server reuses the same code** to revalidate hard constraints on plan entries it receives.

### 10. Data model (Postgres, all money in integer cents)

- **Reference data:**
  - `ingredients`: `owner_id` is null for global ingredients and set for private ones. Nutrition per 100 g or 100 ml (energy, protein, fat, saturated fat, carbohydrates, sugars, fibre, salt), plus the identifier of the source record.
  - `ingredient_chain_unavailable`.
  - `chains`, `products`, `price_estimates`.
  - `equipment`.
- **Recipes:**
  - `recipes`: `owner_id` is null for "Sistema"; there is a visibility state; `published_version` and `current_version`.
  - `recipe_versions`: immutable, holding:
    - the bilingual text and structured `data` (ingredients and steps);
    - derived allergens, traces, diet flags, nutrition per serving and the health label;
    - equipment groups, fridge days, freezable, and same-day step.
  - `favourites`, `hidden_recipes`.
  - **Indexes:** GIN indexes on the arrays of allergens, diets and equipment, and B-tree indexes on meal type, cuisine and `seq`.
- **Household:**
  - `profiles`: alias as unique `citext`, language, theme, household size, diet, cuisines, a days-and-meals matrix, chains, maximum chains, budget, prep day, `high_protein_only` (default true), onboarding step.
  - `health_restrictions`: encrypted.
  - `excluded_foods`, `user_equipment`, `kitchen_capacity`.
- **Plans and shopping:**
  - `plans`, `plan_slots` (recipe ID and **pinned version**, portions, locked, state).
  - `prep_progress`, `shopping_list_items` (ticked, leftovers), `extra_items`, `pantry_items`.
  - `tickets`, `ticket_lines`.
- **Prices:**
  - `user_prices`: a history; the latest row per user and product is "their price".
  - `community_prices`: median, number of contributors and update time. Recalculated for the affected product inside the same transaction when a price is accepted.
- **Community and admin:**
  - `reports`, `moderation_items`, `moderation_decisions`, `notifications`.
  - `consents`: kind, document version, timestamp.
- **`private` schema** (not exposed): `sessions`, `processed_mutations`, `audit_log`, `admins` (the role is granted only through SQL).
- **RLS:**
  - Enabled on every table, denying everything by default.
  - Owner policies use `auth.uid()`.
  - Catalog read policies cover global rows, public recipes and the user's own rows.
  - Automated tests show that one user cannot read another's rows.

### 11. One-time AI seed data, generated during development

- **What is generated:**
  - About 400 generic ingredients with nutrition.
  - Products for the 4 chains, with generic descriptions and pack sizes.
  - Reference price estimates (dated, labelled estimates).
  - Equipment.
  - At least 2,000 bilingual recipes with structured steps.
- **Nutrition source:** each generic ingredient is mapped to a USDA FoodData Central record (public domain, CC0), and its values per 100 g are stored with the source ID. A spot check compares a sample against the Spanish BEDCA tables for plausibility, without copying from them.
- **High-protein and healthy by default:** recipes are written to the thresholds in the recipe-catalog spec. Typical approaches:
  - lean proteins, legumes, eggs, dairy, tofu and tempeh;
  - whole grains and vegetables;
  - oven, air fryer, stew and steaming methods rather than deep frying;
  - salt and free sugars kept in check.
- **How:**
  - The AI coding assistant writes the recipes in batches of about 50, one batch per cuisine and meal type (10 cuisines x 4 meal types).
  - Within each batch, the allergen-free and diet quotas of the specs are filled first, so restrictive filters keep variety.
  - Files are committed under `supabase/seed/*.json`. The project contains no AI client and no AI key.
- **Gate:** `tools/seed/validate` must pass before loading. It checks:
  - every file against the zod schemas and every ingredient reference;
  - allergens, diets and nutrition, by deriving them;
  - the high-protein and healthy thresholds;
  - food-safety rules;
  - every coverage minimum (meal type, allergen-free share, diets, combined filters, cuisine by meal type, equipment, storage);
  - chain coverage for every ingredient;
  - near-duplicates, using Jaccard similarity of ingredient sets ≥ 0.9 plus title trigram similarity ≥ 0.8, which needs no embeddings and costs nothing.
- **Human review:** a stratified sample of 100 recipes (at least 2 per cuisine and meal type) plus every flagged one is checked before the first release.
- **Prices:** estimates come from the model's general knowledge of typical Spanish prices around the generation date. No supermarket website is fetched or scraped. Product descriptions are generic (e.g. "Arroz redondo, paquete 1 kg"), with no own-brand names, logos or photos.
- **Cuisines (10):** española, mediterránea, italiana, mexicana, latinoamericana, asiática, india, oriente medio, americana, francesa.

### 12. Price rules

- **Allowed range:** `[ref / 2.5, ref × 2.5]`.
  - The product owner's rule "no more than 150% difference" sets the upper bound (+150% means ×2.5).
  - A percentage *drop* can never exceed 100%, so the literal rule cannot reject 0,01 €. Using the same *ratio* for the lower bound does: ÷2.5, which is −60%.
- **Reference:** the community median when one exists, otherwise the estimate.
- **Daily limit:** counted in Redis (`price:{user}:{product}:{yyyy-mm-dd Madrid}`), and rejected attempts count. The client checks the range locally with cached references; the server is authoritative.

### 13. Community checks without AI

When a recipe is published, the server checks:
- Required fields, food-safety rules and length limits.
- Regular expressions for URLs, emails and phone numbers.
- An open-licence Spanish and English offensive-words blocklist.
- Private ingredients.
- Near-duplicates (the same similarity test as the seed gate, run against public recipes using `pg_trgm`).

Hard failures are sent back to the author. Soft flags create a `moderation_item`. Three distinct reports hide the recipe. Notifications are rows in `notifications`, shown in an in-app inbox. The health label is computed for every community recipe from its derived nutrition.

### 14. Localization

- **Transloco** (`@jsverse/transloco`, MIT) for runtime switching. The JSON translation files are bundled so they work offline.
- **CI parity check:** a script fails when the `es` and `en` keys differ.
- **Content:** catalog content has `_es` and `_en` columns. User recipes store a `lang` plus an optional translation.
- **Formatting:** `Intl.NumberFormat` (EUR) and `Intl.DateTimeFormat` with `timeZone: 'Europe/Madrid'`.
- **Emails:** templates exist in both languages.

### 15. Zero-cost hosting

| Need | Choice (free tier) | Alternative |
|---|---|---|
| Static PWA, edge, cron | Cloudflare Worker with static assets on `safebaites.isaacgarcia.stream` (other change) | none needed |
| Node API | Render free web service, EU region, reachable only through the edge | Oracle Cloud Always Free VM, Koyeb free |
| Postgres + Auth | Supabase Free, EU region | none needed |
| Redis | Upstash Free, EU region, TLS | Redis Cloud free 30 MB |
| Email | Resend free, EU region (other change), behind the `Mailer` interface | SMTP adapter for local development |
| CAPTCHA | Cloudflare Turnstile | hCaptcha |
| CI and quality | GitHub Actions, SonarQube Cloud free | SonarQube Community Build in CI |

### 16. Scheduled jobs: Supabase Cron, not the Node host

The free Node host sleeps when idle, so timed work cannot rely on it.
- **Database jobs run in Supabase Cron (`pg_cron`), which is available on the free plan:**
  - Deleting accounts not activated within 7 days (through a `security definer` function in the `private` schema).
  - Removing expired sessions and old `processed_mutations`.
- **Week rollover (moving long-life leftovers to the pantry)** happens lazily: the first time the user's next week is built, on the device or the server, whichever comes first.
- **Expired codes and counters** are removed by Redis TTL, so no job is needed.
- **The keep-alive heartbeat** is a Cloudflare cron trigger (other change).

### 17. Testing strategy

- **Unit tests (Vitest)** in every workspace, with v8 coverage thresholds of 90% for lines, branches, functions and statements. CI fails below them.
- **Property tests (`fast-check`):** a generated plan never breaks a hard constraint, for any random household and catalog.
- **API integration tests:** against a local Supabase (`supabase start`) and Redis, covering auth flows, limits, CSRF, insecure direct object references and server-controlled fields.
- **RLS tests.**
- **Playwright end-to-end tests:** onboarding through plan, list, receipt; offline mode (`context.setOffline`); two browser contexts to check sync between devices.
- **Visual regression and accessibility:** Playwright screenshots of a development-only component gallery in both themes, plus axe-core checks on every main screen.
- **Performance:** Lighthouse CI budgets on the key pages, and k6 load tests on the reference instance (decision 19).
- **Security:** ZAP baseline scan in CI.

### 18. Engineering standards

These are enforced by tooling in CI, not left to convention.

**Folders and separation of responsibilities:**
```
packages/shared/src/      constants/ enums/ types/ interfaces/ models/ schemas/ mappers/ utils/ domain/
safeBAItes_front/src/app/ core/ (providers, interceptors, guards)
                          features/<feature>/ (pages, components, services, state)
                          shared/ constants/ enums/ types/ interfaces/ models/ mappers/ utils/ ui/ pipes/ directives/
safeBAItes_back/src/      modules/<module>/ (routes, handlers, services, repositories)
                          shared/ constants/ enums/ types/ interfaces/ models/ schemas/ mappers/ utils/
```
- **Where declarations live:** interfaces, types, enums, models and constants are declared only in their `shared/<kind>/` folder of the workspace, or in `packages/shared` when more than one workspace uses them. Components, services, handlers and repositories import them and never declare them.
  - A local ESLint rule, `local/declarations-in-shared`, reports any `interface`, `type`, `enum` or exported constant declared elsewhere.
- **Layer boundaries:** dependency-cruiser enforces them. Features may import `shared` and `core`; `shared` never imports features; no circular dependencies; a backend module never imports another module's internals.
- **Single responsibility:**
  - One exported unit per file; each function does one thing.
  - ESLint limits: `max-lines-per-function` 40, `complexity` 8, `max-depth` 3, `max-params` 3 (an options object beyond that).
  - SonarQube cognitive complexity of 10 or less per function.
- **Components:** pages compose; presentational components only receive inputs and emit outputs; services hold one concern each; mappers convert API data (DTOs) to models and back, with explicit return types.

**Typing:**
- **TypeScript flags:** `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `useUnknownInCatchVariables`, `verbatimModuleSyntax`.
- **Angular templates:** `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`.
- **typescript-eslint:** `strict-type-checked` and `stylistic-type-checked`, including:
  - `no-explicit-any`, the `no-unsafe-*` family and `no-non-null-assertion`;
  - `explicit-function-return-type` and `explicit-module-boundary-types`;
  - `consistent-type-imports` and `switch-exhaustiveness-check`.
- **External data** (HTTP, IndexedDB, environment variables, seed JSON, webhooks) enters only through zod parsing into typed models. Nothing is cast with `as`.

**No comments:**
- **TypeScript, JavaScript and Angular templates:** a local ESLint rule, `local/no-comments`, reports every comment.
- **No exceptions through directives:** `linterOptions.noInlineConfig: true` forbids `eslint-disable` lines.
- **CSS and stylesheets:** a local stylelint plugin rejects every comment.
- **SQL, JSON and configuration files:** a CI script rejects comments in `supabase/**/*.sql`, and in `tsconfig` and other JSON files.
- **Files generated by the Angular CLI** are stripped of comments before their first commit.

**Lint and format:** ESLint (with angular-eslint), stylelint and Prettier, run with `--max-warnings 0`.

**Coverage:** at least 90% for lines, branches, functions and statements in each workspace, from unit plus integration tests, enforced in CI.

**SonarQube:**
- SonarQube Cloud's free plan, which is unlimited for public repositories and covers private ones up to 50k lines of code.
- **Quality gate:**
  - 0 bugs, 0 vulnerabilities and 0 code smells, on both new and overall code;
  - 0 security hotspots left unreviewed;
  - coverage of at least 90% and duplication of 3% or less;
  - A ratings everywhere.
- If the repository stays private and passes 50k lines, SonarQube Community Build runs in CI instead.

**Dependencies and vulnerabilities:**
- `npm audit` across all dependencies must report 0 vulnerabilities of any severity.
- Fixes only by upgrading or replacing the dependency. Never `--force`, `--legacy-peer-deps`, `overrides` or `resolutions`.
- `npm ci` with the committed lockfile and `engine-strict`.
- Renovate opens weekly update pull requests.
- Every new dependency must have a permissive licence, be actively maintained and be justified in its pull request.

**Official guidance wins over habit:**
- Angular: the style, security and performance guides (angular.dev).
- Node.js security best practices; Fastify's validation and hooks documentation.
- PostgreSQL documentation on indexes and RLS; Supabase documentation on RLS and the pooler.
- Cloudflare Workers documentation.
- OWASP ASVS Level 2 and WCAG 2.2.

**Assets:**
- Fonts come only from npm packages (`@fontsource/*`) bundled into the build, never from URLs or CDNs.
- Images follow decision 20.

### 19. Performance and scalability

- **Frontend:**
  - Zoneless change detection with signals, and `OnPush` everywhere.
  - Lazy routes, with `@defer` for content below the fold; `track` on every `@for`.
  - CDK virtual scrolling for every list that can exceed 50 items.
  - Planner, optimiser and scheduler in a Web Worker.
  - Angular budgets in `angular.json`, aligned with the performance spec, and Lighthouse CI on key pages.
  - Preloaded WOFF2 fonts with `font-display: swap`, limited to Latin and Latin Extended subsets.
- **Catalog delivery:**
  - Chunks are served at versioned URLs (`/api/catalog/{version}/summary/{n}`, `/api/catalog/{version}/detail/{n}`) with `Cache-Control: public, max-age=31536000, immutable` and ETags.
  - Cloudflare caches them, so the backend serves each chunk about once per catalog version.
  - Catalog files are public and contain no personal data, so caching them is safe.
- **Backend:**
  - Stateless Fastify instances; serialisation from schemas.
  - The Supabase pooler in transaction mode, with unnamed statements only, since transaction mode does not support prepared statements.
  - An index for every access path, and cursor (keyset) pagination with at most 100 items per page.
  - Compression is done at the edge.
  - The session lookup is a single primary-key query.
- **Reference instance for load tests:** a container limited to 1 vCPU and 1 GB of memory, with local Postgres and Redis, run through Docker on the developer machine or in CI. The k6 scripts live in `tools/load/`, cover a realistic traffic mix, and their thresholds come from the performance spec.
- **Scaling path:** add backend instances behind the edge and upgrade the Supabase, Upstash and Render plans. No code changes are needed.

### 20. Visual identity

- **Sources:** `assets/brand/logo-source.jpg` (the logo: a green shield with an S, a B and a fork) and `assets/brand/button-reference.png` (a navy chamfered button with an icon and a letter-spaced uppercase label).
- **Logo pipeline:**
  - The mark is redrawn as a clean two-tone SVG with a transparent background, plus a simplified glyph for favicons of 32 px and smaller.
  - `tools/brand/` uses `sharp` to generate `favicon.svg`, `favicon.ico` (48 px), `apple-touch-icon` (180 px), and PWA icons at 192 and 512 px, including maskable icons with a 20% safe zone.
- **Colour tokens** (CSS custom properties; hex values are sampled from the brand files during implementation):
  - **Greens from the logo:** leaf, mid and deep shades for accents and the focus colour.
  - **Dark theme:** deep navy surfaces (from the button reference) with light hairline borders at reduced opacity.
  - **Light theme:** a warm paper background with deep ink text.
  - **Semantic tokens per theme:** `surface`, `ink`, `line`, `accent`, `danger` (muted terracotta), `warning` (amber), `success`.
- **Typography:**
  - **Chakra Petch** (`@fontsource/chakra-petch`, weights 500 and 600, OFL) for headings, buttons and labels: uppercase with about 0.14em letter spacing. Its angular cuts echo the chamfers.
  - **Atkinson Hyperlegible Next** (`@fontsource-variable/atkinson-hyperlegible-next`, OFL) for body text, with tabular numbers for prices and quantities.
  - A fluid type scale using `clamp()`.
- **Chamfered components** are built in-house in `shared/ui` (`sb-button`, `sb-field`, `sb-card`, `sb-panel`, `sb-chip`, `sb-dialog`), with no third-party UI kit. Angular CDK is used only for accessibility helpers, overlays and virtual scrolling.
  - **Shape:** the top-left and bottom-right corners are cut, with the size set by the `--sb-chamfer` token.
  - **How the shape is drawn:** `@supports (corner-shape: bevel)` uses `border-radius` with `corner-shape: bevel`. Elsewhere, two layers with the same `clip-path` polygon draw the hairline outline, because `clip-path` would otherwise cut off the border.
- **Motion:**
  - **Hover:** the outline brightens to the accent colour and a light trace runs along it; the icon moves 2 px.
  - **Press:** the control scales to 0.98 with an inner glow.
  - **Focus-visible:** a 2 px chamfer-shaped outline in the accent colour, offset from the control.
  - **Loading:** an animated trace runs around the outline, `aria-busy` is set and the control ignores further presses.
  - Transitions last 250 ms or less. Under `prefers-reduced-motion`, animations are removed and every state stays distinguishable.
- **Layout feel:** minimal and cozy. Generous spacing, quiet chamfered cards, a very subtle inline SVG grain on the paper background, and line-icon illustrations per recipe category (an SVG sprite) instead of stock photos.
- **Images:** raster images go through `sharp`, producing AVIF and WebP with fallbacks, `srcset` widths and explicit dimensions. `NgOptimizedImage` handles lazy loading and sizes.

## Risks / Trade-offs

- **Free hosts sleep.**
  - Render free goes to sleep after ~15 min idle, so the first API call takes about a minute.
  - → The edge serves the shell instantly and shows "Conectando…" while the API wakes. Keep-alive for Supabase is handled in the other change.
- **Free tiers cannot absorb very high traffic.**
  - → The targets are measured on a reference instance, and scaling only means adding instances and plans (decision 19). This is stated plainly in the documentation.
- **Running out of the Upstash command quota would stop sign-ins**, because auth fails closed.
  - → Sessions live in Postgres, not Redis; Redis is used only for counters and codes.
  - → Usage is monitored, with an alert at 70% of the quota.
- **AI-estimated prices can be far off.** With the 2.5x rule, a real price could then be rejected.
  - → "Report a wrong estimate" lets an admin correct it, and community medians replace estimates over time.
  - → Very large promotions (for example 3x2) are entered as a discount line on the receipt.
- **Generating and reviewing 2,000+ recipes is a large effort with a quality risk.**
  - → Batches organised by cuisine and meal type, quotas filled first, the validation gate, a stratified sample of 100, and the report button.
- **Nutrition values are approximate**, because ingredients are generic and cooking changes them.
  - → They are labelled as approximate. The high-protein thresholds are met with a margin.
- **AI-written recipes may contain mistakes.**
  - → The seed validation gate (food-safety rules, derived allergens), human review of a sample, and the report button.
- **Supabase may rate-limit sign-ins**, because every server-side call comes from the Node host's IP.
  - → Raise the Supabase auth rate limits in the dashboard and enforce the real limits in Node. An early spike task measures this.
- **Google sign-in can fail in iOS installed apps** (popups and FedCM).
  - → The server-side redirect flow is the fallback, and an early spike tests it on a real iPhone.
- **Health data is stored in IndexedDB on the device.**
  - → It is deleted on sign-out, there is a warning on shared devices, it is never put in Cache Storage, and XSS defences (CSP, Trusted Types) protect the origin.
- **"Last write wins" can silently overwrite an edit made at the same time on another device.**
  - → Records are small (one slot, one item), and the overwritten device converges on its next sync. Accepted for v1.
- **The planner may be slow on low-end phones.**
  - → It runs in a Web Worker on precomputed bitset indexes, with a time limit, and always returns the best plan found so far.
- **Copyright in user recipes.**
  - → The licence in the terms, reports, the notice-and-action process under the Digital Services Act, and the near-duplicate check.
- **IP-based limits can hit innocent users behind shared mobile-network IPs.**
  - → Blocks key on combinations of account, device and IP, CAPTCHA comes before blocking, and every block is temporary.
- **The strict no-comments rule clashes with tool-generated files.**
  - → Generated files are stripped once. Licence texts live in `LICENSE` files, not in code.
- **SonarQube Cloud's free plan limits private repositories to 50k lines of code.**
  - → Make the repository public when it is released (it is a portfolio project), or use Community Build in CI.
- **`corner-shape` is not supported in every browser.**
  - → The `clip-path` fallback renders the same shape; visual regression covers both.
- **One large change for the whole of v1.**
  - → The tasks are grouped into phases that each deliver testable value. The change can be split if review becomes difficult.

## Migration Plan

This is a greenfield deployment:
1. Create the Supabase project (EU) and apply the migrations.
2. Run the seed validation, then load the seed data.
3. Create the Google OAuth client and the Turnstile keys.
4. Create the Upstash database.
5. Set the secrets as host environment variables (database URL, encryption keys, HMAC secrets, Turnstile secret, Google client ID and secret).
6. Deploy the Node service, then grant the admin role by SQL.
7. The edge, the domain, Resend and the keep-alive are deployed by `setup-domain-email-and-keepalive`.

**Rollback:** redeploy the previous build. Database migrations only move forward and must stay compatible with the previous build.

**Key rotation:** encryption keys carry a version, so health data can be re-encrypted in the background.

## Open Questions

- **Final rate-limit numbers per route**, beyond the ones in the specs. These are tuned in the config file after load testing.
- **Which offensive-words lists to use for Spanish and English**, subject to a licence check.
