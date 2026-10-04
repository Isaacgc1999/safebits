# Design

## Context

- **Domain** (checked on 2026-10-04): `isaacgarcia.stream` uses Cloudflare nameservers with the proxy enabled.
  - The root serves the owner's portfolio: an Angular single-page app with only first-party scripts, no service worker and no CSP meta tag.
  - It answers every unknown path, including `/safebaites`, with its own `index.html`.
  - There are no MX records at the root.
- **Owner's decision:** safeBAItes lives on its own subdomain, `safebaites.isaacgarcia.stream`, so it shares no origin, storage, cookies or loaded resources with the portfolio.
- **Base change:** `create-safebaites-v1` (not yet implemented). Its design and tasks already point to this change for the edge, the domain, email and keep-alive.
- **Resend Free:** 3,000 emails a month, 100 a day, 3 domains, webhooks included.
  - The API accepts 10 requests per second per team and answers 429 above that.
  - The owner confirmed that Resend can send from its EU region.
  - Its docs do not mention idempotency keys, so the design does not rely on them.
- **Supabase Free:** projects are paused after a week without "sufficient user database activity". Supabase warns by email about a week before pausing, and a paused project can be restored from the dashboard for up to 1 year.
- **GitHub Actions schedules:** they can be delayed or dropped under load, and are disabled after 60 days without activity in public repositories.

## Goals / Non-Goals

**Goals:**
- `https://safebaites.isaacgarcia.stream/` serves the app with no extra cost, and the app shell never waits for the sleeping backend.
- No more than 100 emails a day under any abuse pattern, with password recovery still available when registrations are capped.
- A DMARC policy of `reject` on the whole domain within 8 weeks of launch, reached without losing legitimate mail.
- The database is never paused by inactivity, and the operator learns about any failure.

**Non-Goals:**
- Changing the portfolio's code or how it is deployed.
- Paid email plans, dedicated IPs, BIMI (it needs a paid certificate), marketing email or newsletters.
- Keeping the Render free service warm. Cold starts are accepted; the edge-served shell hides them.

## Decisions

### 1. A Cloudflare Worker with static assets as a Custom Domain on the subdomain

```
   isaacgarcia.stream (portfolio, unchanged)        safebaites.isaacgarcia.stream
   /safebaites[/*] -- Redirect Rule 301 -------->   (Worker Custom Domain)
                                                              |
              +-----------------------------------------------+
              v
 +-------------------------------------------+
 | Worker "safebaites-edge" (+ static assets)|
 |  /api/*        -> run Worker:             |   HTTPS   +---------------------------+
 |     strip client x-sb-*, x-forwarded-*    | --------> | Render (Node 24 / Fastify)|
 |     add x-sb-edge-auth, x-sb-client-ip    |           |  onRequest: verify edge   |
 |  other paths   -> static assets           |           |  secret else 404          |
 |     (SPA fallback for navigations)        |           +------------+--------------+
 |  _headers: CSP, HSTS, cache rules         |                        |
 |  cron 17 6 */6 * * -> heartbeat           |              Supabase / Upstash / Resend
 +-------------------------------------------+
```

- **Custom Domain:** the Worker is attached to `safebaites.isaacgarcia.stream`. Cloudflare creates the DNS record and the certificate. The hostname belongs to this Worker alone, so nothing competes with the portfolio's routing.
- **Static files:** the Angular build output is the Worker's asset directory, served from the root.
- **Routing:**
  - `not_found_handling = "single-page-application"` gives deep links.
  - `run_worker_first = ["/api/*"]`, so API calls never fall back to `index.html`; the Worker answers unknown API paths with a JSON 404.
- **Proxy:** the Worker streams the request and response bodies, and API responses carry `Cache-Control: no-store` from the backend.
  - Exception: the public, versioned catalog chunks of v1 decision 19 carry `immutable` and may be cached at the edge.
- **Headers on static files:** a `_headers` file, generated at build time, sets:
  - the CSP, including the inline-script hashes produced by Angular `autoCsp`, read from the built `index.html`;
  - HSTS, `frame-ancestors 'none'`, nosniff, and the referrer and permissions policies;
  - caching: `immutable` for hashed assets and `no-cache` for `index.html`, `ngsw.json`, `ngsw-worker.js` and `manifest.webmanifest`.
