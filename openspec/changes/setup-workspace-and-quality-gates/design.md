# Design

## Context

- **Repository:** GitHub `Isaacgc1999/safebits`. It currently holds:
  - `openspec/`;
  - the approved design source `safebits-diseno/`;
  - brand sources in `docs/brand/`;
  - the superseded plans in `docs/planning-archive/`.
- **No application code exists.**
- **Upstream versions:** Angular 22.2.1 (engines `^22.22.3 || ^24.15.0 || >=26`). Node 24 "Krypton" is the active LTS; Node 26 becomes LTS in late October 2026.
- **Owner's standards** are recorded in `openspec/config.yaml` and are made enforceable here.

## Goals / Non-Goals

**Goals:**
- Every standard that can be checked by a machine is checked in CI and blocks merging.
- A developer, or an AI assistant, can start any later change on a working, fully gated skeleton.

**Non-Goals:**
- Deployment, environments and the edge (change 2).
- Any product feature.

## Decisions

### 1. Repository layout

```
safeBAItes_app/
  package.json            npm workspaces: safebits_front, safebits_back, safebits_edge, packages/*
  tsconfig.base.json      strict flags shared by every workspace
  safebits_front/         Angular 22 PWA
  safebits_back/          Node 24 + Fastify API
  packages/shared/src/    constants/ enums/ types/ interfaces/ models/ schemas/ mappers/ utils/ domain/
  supabase/               migrations, seed (later changes)
  tools/                  lint/ (local rules), seed/, brand/, load/ (later changes)
  safebits-diseno/        approved design source (read-only reference)
  docs/                   brand/, planning-archive/, standards and runbooks
```

**Folders inside each app:**
- **Front:** `core/` (providers, interceptors, guards); `features/<feature>/` (pages, components, services, stores); `shared/` with `constants`, `enums`, `types`, `interfaces`, `models`, `mappers`, `utils`, `ui`, `pipes`, `directives`.
- **Back:** `modules/<module>/` (routes, handlers, services, repositories); `shared/` with the same kinds plus `schemas`.

### 2. Versions

- **Angular:** a new application generated with Angular CLI 22: standalone, zoneless, routing, strict, and the Vitest unit-test builder. Public routes are prerendered at build time, configured in change 4.
- **Node:** target 24 LTS (`.nvmrc`, `engines`, `engine-strict`); moving to 26 once it is LTS only changes configuration.
- **TypeScript:** the version Angular 22 requires, used everywhere.

### 3. Frontend conventions

- **Signals everywhere:**
  - Components use `input()`, `output()`, `model()` and `viewChild()`.
  - State lives in signal-based services and stores (`signal`, `computed`, `linkedSignal`).
  - Async data uses `resource` or `httpResource`.
  - RxJS is only used at integration boundaries and converted with `toSignal`.
- **Generic, typed building blocks** are reused instead of being re-implemented per feature:
  - `EntityStore<TEntity, TId>`;
  - `ListState<T>` (loading, empty, error, data);
  - `Repository<TEntity>` ports behind DI tokens. Their implementations are swapped per environment: API with a local cache, or local-only for the demo (change 17).
- **Rendering:** every component is standalone and OnPush. In Angular 22, OnPush is the default when `changeDetection` is omitted (the old default is now `ChangeDetectionStrategy.Eager`), so components omit it. The lint rule rejects any opt-out to `Eager` and any redundant explicit OnPush. Feature routes use `loadComponent` or `loadChildren`, and below-the-fold content uses `@defer`.
- **Enforcement:**
  - angular-eslint: `prefer-on-push-component-change-detection`, `prefer-signals`, `prefer-standalone`.
  - A local rule `local/lazy-feature-routes` rejects eager imports in route files.

### 4. Declarations and layers

- **Local rule `local/declarations-in-shared`:** reports any `interface`, `type`, `enum`, class model, or exported constant object or array declared outside a `shared/<kind>/` folder or `packages/shared`.
- **dependency-cruiser:**
  - features import only `shared` and `core`;
  - `shared` never imports features;
  - no cycles;
  - backend modules never reach into another module's internals.
