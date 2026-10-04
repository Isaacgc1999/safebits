# Proposal

## Why

The owner already has the domain `isaacgarcia.stream`, with DNS and proxy on Cloudflare and the portfolio served at the root. safeBAItes gets its own subdomain, `https://safebaites.isaacgarcia.stream`, so it never shares an origin, storage, cookies or loaded resources with the portfolio. That settles the two open questions of `create-safebaites-v1`:
- **Sending domain:** emails can be sent from a domain we own, through Resend's free tier (3,000 emails a month, 100 a day) in Resend's EU region.
- **Supabase pause:** Supabase Free pauses projects after a week without database activity, so the database needs a scheduled heartbeat.

A budget of 100 emails a day is easy to exhaust, whether by bots, abuse or honest retries. Sending must therefore be rationed and protected so that registration and account recovery keep working. The domain also needs an enforced DMARC policy so nobody can send convincing phishing in its name.

## What Changes

- **Serve the app at `https://safebaites.isaacgarcia.stream/`** from a Cloudflare Worker attached as a Custom Domain:
  - The static PWA is served from Cloudflare's edge, so the app opens instantly even while the free backend is asleep.
  - Only `/api/*` is proxied to the Node backend.
  - The portfolio at the root is untouched.
- **Redirect the old path:** `https://isaacgarcia.stream/safebaites[/*]` permanently redirects to the same path on the subdomain, through a Cloudflare Redirect Rule. The portfolio's code isn't touched.
- **Lock the backend behind the edge:** direct requests to the backend's host address are rejected, and the client IP used for rate limits comes only from Cloudflare.
- **Send email with Resend in its EU region** from `no-reply@safebaites.isaacgarcia.stream`:
  - Authenticated with SPF, DKIM and DMARC.
  - Fixed templates with no user-supplied text and no tracking.
  - Inbound `contacto@isaacgarcia.stream` forwarded to the owner, through Cloudflare Email Routing (free).
- **Tighten DMARC in stages:** `p=none` while monitoring, then `quarantine`, then `reject` for the domain and all its subdomains.
  - A stage advances only after 14 consecutive days with at least 99% of our mail passing and every sender identified.
  - Reports are collected free by Cloudflare DMARC Management.
- **Protect the email budget:**
  - **Budgets:** global daily and monthly limits, with a reserve kept for password reset and email change.
  - **Abuse limits:** limits per recipient mailbox (aliases count together) and per IP.
  - **Address checks:** disposable and undeliverable addresses are rejected.
  - **Bot filters:** CAPTCHA on every form that sends email, plus a hidden honeypot field and a minimum time to fill the form.
  - **Suppression:** bounced and complaining addresses are blocked, based on signed provider webhooks.
  - **Failures:** a clean recovery when sending fails.
  - **Monitoring:** usage is shown to admins, with alerts.
- **Keep-alive:** a Cloudflare cron trigger runs a heartbeat at most 6 days apart. It writes to and reads from the production database and touches Redis, retries to cover backend cold starts, and alerts the operator when it fails. Admins can see the last heartbeat and run one on demand.
- **Relationship with `create-safebaites-v1`:** this change builds on v1 and must be applied after it or alongside it. v1's design and tasks already point here for the edge, the domain, email and keep-alive. Cookie names are `__Host-sb-sid` and `__Host-sb-did`.

## Capabilities

### New Capabilities

- `platform/web-hosting`: the public address on the subdomain, the redirect from the old path, deep links, isolation as its own origin, static delivery from the edge, the backend reachable only through the edge, the trusted client IP, cookie naming, headers and cache policy for static files.
- `platform/email-delivery`: the authenticated sender, EU processing, staged and enforced DMARC, which emails are allowed and what they contain, global and per-recipient and per-IP sending limits, address quality checks, bot filtering, bounce and complaint suppression, failure handling, usage monitoring, and the inbound contact mailbox.
- `platform/service-keepalive`: the scheduled heartbeat that keeps the database active, its retries, its protected endpoint, failure alerts, visibility for admins, and manual runs.

### Modified Capabilities

None. The v1 capabilities are still in an unarchived change, so the rules here are added as new capabilities that apply on top of them. Where both set a limit, the stricter one applies.

## Impact

- **Code:**
  - New `safeBAItes_edge/` workspace (Cloudflare Worker with static assets, API proxy and cron trigger).
  - `safeBAItes_front`: base href `/`, service worker scope and manifest at the root.
  - `safeBAItes_back`: edge-authentication hook, client IP from the edge, a Resend `Mailer` adapter, email budget and limit modules, webhook endpoint, heartbeat endpoint, admin panel data.
  - `packages/shared`: mailbox normalisation.
- **Database:** `email_send_log`, `email_suppressions`, `private.webhook_events`, `private.heartbeat`, plus Supabase Cron jobs to keep them small.
- **External setup:**
  - Cloudflare: Worker Custom Domain, Redirect Rule, cron trigger, DNS records for Resend (DKIM, SPF, bounce MX), staged DMARC record, DMARC Management, Email Routing.
  - Resend: account, verified domain in the EU region, sending-only API keys, webhook.
  - Google OAuth and Turnstile configured for `safebaites.isaacgarcia.stream`.
- **Dependencies:** `resend` (Node SDK) and `wrangler` with the Workers Vitest integration (dev only). A vendored disposable-email-domains list (CC0, licence file included).
- **Cost:** still €0. Everything runs on free tiers, and the domain is already owned.
