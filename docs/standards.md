# Engineering standards

Every standard below is checked automatically. A pull request cannot be merged while any check fails.

| Standard | How it is enforced |
| --- | --- |
| Zero lint findings | ESLint with `--max-warnings 0`, Biome for CSS with `--error-on-warnings` |
| No inline exceptions | ESLint `linterOptions.noInlineConfig`: disable directives are ignored and reported |
| No comments anywhere | [`no-comments`](#no-comments) for TypeScript, JavaScript and Angular templates; `tools/lint/dist/no-comments/cli.js` for CSS (parsed with postcss), SQL and JSON |
| Strict typing | `tsconfig.base.json` (strict, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` and more), Angular strict templates, typescript-eslint `strict-type-checked`, no `as` assertions |
| Declarations in shared folders | [`declarations-in-shared`](#declarations-in-shared) |
| Layer boundaries | dependency-cruiser (`.dependency-cruiser.json`): no cycles, no cross-feature or cross-module imports, shared code never imports features |
| Frontend conventions | angular-eslint: OnPush by default (Angular 22) with no opt-out to `Eager`, signal inputs and outputs, standalone components, `sb` selector prefix; [`lazy-feature-routes`](#lazy-feature-routes) |
| Single responsibility | `max-lines-per-function` 40, `complexity` 8, `max-depth` 3, `max-params` 3, and the SonarQube cognitive complexity limit |
| Security bans | No `innerHTML`/`outerHTML` writes or bindings and no `bypassSecurityTrust*` |
| Coverage | At least 90% lines, branches, functions and statements in every workspace; the lint tools themselves are held to 100% |
| Code quality | SonarQube Cloud quality gate: no bugs, vulnerabilities, code smells or unreviewed hotspots, at most 3% duplication |
| Dependencies | `npm audit --audit-level=info` must report nothing; `check:install-flags` rejects `overrides`, `resolutions`, `legacy-peer-deps` and `force`. Vulnerabilities are fixed only by upgrading or replacing the dependency |
| Secrets | gitleaks scans the full history on every push |
| Formatting | Prettier (`format:check`) |

## Local rules

The rules live in `tools/lint/src/eslint/rules`, each with its own tests.

### no-comments

Reports every comment in TypeScript, JavaScript and Angular templates. Intent is expressed with names, types and tests instead.

### declarations-in-shared

Interfaces belong in `shared/interfaces/`, type aliases in `shared/types/`, enums in `shared/enums/`, module-level literal constants in `shared/constants/` (or `schemas/` and `enums/`), and classes named `*Model` or `*Error` in `shared/models/`. In `packages/shared` the same folders sit directly under `src/`. Test files, route files, config files and `main.ts` are exempt.

### lazy-feature-routes

Route files must load features with `loadComponent` or `loadChildren`. A `component:` property or a value import from a `features/` folder is reported.

## Decisions

- **Biome instead of stylelint for CSS.** Every stylelint version depends on `braces`, which has an unfixed high-severity advisory (GHSA-vfj7-8cjw-p6xm). The dependency rules forbid forced fixes, so the linter was replaced.
- **OnPush is implicit.** Since Angular 22, omitting `changeDetection` means OnPush. Components omit it, and the lint rule rejects both an opt-out to `Eager` and a redundant explicit OnPush.
