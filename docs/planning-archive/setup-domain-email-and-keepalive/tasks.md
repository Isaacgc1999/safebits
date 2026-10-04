# Tasks

> Builds on `create-safebaites-v1`. Apply after it, or interleave: v1's design and tasks already leave the edge, the domain, Resend and the keep-alive to this change. Every task also meets v1's engineering standards (design decision 18), and each group keeps 90% coverage.

## 1. Edge Worker on the subdomain

- [ ] 1.1 Attach a hello-world Worker as the Custom Domain `safebaites.isaacgarcia.stream`, and create the Single Redirect rule for `isaacgarcia.stream/safebaites[/*]`. Record the final rule expression in `docs/edge.md`. Verify:
  - `https://safebaites.isaacgarcia.stream/` returns the hello-world body and `https://isaacgarcia.stream/` still serves the portfolio;
  - `/safebaites` redirects 301 to `https://safebaites.isaacgarcia.stream/`;
  - `/safebaites/plan?semana=42` redirects 301 to `https://safebaites.isaacgarcia.stream/plan?semana=42`
- [ ] 1.2 Create the `safeBAItes_edge` workspace (wrangler, TypeScript, Workers Vitest integration, `shared/<kind>/` folders), with assets at the root, `not_found_handling = "single-page-application"`, `run_worker_first = ["/api/*"]` and JSON 404 for unknown API paths; verify Worker tests for a deep-link reload and an unknown API path
- [ ] 1.3 Implement the API proxy: strip client `x-sb-*`, `x-forwarded-*` and `forwarded` headers; add `x-sb-edge-auth` and `x-sb-client-ip` from `CF-Connecting-IP`; stream bodies; let only versioned catalog chunks be cached; verify Worker tests that a spoofed header never reaches the origin, the edge headers are present and personal responses are never cached
- [ ] 1.4 Add a build step that generates `_headers` (CSP with `font-src 'self'` and the `autoCsp` inline-script hashes read from the built `index.html`, HSTS, `frame-ancestors 'none'`, nosniff, referrer and permissions policies, `immutable` for hashed assets, `no-cache` for `index.html`, `ngsw.json`, `ngsw-worker.js` and the manifest); verify a test that the hashes in `_headers` match `index.html` and a `wrangler dev` header check passes

## 2. Frontend at the root of the subdomain

- [ ] 2.1 Set `baseHref` to `/`, the API base to `/api`, the service worker scope to `/`, the manifest `start_url` and `scope` to `/`, and exclude `/api/**` from `navigationUrls`; verify Playwright against `wrangler dev`: reloading `/plan` works, and the requests of a full journey go only to the app's origin plus the Google and Turnstile widgets
- [ ] 2.2 Configure local development (Angular dev server proxying `/api` to `localhost:3000` with the development edge secret); verify `npm start` serves the app and API calls reach the backend

## 3. Backend behind the edge

- [ ] 3.1 Add the `onRequest` edge-authentication hook (constant-time comparison against the `EDGE_SECRETS` list, 404 otherwise) with only `GET /healthz` exempt, and keep all routes under `/api`; verify integration tests: no secret gives 404, an old and a new secret both work during rotation, `/healthz` returns `ok` without touching dependencies
- [ ] 3.2 Take the client IP from `x-sb-client-ip` only after the edge secret checks out (validated IP format), with `trustProxy` off; verify an integration test that a spoofed `X-Forwarded-For` does not change rate-limit keys
- [ ] 3.3 Confirm the `__Host-sb-sid` and `__Host-sb-did` cookies (set in v1) are host-only on the subdomain and that the backend ignores cookies scoped to the parent domain; verify the parent-domain-cookie scenario test
- [ ] 3.4 Update `docs/security.md` (from v1 task 5.10) with the edge architecture, edge secret rotation and the client IP rule; verify each web-hosting spec requirement maps to a section

## 4. Sending email with Resend (EU region)

- [ ] 4.1 Create the Resend account and verify `safebaites.isaacgarcia.stream` with the EU sending region: add DKIM, SPF and bounce MX in Cloudflare as DNS-only, and disable open and click tracking. Record the records in `docs/email.md`; verify Resend shows the domain verified in the EU region and a test email to Gmail shows spf=pass, dkim=pass with `d=safebaites.isaacgarcia.stream`, and dmarc=pass
- [ ] 4.2 Set up Cloudflare Email Routing so `contacto@isaacgarcia.stream` forwards to the operator's inbox; verify an external test email arrives
- [ ] 4.3 Publish DMARC stage 0 at `_dmarc.isaacgarcia.stream` (`p=none; sp=none; adkim=s; aspf=r; fo=1`, `rua` to Cloudflare DMARC Management) and enable DMARC Management; verify the record resolves and the first aggregate reports appear in the dashboard
- [ ] 4.4 Implement `ResendMailer` (official SDK, sending-only key, retries at 0/2/8 s on 429 and 5xx, no retry on other 4xx, unique `dedupe_key`), selected by `MAILER=resend|smtp`, with `SmtpMailer` kept for development and tests; verify unit tests with a mocked SDK for retries and duplicate prevention, and existing Mailpit tests still pass
- [ ] 4.5 Finalise the es/en templates (only the code, expiry and fixed text; plain text plus HTML; no remote images; footer pointing to `contacto@isaacgarcia.stream`); verify snapshot tests, and a test that a name or alias containing a URL never appears in any rendered email

## 5. Email budget and abuse protection