- **Old path:** a Cloudflare Single Redirect rule on the zone (free plan) matches host `isaacgarcia.stream` with path `/safebaites` or `/safebaites/*`. It answers with a 301 to `https://safebaites.isaacgarcia.stream` plus the path without the prefix, keeping the query string. The exact rule expression is verified in task 1.1.
- **Why the shell comes from the edge:** Render Free sleeps after ~15 minutes, and a cold start takes about a minute. Serving the shell from Cloudflare makes the first paint instant and offline-ready, and only API calls wait for the backend. It also puts Cloudflare's DDoS protection and WAF in front of everything at no cost.
- **Alternatives considered:**
  - A path on the root domain: same origin as the portfolio (shared storage and cookie scope), plus a routing-precedence problem. Rejected by the owner.
  - Pointing the subdomain straight at Render: the shell would wait on cold starts, and the origin would be exposed.

### 2. The backend is reachable only through the edge

- **Edge secret:**
  - A Fastify `onRequest` hook compares `x-sb-edge-auth` against `EDGE_SECRETS` (a list, so a secret can be rotated without downtime) in constant time.
  - Requests without a match get 404.
  - The only exemption is `GET /healthz`, which Render's health check uses. It returns `ok` without touching any dependency.
- **Client IP:** taken from `x-sb-client-ip`, which the Worker copies from `CF-Connecting-IP`, and trusted only after the edge secret checks out. It is validated as an IP address. `trustProxy` is off.
- **Routes:** mounted under `/api`, so the Google callback and webhook URLs read the same everywhere.
- **Cookies:** `__Host-sb-sid` and `__Host-sb-did`. The `__Host-` prefix forbids a `Domain` attribute, so the parent domain cannot set or overwrite them. The `sb-` part keeps the names unique.
- **Local development:**
  - The Angular dev server proxies `/api` to `localhost:3000`, with an `EDGE_SECRETS` value for development.
  - `wrangler dev` is used for edge-specific tests.

### 3. Frontend at the root of its own origin

- **Build:** `baseHref: "/"`, and the API base is `/api`.
- **Service worker:** registered with `scope: "/"` on the subdomain only, so it can never control the portfolio, which is a different origin.
- **Manifest:** `start_url` and `scope` are `/`.
- **`ngsw-config.json`:** `navigationUrls` excludes `/api/**`.
- **Third-party settings:**
  - Google OAuth: authorised JavaScript origin `https://safebaites.isaacgarcia.stream`; redirect `https://safebaites.isaacgarcia.stream/api/auth/google/callback`; the consent screen's home, privacy and terms URLs on the subdomain.
  - Turnstile: hostname `safebaites.isaacgarcia.stream`.

### 4. Resend in the EU region as the production `Mailer`

- **Domain:** verify `safebaites.isaacgarcia.stream` in Resend with the EU sending region selected. The sender is `no-reply@safebaites.isaacgarcia.stream`: the same domain users see in the address bar, which builds trust and keeps the app's sending reputation separate from the root.
- **DNS records** (added in Cloudflare as DNS-only, not proxied): the DKIM TXT, plus the SPF TXT and bounce MX for the return-path subdomain that Resend lists for the EU region.
- **Alignment:**
  - DKIM is signed with `d=safebaites.isaacgarcia.stream`, so strict DKIM alignment (`adkim=s`) holds.
  - The return-path is a subdomain of the sender, so SPF passes with relaxed alignment (`aspf=r`).
- **Tracking:** open and click tracking are disabled for the domain.
- **Adapter:** `ResendMailer` implements v1's `Mailer` interface with the official `resend` SDK. `SmtpMailer` (Nodemailer to Mailpit) stays for local development and tests, and `MAILER=resend|smtp` chooses between them.
- **API keys:** keys restricted to sending from that domain only.
  - One lives in Render, for user emails.
  - A second lives in the Worker, for the keep-alive alert only (decision 10).
- **Retries:** on 429 or 5xx, retry at 0 s, 2 s and 8 s. No retry on other 4xx errors.
- **Duplicates:** our own `email_send_log.dedupe_key` (purpose, user and code-issue ID) is unique, so a retry never sends twice.
- **Templates** (es/en): plain text plus minimal inline-styled HTML with no remote images. They contain only the code, its expiry and fixed text, plus the footer "No respondas a este correo; escribe a contacto@isaacgarcia.stream".

### 5. Staged DMARC tightening

**One record, `_dmarc.isaacgarcia.stream`, covers the root and every subdomain:** `p=` sets the policy for the root and `sp=` for every subdomain, including `safebaites`. Day 0 is the first production email.

**Aggregate reports** (`rua`) go to Cloudflare DMARC Management, which is free in the dashboard for zones on Cloudflare. It parses the reports and lists every sending source.

| Stage | Earliest start | Record |
|---|---|---|
| 0 – Monitor | day 0 | `v=DMARC1; p=none; sp=none; adkim=s; aspf=r; fo=1; rua=mailto:<Cloudflare DMARC Management address>` |
| 1 – Quarantine | day 14 | the same with `p=quarantine; sp=quarantine` |
| 2 – Reject | day 28 | the same with `p=reject; sp=reject` (permanent) |

