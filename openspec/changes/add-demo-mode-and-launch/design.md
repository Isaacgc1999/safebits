# Design

## Context

- **From earlier changes:**
  - Change 1: every feature reads and writes through `Repository<TEntity>` ports behind DI tokens.
  - Change 8: real implementations are local-first with sync.
  - Change 8: the catalog is delivered as versioned static-friendly chunks.
  - Change 4: the demo banner component, derived from the design's sky notice pattern.
- **Certificates:** Workers Custom Domains issue a certificate for the second-level subdomain `demo.safebits.isaacgarcia.stream` at no cost.

## Goals / Non-Goals

**Goals:**
- The demo shows the real product: the same components, rules and planner, with local data only.
- Physically impossible to reach real users' data from the demo.

**Non-Goals:**
- A shared or multi-user demo backend, or a demo of email flows.

## Decisions

### 1. Demo build and hosting

- **Build:** an Angular build configuration `demo` that sets `appMode = 'demo'` and calls `provideDemoMode()`. It omits the web manifest and the service worker registration, so the demo is not installable.
- **Edge:** the `safebits_edge` environment `demo` is attached as a Custom Domain. It serves only static assets, answers `/api/*` with 404, and sets `X-Robots-Tag: noindex`.
  - Its CSP sets `connect-src 'self'`, with no Google or Turnstile sources.
- **Deployment:** the demo deploys together with production in the `deploy-production` workflow.

### 2. Data

- **Repositories:** `provideDemoMode()` binds every `Repository<TEntity>` token to `DemoRepository<TEntity>`. It is backed by a separate Dexie database `sb-demo`, seeded from `assets/demo/fixture.json`.
  - The fixture holds a household of two, a planned week, a list, prep progress and a sample receipt.
  - It is generated from the seed catalog by a script, so it always matches the current catalog version.
- **Catalog:** its chunks are copied into `assets/demo/catalog/` at build time and served statically.
- **Reset:** "Restablecer demo" clears `sb-demo` and reloads the fixture. The first change stores a timestamp, and the next load after 24 hours resets automatically.

### 3. Feature flags

- **Flags:** a typed `FeatureFlags` provider (`auth`, `email`, `publish`, `report`, `communityPrices`, `accountExport`, `accountDeletion`, `admin`), all false in demo mode.
- **Gated actions:** gated actions open an `sb-sheet` reading "No disponible en la demo" with a peach "Crear cuenta" link to `https://safebits.isaacgarcia.stream/crear-cuenta`.
- **Price entry** stays local: no community contribution, but the user's own price is applied.

### 4. Launch

- **Checklist** (`docs/release-checklist.md`):
  - the full journey (register, activate, onboard, plan, prep, offline list, receipt, budget, publish, report, export, delete) in es and en on desktop Chrome and Edge and Android Chrome;
  - an installed iPhone app, including Google sign-in through the PKCE fallback;
  - the restore drill from change 16 completed;
  - a ZAP scan of production with no high or medium alerts;
  - the operations panels green.
- **DMARC:** stage 1 starts after 14 consecutive days of reports with at least 99% of the app's mail passing DMARC, every source identified, no legitimate failures and a normal bounce rate. Stage 2 follows after another 14 such days. Each change is logged in `docs/email.md`. If legitimate mail fails, the policy drops back one stage and the window restarts.

## Risks / Trade-offs

- **Visitors may mistake the demo for the real app.**
  - → The permanent banner, `noindex`, and no install option.
- **The fixture can drift from the catalog.**
  - → It is generated from the seed at build time, and a test checks that every referenced recipe exists.
- **DMARC enforcement could block legitimate mail.**
  - → Staged exit criteria and a one-step rollback.
