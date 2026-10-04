# safebits

Cocina el domingo. Come bien toda la semana.

safebits is a free, offline-first batch-cooking planner for Spain. It builds a weekly plan that respects every allergy, intolerance and the kitchen you actually have, gives you a timeline for prep day, and makes a shopping list per supermarket that you tick off in the aisle.

The product is built in 17 ordered changes, planned with [OpenSpec](openspec/). This repository currently contains the foundation: the workspace and its quality gates.

## Architecture

| Workspace | What it is |
| --- | --- |
| `safebits_front` | Angular 22 PWA: standalone, zoneless, signal-based, OnPush by default, lazy routes |
| `safebits_back` | Node 24 LTS API on Fastify, with zod-validated configuration |
| `packages/shared` | TypeScript shared by front and back: constants, types, schemas and domain logic |
| `tools/lint` | The project's own lint rules and quality checks, with their tests |

Later changes add `safebits_edge` (the Cloudflare Worker), `supabase/` (database) and the features. The approved visual design is kept locally in `safebits-diseno/` and is not committed.

## Prerequisites

- Node.js 24 (see `.nvmrc`). With nvm: `nvm install 24` then `nvm use 24`.
- npm 11, which ships with Node 24.

## Getting started

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

`npm start -w @safebits/front` serves the app at `http://localhost:4200`. The API starts with `npm start -w @safebits/back` after `npm run build`, using the variables documented in `safebits_back/.env.example`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run lint` | ESLint (including the local rules), Biome for CSS, the comment check for CSS, SQL and JSON, and the architecture rules |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run typecheck` | Strict type-checking of every workspace |
| `npm test` | Unit and integration tests with coverage thresholds in every workspace |
| `npm run build` | Builds the shared package, the API and the app |
| `npm run check:install-flags` | Rejects `overrides`, `resolutions`, `legacy-peer-deps` and `force` |

## Engineering standards

Every rule is enforced by tooling in CI. See [docs/standards.md](docs/standards.md).
