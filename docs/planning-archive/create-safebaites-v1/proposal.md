# Proposal

## Why

Cooking for the whole week in one Saturday or Sunday session saves time and money, but planning it is tedious: choosing recipes that respect allergies, intolerances and the kitchen equipment at hand, fitting a weekly budget, working out what to buy in which supermarket, and making the cooked food last until Friday. Apps such as NeatEat cover budget meal planning but explicitly do not cover batch cooking, and none target Spanish supermarkets with prices that users can correct. safeBAItes v1 fills that gap as a free, installable web app (Windows browser and mobile PWA) for Spain, built and secured like a production product while keeping running costs and legal risk at zero or as close to it as possible.

## What Changes

Greenfield v1 of the product. Nothing exists yet. The earlier Angular 21 scaffold (`safeBAItes_front/`) has been deleted, so a fresh Angular 22 application is generated from scratch.

- **Accounts**: registration with email and password, activated with a 6-digit emailed code (10-minute expiry, single use, 60-second resend cooldown, a new code invalidates the previous one); Google sign-in that retrieves name and email, with no password; password reset with the same code rules; public alias; account deletion and data export.
- **Abuse protection**: cooldowns after wrong passwords or codes, rate limits on every endpoint, temporary blocks keyed by account, IP and device ID, CAPTCHA escalation, and generic error messages.
- **Hardening**: no API keys, tokens or secrets in the browser (the browser talks only to our own backend); HttpOnly session cookies; encrypted server-side tokens and health data; protection against SQL injection, XSS and CSRF. v1 has no file uploads.
- **Onboarding and preferences**: household size (1–4 or a custom number), allergies and intolerances (with explicit health-data consent), excluded foods, cuisines, days and meals to plan, preferred supermarkets (Mercadona, Lidl, Carrefour, Consum), weekly budget, prep day (Saturday or Sunday).
- **Kitchen equipment page**: equipment the user owns, including oven and burner counts, used to filter recipes and schedule the prep session.
- **Catalog**: generic ingredients with nutrition data, supermarket products with pack sizes, and at least 2,000 system recipes in Spanish and English, generated once with AI during development and stored as seed data. No AI runs in the live app.
  - The recipes cover every cuisine offered, and every allergy, intolerance and diet filter, in every meal type, so even restrictive households get variety.
  - They are high-protein and healthy by default, with nutrition shown per serving.
- **Prices**: an estimated reference price for every product; users enter real prices (private to them) that also feed a shared community median (at least 5 users); out-of-range values (more than 2.5× above or below the reference) are rejected; at most 5 entries per user per product per day.
- **Cookbook and community recipes**: users create versioned recipes from the ingredient picker (plus private custom ingredients), keep them private, or publish them globally with a button; the author is shown by alias; automatic checks, report button, and admin review for flagged content; when an account is deleted, its published recipes pass to "Sistema".
- **Weekly plan**: an automatic plan that respects all hard constraints and the budget, maximises ingredient reuse and minimises waste; editable per day (swap, move, portions, add or remove, mark eaten).
- **Batch prep session**: an ordered timeline for the prep day that respects equipment limits, plus fridge and freezer instructions based on shelf life.
- **Shopping list and receipts**: a list per supermarket with pack sizes and costs, ticked off in the store, showing only the difference after plan edits, with leftovers carried over; receipts entered by hand (prefilled from the list) and budget tracking of planned against spent.
- **Offline-first PWA**: installable; works fully offline, with writes queued and synced when the connection returns.
- **Localization**: Spanish by default, full English UI; euros, grams and kilograms by default (also ml/L and units); Spanish number formats.
- **Legal**: privacy policy, terms (including the recipe licence and the rule that recipes pass to "Sistema" on account deletion), reporting under the Digital Services Act, minimum age 14.
- **Visual identity**:
  - The provided safeBAItes logo, and self-hosted fonts only.
  - A minimal, cozy and distinctive look with chamfered-corner controls and dynamic interaction states.
  - Light and dark themes, accessible contrast, optimised images.
- **Performance**: Core Web Vitals and JavaScript budgets, lists that render only what's on screen, API latency targets under load, and stateless servers that scale horizontally.
- **Hosting**: the public address is `https://safebaites.isaacgarcia.stream/`. It is defined in the change `setup-domain-email-and-keepalive`.

