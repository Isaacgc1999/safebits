# Tasks

## 1. Workspace

- [x] 1.1 Create the root `package.json` with npm workspaces (`safebits_front`, `safebits_back`, `safebits_edge`, `packages/*`), `.nvmrc` = 24, `engines.node` ">=24 <25 || >=26" and `engine-strict`; verify `npm install` at the root succeeds and `npm ls --workspaces` lists the workspaces
- [x] 1.2 Generate a new Angular 22 application in `safebits_front` with Angular CLI 22 (standalone, zoneless, routing, strict, Vitest unit-test builder, no SSR server), create the `core/`, `features/` and `shared/<kind>/` folders, and strip every generated comment; verify `npx ng version` reports 22.x and the build passes
- [x] 1.3 Create `safebits_back` (Node 24, TypeScript, Fastify) with `modules/` and `shared/<kind>/` folders and a placeholder `GET /api/health`; verify a test calls the endpoint and receives 200
- [x] 1.4 Create `packages/shared` with the folders `constants`, `enums`, `types`, `interfaces`, `models`, `schemas`, `mappers`, `utils`, `domain` and an exported entry point; verify the front and the back both compile an import from it
- [x] 1.5 Add the zod-validated environment config to the back (fails fast on a missing or invalid variable) and `.env.example`; verify startup exits with a clear error when a required variable is missing

## 2. Strict typing, lint and architecture rules

- [x] 2.1 Add `tsconfig.base.json` with every flag of design decision 5, extended by all workspaces, plus the Angular strict template options; verify type-checking passes and fixtures with an implicit `any` or an unchecked index access fail
- [x] 2.2 Configure ESLint (typescript-eslint `strict-type-checked` and `stylistic-type-checked`, angular-eslint including `prefer-on-push-component-change-detection`, `prefer-signals` and `prefer-standalone`, the size and complexity limits, `noInlineConfig`, bans on `innerHTML` and `bypassSecurityTrust*`), Biome for CSS (replacing stylelint, whose `braces` dependency has an unfixed high-severity advisory) and Prettier; verify each rule fails on a fixture and the codebase passes with `--max-warnings 0`
- [x] 2.3 Write the local ESLint rules `local/no-comments`, `local/declarations-in-shared` and `local/lazy-feature-routes` in `tools/lint`, with their own tests; verify 100% coverage of the rules and failing fixtures for each
- [x] 2.4 Write `tools/lint/check-no-comments` for CSS (parsed with postcss), SQL and JSON files; verify it fails on a fixture with a comment for each file type
- [x] 2.5 Configure dependency-cruiser with the layer rules of design decision 4; verify a violating fixture fails and the codebase passes
- [x] 2.6 Add the generic building blocks `EntityStore<TEntity, TId>`, `ListState<T>` and the `Repository<TEntity>` port token in `safebits_front/src/app/shared/`, with unit tests; verify they are fully typed and covered

## 3. Tests and coverage

- [x] 3.1 Configure Vitest with v8 coverage thresholds of 90% (lines, branches, functions, statements) in every workspace; verify a run below a threshold fails

## 4. CI and repository protection

- [ ] 4.1 Add the GitHub Actions workflow from design decision 9; verify a pull request runs every step and a deliberately failing step blocks the run
- [x] 4.2 Add the install-flag check (no `overrides`/`resolutions`, no `legacy-peer-deps`/`force`) and gitleaks secret scanning; verify fixtures for both fail
- [ ] 4.3 Add the SonarQube Cloud analysis with the quality gate of design decision 8 to the workflow, running on pushes to `main` only once the `SONAR_TOKEN` secret exists; verify a pull request skips it
- [ ] 4.4 Enable CodeQL; verify it runs on the repository
- [ ] 4.5 Protect `main` with a ruleset (no direct or force pushes, pull request required, every check required) and delete branches when their pull request is merged or closed; verify the rules apply to `main`, a pull request with a failing check cannot be merged, and a closed pull request's branch is deleted

## 5. Documentation

- [x] 5.1 Write `README.md` (product summary, architecture overview, prerequisites, scripts) and `docs/standards.md` (every rule and how it is enforced); verify a fresh clone runs lint, tests and build by following the README