**Exit criteria for advancing one stage**, all over 14 consecutive days of reports:
- At least 99% of the messages from `safebaites.isaacgarcia.stream` pass DMARC.
- Every source is identified. Only Resend should appear; Email Routing forwards mail sent by other domains and never uses ours.
- No legitimate message fails.
- The bounce rate in Resend stays normal.

**Going back:** if legitimate mail fails, drop back one stage, fix the cause, and restart the 14-day window. The 8-week deadline in the spec leaves room for one rollback.

**Not used:**
- `pct`: at this volume a full switch per stage is simpler to evaluate.
- BIMI: it needs a paid certificate.

**Other records:**
- The root keeps the SPF record that Cloudflare Email Routing needs for forwarding.
- Subdomains that send no mail are protected by `sp`.

**Record keeping:** each stage change is logged in `docs/email.md` with its date and the report figures that justified it.

### 6. Email budget and limits in Redis, mirrored in Postgres

- **Two classes of email:**
  - `activation`: activation codes.
  - `recovery`: reset codes, email change codes, email-changed notices and operator alerts.
- **Global budget:**
  - The rolling 24-hour count is a sorted set of send timestamps.
  - The month (UTC) is a counter with a 40-day expiry.
  - An atomic Lua script reserves a slot only if the email's class is under its caps: activation up to 80 a day and 2,700 a month; all emails up to 95 a day and 2,950 a month.
  - A reservation is released when the send fails.
- **Mirror:** every attempt is written to `email_send_log`. If Redis loses its data, the counters are rebuilt from the log at startup and before the first send.
- **Mailbox normalisation** (in `packages/shared/src/utils`):
  - Lowercase.
  - Strip `+tag` for all domains.
  - For `gmail.com` and `googlemail.com`, remove dots and treat `googlemail` as `gmail`.
  - Limits key on `HMAC(normalised)`. Delivery always goes to the address exactly as entered.
- **Per mailbox:** sliding windows of 3 per hour and 6 per 24 hours. **Per IP:** 10 email-triggering requests per 24 hours. These apply on top of v1's limits (60 s cooldown, 5 per hour per account, 20 per hour per IP).
- **Order of checks** (cheapest first, and none of them uses budget):
  1. CAPTCHA
  2. Form token and honeypot
  3. Address quality
  4. Per-IP limit
  5. Per-mailbox limit
  6. v1 cooldown and per-account limits
  7. Suppression list
  8. Global budget reservation
  9. Send
- **Circuit breaker:** a quota or rate-limit error from Resend sets `email:paused`. For 429s it expires at the reset time Resend reports, or after 60 s if none is given. For a daily-quota error it lasts until the rolling window allows sending again.

### 7. Address quality

- **Syntax:** the zod email check plus a 254-character limit.
- **Disposable domains:** a vendored copy of the `disposable-email-domains` list (CC0, licence file included in the repo), refreshed at each release.
- **Mail server:** `dns.promises.resolveMx`, falling back to A/AAAA records, with a 3 s timeout and a 24-hour Redis cache per domain. If the DNS lookup times out, the address is allowed and a warning logged, so a slow DNS server never blocks real users.

### 8. Bot filtering

- **Form token:** `GET /api/auth/form-token` returns an HMAC-signed `{ issuedAt, formId }`. The server accepts it between 2 s and 30 min old.
- **Honeypot:** a field hidden visually and from assistive technology (`aria-hidden`, `tabindex=-1`, `autocomplete=off`).
- **Silent discard:** a filled honeypot, a submission that is too fast, or a missing token gets the normal response with no side effects.
- **CAPTCHA coverage:** Turnstile is required on code resend and email change too, as well as on registration and reset (v1).

### 9. Suppression from Resend webhooks

- **Endpoint:** `POST /api/webhooks/resend`. It is exempt from session and CSRF checks but still behind the edge.
- **Signature:** checked with Resend's signing secret, following the provider's verification method (Svix-style ID, timestamp and signature headers). Timestamps more than 5 minutes off are rejected.
- **Replays:** `private.webhook_events(event_id unique)` makes each event apply once.
- **Effect:** `email.bounced` (hard bounce) and `email.complained` add a row to `email_suppressions(mailbox_hash, reason, created_at, cleared_at)`.
- **Admin control:** admins can clear a suppression. Our list stops a send before any budget is used. Resend's own suppression list is a second safety net.

### 10. Keep-alive from a Cloudflare cron trigger

