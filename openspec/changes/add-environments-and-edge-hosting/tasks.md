# Tasks

## 1. Accounts and projects

- [ ] 1.1 Create the Supabase projects `safebits-prod` and `safebits-staging` (EU), the Render free services `safebits-api` (branch `production`) and `safebits-api-staging` (branch `staging`), Upstash (production, EU, TLS) and Redis Cloud free (staging, EU). Record names, regions and owners, without secrets, in `docs/environments.md`; verify each service is reachable with its own credentials and that staging credentials are refused by production
- [ ] 1.2 Set up Cloudflare Email Routing for `contacto@isaacgarcia.stream` with the operator's address as a verified destination; verify an external test email arrives

## 2. Edge Worker

- [ ] 2.1 Create the `safebits_edge` workspace (wrangler, TypeScript, Workers Vitest integration, `shared/<kind>/` folders) with `production` and `staging` environments, and attach the Custom Domains `safebits.isaacgarcia.stream` and `staging.safebits.isaacgarcia.stream` using a hello-world build; verify both serve over HTTPS with valid certificates and `https://isaacgarcia.stream/` still serves the portfolio
- [ ] 2.2 Create the Single Redirect rule for `/safebits[/*]` and `/safebaites[/*]` on the root domain and record the expression in `docs/edge.md`; verify `/safebits` returns 301 to `https://safebits.isaacgarcia.stream/` and `/safebaites/plan?semana=42` returns 301 to `https://safebits.isaacgarcia.stream/plan?semana=42`
- [ ] 2.3 Configure static assets (SPA fallback, `run_worker_first` per design decision 2, JSON 404 for unknown API paths); verify Worker tests for a deep-link reload and an unknown API path
- [ ] 2.4 Implement the API proxy (strip client `x-sb-*`, `x-forwarded-*` and `forwarded` headers; add the edge secret and client IP; stream; no caching of personal responses); verify Worker tests that a spoofed header never reaches the origin and the edge headers are present
- [ ] 2.5 Implement the staging basic-auth gate (constant-time comparison, applied to assets and API) and `X-Robots-Tag: noindex`; verify tests that anonymous requests get 401 and authorised ones pass
- [ ] 2.6 Add the build step that generates `_headers` (CSP, HSTS, framing, nosniff, referrer and permissions policies, cache rules), ready to include the `autoCsp` hashes once change 4 adds them; verify a `wrangler dev` header check passes

## 3. Backend behind the edge

- [ ] 3.1 Add the edge-authentication hook with the `EDGE_SECRETS` rotation list and the `/healthz` exemption, and mount routes under `/api`; verify integration tests: no secret gives 404, old and new secrets both work, `/healthz` touches no dependency
- [ ] 3.2 Take the client IP from `x-sb-client-ip` only after the edge secret checks out, with `trustProxy` off; verify a test that a spoofed `X-Forwarded-For` is ignored
- [ ] 3.3 Implement `GET /api/health` (database `select 1` and Redis `PING` with 2 s timeouts, 200 or 503, generic dependency names); verify tests for healthy, database-down and cache-down cases
- [ ] 3.4 Define the app cookie name constants (`__Host-sb-sid`, `__Host-sb-did`) in `packages/shared/src/constants`, plus a helper that rejects any other cookie name; verify unit tests, including the parent-domain-cookie scenario

## 4. Migrations and keep-alive

- [ ] 4.1 Initialise `supabase/` with the first migration (`private` schema not exposed to the Data API, `private.heartbeat`) and the privileged connection module; verify `supabase db reset` locally and that `private` is not reachable through the Data API
- [ ] 4.2 Implement `POST /api/internal/heartbeat` (edge secret plus bearer token, otherwise 404; 6 per hour; database write and read, cache write); verify integration tests for an unauthorised call and a successful run
- [ ] 4.3 Implement the Worker `scheduled` handler (`crons = ["17 6 */6 * *"]`, attempts at +0, +2 and +5 min, one alert through the Email Routing `send_email` binding when all fail), enabled in both environments; verify Worker tests with mocked fetch (succeeds on the second attempt; all fail sends exactly one alert) and a script showing a maximum gap of 6 days over 3 years

## 5. Promotion pipeline

- [ ] 5.1 Write the `deploy-staging` workflow (migrations, branch fast-forward, wrangler deploy, Playwright smoke and ZAP baseline against staging, `staging-verified` commit status); verify a merge to `main` deploys to staging and sets the status
- [ ] 5.2 Write the `deploy-production` workflow (manual, requires `staging-verified` and staging's migration list, then migrations, branch fast-forward and wrangler deploy); verify it refuses an unverified commit and deploys a verified one
- [ ] 5.3 Add the environment badge to the Angular build configurations (visible "Staging" badge, none in production); verify unit tests and a staging screenshot showing the badge

## 6. Uptime monitoring

- [ ] 6.1 Create the UptimeRobot monitors (page every 5 min, `/api/health` every 30 min, alerts after two consecutive failures with recovery notices to the operator), adjusting intervals to the plan's real limits; verify by stopping the staging-like test target that an outage email and a recovery email arrive
- [ ] 6.2 Document the instance-hour budget and the monthly review in `docs/environments.md`; verify the first month's projection is within 750 hours

## 7. Documentation

- [ ] 7.1 Write `docs/deployment.md` (environments, secrets per environment and their rotation, promotion steps, rollback); verify a fresh environment can be redeployed by following it
