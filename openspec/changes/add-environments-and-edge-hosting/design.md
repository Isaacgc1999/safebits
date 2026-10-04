# Design

## Context

- **Domain** (checked on 2026-10-04): `isaacgarcia.stream` uses Cloudflare DNS with the proxy enabled, and serves the owner's portfolio (an Angular SPA) at the root. That SPA answers every unknown path with its `index.html`.
- **Cloudflare:** Workers Custom Domains issue a certificate for the hostname, including second-level subdomains such as `staging.safebits.isaacgarcia.stream`, without Advanced Certificate Manager.
- **Free-tier facts:**
  - Render: 750 free instance hours per workspace per month, shared by all free services. A service sleeps after ~15 min idle, and a cold start takes about a minute.
  - Supabase Free: two projects, each paused after a week without database activity.
  - Upstash Free: one database.
  - GitHub scheduled workflows can be dropped under load and are disabled after 60 days without commits in public repositories.
- **Base:** `setup-workspace-and-quality-gates` provides the workspaces and CI.

## Goals / Non-Goals

**Goals:**
- From this change on, every merge reaches a staging environment that behaves like production. Production is promoted by hand.
- The app shell never waits for the sleeping backend.
- Nobody can reach the backend except through the edge.

**Non-Goals:**
- Application features, the auth system, and the Resend email system (change 5).
- The admin screens for operations data (change 14).
- The demo environment (change 17).

## Decisions

### 1. Environments

| | Production | Staging | Local |
|---|---|---|---|
| Edge | Worker `safebits-edge` on `safebits.isaacgarcia.stream` | Worker `safebits-edge-staging` on `staging.safebits.isaacgarcia.stream` | Angular dev server |
| Backend | Render free `safebits-api` (branch `production`) | Render free `safebits-api-staging` (branch `staging`) | `node` |
| Database | Supabase `safebits-prod` (EU) | Supabase `safebits-staging` (EU) | `supabase start` |
| Cache | Upstash free (EU, TLS) | Redis Cloud free 30 MB (EU) | Redis container |
| Email | Resend (change 5) | capture mailer | Mailpit |
| Access | public | basic-auth gate + `noindex` | — |

The demo (`demo.safebits.isaacgarcia.stream`) has no backend and is added in change 17.

### 2. Edge Worker

- **One codebase per environment:** one `safebits_edge` codebase, with wrangler environments `production` and `staging`, each attached as a Custom Domain.
- **Static assets:**
  - `not_found_handling = "single-page-application"` gives deep links.
  - `run_worker_first = ["/api/*"]` in production, so API calls never fall back to `index.html`; unknown API paths get a JSON 404.
  - In staging `run_worker_first = true`, so the basic-auth gate also covers static files. Staging responses carry `X-Robots-Tag: noindex`.
- **Proxy:**
  - It strips client `x-sb-*`, `x-forwarded-*` and `forwarded` headers.
  - It adds `x-sb-edge-auth` (secret) and `x-sb-client-ip` (from `CF-Connecting-IP`), and streams the bodies.
  - It caches nothing except public versioned catalog chunks (change 8).
- **`_headers`:** generated at build time, with CSP and HSTS, `frame-ancestors 'none'`, nosniff, and the referrer and permissions policies. Hashed assets are `immutable`; `index.html`, `ngsw.json`, `ngsw-worker.js` and the manifest are `no-cache`. The CSP hashes come from Angular `autoCsp` once change 4 adds it.
- **Old paths:** a zone Single Redirect rule (free plan) matches host `isaacgarcia.stream` with paths `/safebits`, `/safebits/*`, `/safebaites` or `/safebaites/*`. It answers with a 301 to `https://safebits.isaacgarcia.stream` plus the path without the prefix, keeping the query string. The exact expression is recorded in `docs/edge.md`.

### 3. Backend behind the edge

- **Edge secret:** an `onRequest` hook compares `x-sb-edge-auth` against the `EDGE_SECRETS` list in constant time (the list allows rotation without downtime). Requests without a match get 404.
- **Liveness:** only `GET /healthz` is exempt; it answers `ok` without touching dependencies and is used by Render's health check.
- **Client IP:** read from `x-sb-client-ip` only after the edge secret checks out, and validated as an IP. `trustProxy` is off.
- **Health:** `GET /api/health` checks the database (`select 1`) and Redis (`PING`) with 2 s timeouts. It answers 200 or 503 and names failing dependencies only generically.
- **Database access in this change:** a privileged connection module used only by the heartbeat. The per-request RLS data layer arrives in change 3.

