# Proposal

## Why

safebits is a greenfield project; the earlier Angular 21 scaffold was deleted. Before any feature is built, the repository needs its workspace structure and the automated gates that enforce the owner's engineering standards. That way every later change is held to the same rules from its first commit, instead of being cleaned up afterwards.

## What Changes

- **npm workspaces monorepo:**
  - `safebits_front`: a new Angular 22 application.
  - `safebits_back`: Node 24 LTS with Fastify.
  - `packages/shared`: code shared by front and back.
  - `safebits_edge` is added by `add-environments-and-edge-hosting`.
- **Strict TypeScript** configuration shared by every workspace.
- **Lint and format:**
  - ESLint, stylelint and Prettier, with zero warnings allowed.
  - Local rules: no comments anywhere, declarations only in `shared/<kind>/` folders, and the Angular conventions (standalone, OnPush, signals, lazy routes).
- **Layer boundaries** enforced by dependency-cruiser.
- **Generic building blocks** for the frontend: a typed entity store, list state, and repository ports.
- **Tests:** Vitest in every workspace, with 90% coverage thresholds.
- **CI on GitHub Actions:**
  - Lint, type-check, tests, build and comment checks.
  - Dependency audit with zero vulnerabilities, and secret scanning.
  - CodeQL and the SonarQube Cloud quality gate.
  - Renovate for updates, and branch protection that blocks merging on any failure.
- **Docs:** a README and `docs/standards.md` explaining every rule and how it is enforced.

## Capabilities

### New Capabilities

- `engineering/quality-gates`: the automated, merge-blocking checks for lint, comments, typing, declarations and layer boundaries, frontend conventions, coverage, code quality, dependency vulnerabilities and secrets.

### Modified Capabilities

None.

## Impact

- **New folders:** `safebits_front/`, `safebits_back/` and `packages/shared/`, plus root tooling (`package.json` workspaces, `tsconfig.base.json`, ESLint, stylelint and Prettier configs, `tools/lint/`, `.github/workflows/`, `renovate.json`).
- **Order:** change 1 of 17. Every later change depends on it.
- **Services:** GitHub Actions, and SonarQube Cloud (free for public repositories).