- **Where it runs:** the edge Worker declares `crons = ["17 6 */6 * *"]` (days 1, 7, 13, 19, 25 and 31 at 06:17 UTC). A script checked that the longest gap is 6 days.
- **Why Cloudflare rather than GitHub Actions:** GitHub schedules can be dropped under load and are disabled in public repositories after 60 days without commits. The Worker already exists, and cron triggers are part of Cloudflare's free plan.
- **The run:** the `scheduled` handler calls `POST /api/internal/heartbeat` on the origin with the edge secret and `Authorization: Bearer HEARTBEAT_TOKEN`.
  - Attempts at +0, +2 and +5 minutes, which covers a Render cold start.
  - If all fail, it sends one alert to `OPERATOR_EMAIL` through the Resend API directly from the Worker. The alert doesn't depend on the backend and counts as one recovery-class email.
- **Backend handler:** uses the privileged connection to update `private.heartbeat`, read counts from `recipes` and `profiles`, `SET heartbeat:last` in Redis, and return the timings.
  - Rate limit: 6 per hour.
  - An admin endpoint exposes the last run and a "run now" action that calls the same function.
- **Fallback:** if Supabase still sends a pause warning, the cadence is one line of configuration. That warning email is the safety net that the activity is enough.

### 11. Data model additions

- `email_send_log(id, class, type, mailbox_hash, status, provider_message_id, dedupe_key unique, created_at)`.
- `email_suppressions`.
- `private.webhook_events`.
- `private.heartbeat(id = 1, last_at, last_ok_at, count)`.
- **RLS:** deny-all on all of these. Only the privileged backend modules access them.
- **Supabase Cron:** purges the send log after 30 days and webhook events after 7 days.
- **Code organisation:** the models, interfaces, enums and constants for these tables live in the `shared/<kind>/` folders (v1 decision 18).

### 12. Cloudflare Email Routing for the contact address

`contacto@isaacgarcia.stream` forwards to the operator's personal inbox. This adds Cloudflare's MX and SPF records at the root, which don't clash with Resend's records on the `safebaites` subdomain. The legal notice and DSA contact point in v1 use this address, and it also receives the DMARC failure reports enabled by `fo=1`, if any are sent.

## Risks / Trade-offs

- **A DMARC stage could reject legitimate mail.**
  - → Stages advance only on the 14-day exit criteria; there is a documented rollback; the only sender is Resend, with aligned DKIM.
- **The free tier caps new registrations at about 80 a day.**
  - → Acceptable for a portfolio. If demand grows, a paid Resend plan only changes the caps in config.
- **Normalising "+tag" for non-Gmail providers may group mailboxes that are really different.**
  - → It only makes the limits stricter. Delivery is unaffected.
- **DNS lookups add latency to registration.**
  - → 3 s timeout, 24-hour cache, and allow on timeout.
- **The disposable-domain list goes stale.**
  - → It is refreshed at every release. Turnstile and the limits still apply.
- **One heartbeat every 6 days may not count as "sufficient activity" for Supabase.**
  - → Each heartbeat runs several queries. Supabase sends a warning email before any pause, and the cadence is configurable. A paused project can be restored for up to a year.
- **A leaked edge secret would let someone reach the backend directly.**
  - → Secrets are rotated through the `EDGE_SECRETS` list. Even with the secret, every v1 control still applies.
- **Cloudflare Workers free request limits.**
  - → Static assets are served without running the Worker script, and only `/api/*` and cron runs count. Edge caching of catalog chunks reduces the API calls. Usage is checked in the Cloudflare dashboard during the first weeks.

## Migration Plan

1. Attach the Worker Custom Domain (with a hello-world Worker first) and create the Redirect Rule. Verify that the portfolio is unaffected.
2. Add the Resend domain in the EU region with its DNS records, set up Email Routing, and publish DMARC stage 0 with Cloudflare DMARC Management.
3. Deploy the backend to Render with the new secrets (`EDGE_SECRETS`, `HEARTBEAT_TOKEN`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, `MAILER=resend`).
4. Deploy the edge Worker (`ORIGIN_URL`, `EDGE_SECRET`, `HEARTBEAT_TOKEN`, `RESEND_ALERT_KEY`, `OPERATOR_EMAIL`) with its assets and cron.
5. Update the Google OAuth and Turnstile settings.
6. Smoke test, then register the Resend webhook.
7. After launch, run the DMARC stages 1 and 2 according to their exit criteria.

**Rollback:**
- Detach the Custom Domain and remove the Redirect Rule.
- Email can return to SMTP by setting `MAILER=smtp`.
- DMARC goes back one stage by editing a single record.
- None of these steps touches user data.