- [ ] 5.1 Add migrations for `email_send_log`, `email_suppressions` and `private.webhook_events`, with deny-all RLS and Supabase Cron purges (30 days and 7 days); verify `supabase db reset` and SQL tests of the purge functions
- [ ] 5.2 Implement mailbox normalisation and HMAC hashing in `packages/shared/src/utils` (lowercase, `+tag`, Gmail dots, googlemail → gmail); verify unit tests for the alias-variants scenario
- [ ] 5.3 Implement the atomic budget reservation in Redis (rolling 24 h sorted set plus UTC month counter; activation class 80/day and 2,700/month; all emails 95/day and 2,950/month; release on failure) and rebuild the counters from `email_send_log` when Redis is empty; verify tests with a fake clock at every threshold and after a Redis flush
- [ ] 5.4 Add per-mailbox (3/hour, 6/24 h) and per-IP (10/24 h) limits on every email-triggering endpoint, with generic responses; verify integration tests for both limits, stacked on v1's limits
- [ ] 5.5 Implement address quality checks (syntax and length; vendored CC0 disposable-domain list with its licence file; MX then A/AAAA lookup with a 3 s timeout, 24 h cache, and allow-on-timeout with a logged warning) on registration and email change; verify tests with mocked DNS for the disposable, no-mail-server and timeout cases
- [ ] 5.6 Add the signed form-token endpoint (`/api/auth/form-token`), the honeypot and the 2 s minimum, plus Turnstile on code resend and email change; verify integration tests that a silent discard returns the normal response and writes no account or send-log row
- [ ] 5.7 Wire the check order (CAPTCHA → form/honeypot → address → IP → mailbox → v1 limits → suppression → budget → send), send-failure recovery (delete the code, release the cooldown and the reservation, user message) and the provider circuit breaker; verify integration tests for the provider-unavailable and provider-quota scenarios
- [ ] 5.8 Implement the Resend webhook endpoint `/api/webhooks/resend` (signature check, ±5 min timestamp tolerance, idempotency per event ID, hard bounce and complaint add a suppression) and register it in Resend; verify tests with valid, forged and replayed payloads
- [ ] 5.9 Frontend: honeypot and form token on every email form, with the es/en messages for temporary unavailability, invalid address and send failure; verify Playwright tests of each message

## 6. Keep-alive heartbeat

- [ ] 6.1 Add the `private.heartbeat` migration and `POST /api/internal/heartbeat` (edge secret plus bearer token, otherwise 404; 6 per hour; heartbeat write, reads of `recipes` and `profiles`, Redis `SET heartbeat:last`); verify integration tests for an unauthorised call and a successful run that updates the row and the Redis key
- [ ] 6.2 Implement the Worker `scheduled` handler with `crons = ["17 6 */6 * *"]`, attempts at +0, +2 and +5 min, and one alert email through the Resend API with the Worker's sending-only key when all fail; verify Worker tests with mocked fetch (succeeds on the second attempt; all fail sends exactly one alert) and a script showing a maximum gap of 6 days over 3 years
- [ ] 6.3 Add the admin panel: email usage (last 24 h and this month by type, remaining budgets, suppressed count, 80% warning), last heartbeat with a warning past 6 days, a "Ejecutar heartbeat" button and clearing a suppression; verify Playwright as an admin for each item and the 76-email warning scenario

## 7. Production setup and integration

- [ ] 7.1 Configure Google OAuth (origin `https://safebaites.isaacgarcia.stream`, redirect `/api/auth/google/callback`, consent screen URLs on the subdomain) and the Turnstile hostname `safebaites.isaacgarcia.stream`; verify Google sign-in and a Turnstile-protected registration work in production
- [ ] 7.2 Deploy the backend to Render with `EDGE_SECRETS`, `HEARTBEAT_TOKEN`, `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` and `MAILER=resend`, and the edge Worker with `ORIGIN_URL`, `EDGE_SECRET`, `HEARTBEAT_TOKEN`, `RESEND_ALERT_KEY`, `OPERATOR_EMAIL`, its assets and its cron; verify `https://safebaites.isaacgarcia.stream/` loads, the portfolio is unchanged, and the Render URL returns 404 except `/healthz`
- [ ] 7.3 Production smoke checks: header check on HTML and API responses, a real activation email with authentication results checked, a manual heartbeat run with the database row confirmed, and a test bounce (Resend's bounce test address) creating a suppression; record each in `docs/release-checklist.md`; verify every item is ticked
- [ ] 7.4 Update `docs/deployment.md` (edge, secrets and rotation, DNS records, rollback steps, free-tier limits) and the es/en privacy policy's list of service providers (Cloudflare, Resend in its EU region); verify the docs list every secret and the published privacy page names both providers

## 8. DMARC enforcement after launch

- [ ] 8.1 After 14 consecutive days of reports meeting the exit criteria (at least 99% of the app's mail passing DMARC, every source identified, no legitimate failures, normal bounce rate), move to stage 1 (`p=quarantine; sp=quarantine`) and log the date and figures in `docs/email.md`; verify the record resolves with the new policy and production emails still arrive in the inbox
- [ ] 8.2 After another 14 consecutive days meeting the same criteria, move to stage 2 (`p=reject; sp=reject`), within 8 weeks of the first production email, and log it; verify the record shows `p=reject` and `sp=reject`, and a spoofed test message claiming `no-reply@safebaites.isaacgarcia.stream`, sent to Gmail from an unauthorised server, is rejected
- [ ] 8.3 Document the rollback rule (drop one stage on legitimate failures, fix, restart the 14-day window) and a monthly report review in `docs/email.md`; verify the procedure is listed in the release checklist