- **Single responsibility:** one exported unit per file. ESLint enforces `max-lines-per-function` 40, `complexity` 8, `max-depth` 3 and `max-params` 3, and SonarQube cognitive complexity must be 10 or less.

### 5. Typing

- **TypeScript flags:** `strict`, `noImplicitAny`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `useUnknownInCatchVariables`, `verbatimModuleSyntax`.
- **Angular templates:** `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`.
- **typescript-eslint:** `strict-type-checked` and `stylistic-type-checked`, including `no-explicit-any`, the `no-unsafe-*` family, `no-non-null-assertion`, `explicit-function-return-type`, `explicit-module-boundary-types`, `consistent-type-imports` and `switch-exhaustiveness-check`.
- **External data** enters only through zod parsing into typed models.

### 6. No comments

- **ESLint rule `local/no-comments`:** reports every comment in TypeScript, JavaScript and Angular templates.
- **No exceptions through directives:** `linterOptions.noInlineConfig: true`.
- **Stylesheets:** `tools/lint/check-no-comments` parses CSS with postcss and rejects every comment. CSS quality is linted by Biome (recommended rules, formatter off), which replaced stylelint: every stylelint version depends on `braces`, which has an unfixed high-severity advisory (GHSA-vfj7-8cjw-p6xm), and the dependency rules forbid forced fixes.
- **SQL, JSON and configuration files:** `tools/lint/check-no-comments` rejects comments in `supabase/**/*.sql` and in JSON and JSONC files.
- **Generated files:** files generated by the Angular CLI are stripped of comments before their first commit.

### 7. Tests and coverage

Vitest with v8 coverage runs in every workspace (Angular through its unit-test builder). The thresholds are 90% for lines, branches, functions and statements, and a run below them fails.

### 8. Quality gate, dependencies and secrets

- **SonarQube Cloud** (free for public repositories): 0 bugs, 0 vulnerabilities, 0 code smells, 0 unreviewed security hotspots, duplication of 3% or less, and A ratings.
  - It runs on pushes to `main` only, and only once the `SONAR_TOKEN` secret exists. Pull requests skip it.
  - The same "Sonar way" rules run locally and on every pull request through `eslint-plugin-sonarjs` (`recommended` config) in `npm run lint`. They match what SonarQube for IDE shows in VS Code, but cover every file, not only open ones.
- **Dependencies:**
  - `npm audit` must report 0 vulnerabilities of any severity.
  - A script fails if `package.json` contains `overrides` or `resolutions`, or `.npmrc` enables `legacy-peer-deps` or `force`.
- **Secrets:** gitleaks scans every push.
- **Updates:** no update bot. Dependencies are upgraded by hand, and `npm audit` in CI catches new advisories.

### 9. CI and branch protection

- **Pipeline:** one GitHub Actions workflow on pull requests and on `main`: `npm ci` → lint → comment checks → dependency-cruiser → type-check → tests with coverage → build → audit and install-flag check → gitleaks → CodeQL → SonarQube (on `main` only).
- **Merging:** a repository ruleset on `main`, with no bypass, blocks direct pushes, force pushes and deletion, and requires a pull request and every check. No approval is required, because a solo maintainer cannot approve their own pull request.
- **Branches:** the repository deletes a branch when its pull request is merged, and the `branch-cleanup` workflow deletes it when the pull request is closed without merging.
- **Assumption:** the repository is public before CI is enabled, as it is a portfolio project. That makes branch protection and SonarQube Cloud free.

## Risks / Trade-offs

- **If the repository stays private, branch protection and unlimited SonarQube Cloud are not free.**
  - → Make it public, or run SonarQube Community Build in CI and rely on required status checks only.
- **The strict no-comments rule conflicts with files generated by tools.**
  - → Strip generated files once. Licence texts live in `LICENSE` files, not in code.
- **Very strict lint limits slow down early work.**
  - → They keep design debt from growing; the thresholds are reviewed once, after the first three changes.