### 4. Promotion pipeline

- **`deploy-staging` workflow** (on push to `main`, after CI passes):
  1. `supabase db push` to staging.
  2. Fast-forward the `staging` branch to the commit; Render redeploys from it.
  3. `wrangler deploy --env staging`.
  4. Run the Playwright end-to-end suite and the ZAP baseline scan against staging, with the basic-auth credential.
  5. On success, set the commit status `staging-verified`.
- **`deploy-production` workflow** (`workflow_dispatch` with a commit SHA):
  1. Require `staging-verified` on that SHA.
  2. Require every migration file to appear in staging's applied migration list.
  3. `supabase db push` to production.
  4. Fast-forward the `production` branch to the SHA.
  5. `wrangler deploy --env production`.
- **Why branch fast-forwards:** Render's free services deploy from a tracked branch, which pins each environment to an exact, verified commit without paid features.

### 5. Migrations

Supabase CLI migrations live in `supabase/migrations/`. They only move forward and must be compatible with the previously deployed build. The first migration creates the `private` schema (not exposed to the Data API) and `private.heartbeat(id = 1, last_at, last_ok_at, count)`.

### 6. Keep-alive

- **Schedule:** each environment's Worker declares `crons = ["17 6 */6 * *"]` (days 1, 7, 13, 19, 25 and 31 at 06:17 UTC). A script checked that the longest gap is 6 days.
- **The run:** the `scheduled` handler calls `POST /api/internal/heartbeat` with the edge secret and `Authorization: Bearer HEARTBEAT_TOKEN`, at +0, +2 and +5 minutes, which covers a Render cold start.
- **Backend handler:** updates `private.heartbeat`, reads a count from a table, sets `heartbeat:last` in the cache, and is limited to 6 calls per hour.
- **Alerts:** when all attempts fail, the Worker emails the operator through the Cloudflare Email Routing `send_email` binding, to a verified destination address. That needs no Resend and no backend.
- **Visibility:** the admin panel and the manual run come in change 14. Until then the last heartbeat is visible in the database and the Worker logs.
- **Why Cloudflare cron rather than GitHub Actions:** it is reliable, it is not disabled by repository inactivity, and the Worker already exists.

### 7. Uptime monitoring

- **Monitor:** UptimeRobot (free), with an HTTPS check of the production page every 5 minutes and of `/api/health` every 30 minutes. Alerts go to the operator's email after two consecutive failures, followed by a recovery notice.
- **Pacing:** a 30-minute backend interval lets the service sleep between checks. A wake-up uses about 16 minutes of instance time per half hour at most, roughly 390 h a month, which leaves room for staging within the 750 free hours. Usage is reviewed monthly in `docs/environments.md`.
- **Timeouts:** the API check uses the longest timeout the plan allows, so a cold start is not counted as an outage on its own; two failures are required.

### 8. Environment badge

The Angular build configuration provides the environment name. Non-production builds show a fixed, accessible "Staging" badge. The production build contains no badge code path.

## Risks / Trade-offs

- **Real traffic could keep production awake and use most of the 750 hours, suspending staging late in the month.**
  - → Monthly review. If needed, staging is suspended manually while production is busy, or moved to a separate host.
- **UptimeRobot plan limits (interval, timeout, consecutive failures) may differ from the assumptions.**
  - → Task 6.1 verifies the actual settings and adjusts the intervals so the monitoring spec still holds.
- **The Email Routing `send_email` binding only sends to verified addresses.**
  - → That is exactly the operator use case. Users never receive mail through it.
- **A leaked edge secret would let someone reach the backend directly.**
  - → Rotation through `EDGE_SECRETS`, and every other control from change 3 still applies.
- **Staging shares the Render workspace with production.**
  - → It has separate services, databases and caches, so data never crosses.

## Migration Plan

1. Create the accounts and projects.
2. Deploy the hello-world Worker on both Custom Domains and the Redirect Rule, and check the portfolio is unaffected.
3. Deploy the backend skeleton to both Render services.
4. Apply the first migration to staging, then production.
5. Enable the cron triggers and the monitors.

**Rollback:**
- Detach a Custom Domain or disable the Redirect Rule.
- Re-point a Render branch to the previous commit.
- No user data exists yet.