## Capabilities

### New Capabilities

- `identity/authentication`: registration, account activation and password reset with one-time codes, email/password and Google sign-in, sessions, sign-out.
- `identity/account-management`: alias, password and email changes, active sessions, data export, account deletion and what happens to the user's content.
- `security/abuse-protection`: rate limits, wrong-attempt cooldowns, temporary blocks by account, IP and device ID, CAPTCHA escalation, generic responses.
- `security/application-hardening`: secret handling, browser storage rules, cookie and session security, encryption, security headers, input validation, injection, XSS and CSRF defences, audit logging.
- `household/preferences`: onboarding wizard and editable household profile (size, dietary restrictions, exclusions, cuisines, days and meals, supermarkets, budget, prep day).
- `household/kitchen-equipment`: equipment inventory and how it filters recipes.
- `catalog/ingredients`: generic ingredients, allergens, nutrition, units and conversions, user-private custom ingredients.
- `catalog/supermarket-products`: products per supermarket chain with pack sizes, mapped to generic ingredients.
- `pricing/product-prices`: price resolution (user, community, estimate), price entry, validation and limits.
- `recipes/recipe-catalog`: system recipes, attributes, allergen and nutrition derivation, variety coverage, high-protein and healthy defaults, browsing, search, filters, favourites.
- `recipes/user-cookbook`: creating, editing and versioning user recipes; the personal cookbook; private and public visibility.
- `recipes/community-sharing`: publishing, author attribution, automatic checks, reports, moderation and admin review.
- `planning/weekly-meal-plan`: plan generation under constraints and budget, and editing meals per day.
- `planning/batch-prep-session`: prep-day timeline and storage (fridge or freezer) instructions.
- `shopping/shopping-list`: aggregated list per supermarket, pack selection, ticking off, differences after edits, pantry and leftovers.
- `shopping/purchase-tickets`: manual receipts, purchase history, planned-against-spent budget tracking.
- `platform/offline-sync`: installable PWA, offline operation, outbox, synchronization, conflict resolution, local data lifecycle.
- `platform/localization`: languages, content translations, number, currency and date formats, units display.
- `legal/terms-and-consent`: privacy policy, terms, health-data consent, age requirement, notices.
- `admin/back-office`: admin role, moderation queue, catalog and reference price maintenance.
- `platform/visual-identity`: logo usage, self-hosted typography, the chamfered control style and its interaction states, themes, accessibility of the visuals, image delivery.
- `platform/performance`: user-perceived speed budgets, rendering of long lists, API latency under load, horizontal scalability.

### Modified Capabilities

None. The project has no existing specs.

## Impact

- **Code**:
  - `safeBAItes_front/` is a new Angular 22 application (static, prerendered PWA). The deleted v21 scaffold is not reused.
  - New `safeBAItes_back/` (Node 24 LTS backend-for-frontend and API).
  - New `packages/shared/` (types, validation schemas, planner, allergen and unit logic).
  - New `supabase/` (migrations, row-level-security policies, seed data).
  - Root npm workspaces.
- **Services** (all on free tiers): Supabase (Postgres, Auth; EU region), Redis (Upstash, EU region), a Node host, an SMTP provider, Google Identity Services, Cloudflare Turnstile.
- **Dependencies**:
  - Frontend: `@angular/*@22`, `@angular/pwa`, `@angular/cdk`, `@jsverse/transloco` (MIT), `dexie`, `@fontsource/chakra-petch` and `@fontsource-variable/atkinson-hyperlegible-next` (OFL).
  - Backend: `fastify` and security plugins, `@supabase/supabase-js`, a Redis client, `zod`, `nodemailer`.
  - Tooling: `sharp` (image pipeline), `dependency-cruiser`, Lighthouse CI, k6, SonarQube Cloud.
- **Data**: ≥2,000 system recipes, ~400 generic ingredients with nutrition per 100 g from USDA FoodData Central (public domain), and products for 4 chains. All are generated once during development and committed as seed files.
- **Brand assets**: the logo and the button style reference are kept in `assets/brand/` inside this change.
- **Legal artefacts**: privacy policy, terms of service and moderation rules, published in Spanish and English.
