# Proposal

## Why

Every feature change must be deployable and verifiable on a production-like system from the start. The app also needs its public home on `https://safebits.isaacgarcia.stream`, isolated from the portfolio on the root domain. Free-tier services add two constraints:
- Supabase pauses idle projects, so the database needs a keep-alive.
- Render shares 750 instance hours a month across all free services, so uptime checks must be paced.

## What Changes

- **Environments:**
  - **Production:** `safebits.isaacgarcia.stream`.
  - **Staging:** `staging.safebits.isaacgarcia.stream`, protected by a credential and not indexed.
  - **Local:** for development.

  Each has its own database (two free Supabase projects, EU), its own cache (Upstash for production, Redis Cloud for staging) and its own secrets. Outside production, emails are captured instead of sent.
- **Edge:** one Cloudflare Worker codebase deployed per environment as a Custom Domain.
  - It serves the static PWA from the edge and proxies `/api/*` to the backend.
  - It sets the security and cache headers for static files.
  - Paths `/safebits` and `/safebaites` on the root domain redirect to the subdomain.
- **Backend locked behind the edge:** an edge secret, the client IP taken from Cloudflare only, a liveness endpoint, and a deep `/api/health`.
- **Promotion pipeline:**
  - Every merge to `main` deploys to staging, applies migrations, and runs the end-to-end and ZAP scans.
  - Production is deployed manually, and only for commits that passed staging.
- **Keep-alive:** a Cloudflare cron heartbeat at most 6 days apart in every environment. It does real database and cache activity and emails the operator through Cloudflare Email Routing if it fails.
- **Uptime monitoring:** an external monitor checks the page every 5 minutes and the API every 30 minutes, with outage and recovery emails, paced to fit the free hosting hours.
- **Environment badge** on every non-production screen.

## Capabilities

### New Capabilities

- `platform/web-hosting`: the public address, redirects from the root domain, deep links, own-origin isolation, the edge-served shell, a backend reachable only through the edge, the trusted client IP, cookie naming, static headers and cache policy.
- `operations/environments`: isolated production and staging, restricted staging, captured email outside production, promotion through staging, forward-only migrations, the environment badge.
- `operations/service-keepalive`: the scheduled heartbeat, real activity, retries, the protected endpoint, failure alerts, visibility and manual runs.
- `operations/uptime-monitoring`: external checks, outage alerts, the health endpoint, the free-hours budget.

### Modified Capabilities

None.

## Impact

- **Depends on** `setup-workspace-and-quality-gates`.
- **New:** `safebits_edge/` workspace, `supabase/` with the first migration (`private` schema and `private.heartbeat`), deployment workflows, and `docs/environments.md` and `docs/deployment.md`.
- **External setup:**
  - Cloudflare: Worker Custom Domains, a Redirect Rule, cron triggers, Email Routing with a verified operator address.
  - Supabase: two projects.
  - Render: two free services tracking the `staging` and `production` branches.
  - Upstash, Redis Cloud and UptimeRobot.
- **Later changes:** heartbeat visibility and the manual run in the admin back office are built in `add-community-and-moderation`, once admin access exists.
- **Cost:** €0.
