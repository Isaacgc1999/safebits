# Design

## Context

- **Resend Free:** 3,000 emails a month, 100 a day, 3 domains, webhooks included, and 10 API requests per second.
  - The owner confirmed that Resend can send from its EU region.
  - Its docs do not mention idempotency keys, so the design does not rely on them.
- **Domain:** `isaacgarcia.stream` is on Cloudflare. The app lives at `safebits.isaacgarcia.stream` (change 2).
- **Other channels:** Cloudflare Email Routing already forwards `contacto@isaacgarcia.stream` to the operator, and the Worker sends operator alerts through its `send_email` binding. Neither uses Resend.

## Goals / Non-Goals

**Goals:**
- No more than 100 emails a day under any abuse pattern.
- Password recovery still works when registrations are capped.
- Strict DMARC alignment from day 0, so enforcement later carries no risk.

**Non-Goals:**
- Marketing email, newsletters and notification emails (notifications are in-app).
- DMARC stages 1 and 2 (change 17, after launch).

## Decisions

### 1. Adapters

- **`Mailer.send(message: TransactionalEmail): Promise<SendResult>`** has three implementations: `ResendMailer` (production), `CaptureMailer` (staging, which stores emails in `private.captured_emails` behind an admin-only test endpoint) and `SmtpMailer` (local, to Mailpit). The `MAILER` environment variable selects one; production refuses to start with anything but `resend`.
- **Retries:** `ResendMailer` uses the official SDK with a sending-only key restricted to the domain, and retries 429 and 5xx responses at 0, 2 and 8 s. Other 4xx responses are not retried.
- **Duplicates:** `email_send_log.dedupe_key` (purpose, user and code-issue ID) is unique, so a retry never sends twice.

### 2. Domain, DNS and DMARC stage 0

- **Resend domain:** `safebits.isaacgarcia.stream`, with the EU sending region selected. The DKIM TXT, the return-path SPF TXT and the bounce MX are added in Cloudflare as DNS-only records. Open and click tracking are disabled.
- **Alignment:** DKIM signs with `d=safebits.isaacgarcia.stream`, so strict DKIM alignment holds. The return-path is a subdomain, so SPF passes with relaxed alignment.
- **DMARC stage 0:** `_dmarc.isaacgarcia.stream` holds `v=DMARC1; p=none; sp=none; adkim=s; aspf=r; fo=1; rua=mailto:<Cloudflare DMARC Management address>`. Stages 1 (`quarantine`) and 2 (`reject`) advance after 14 consecutive clean days each (change 17). The exit criteria are:
  - at least 99% of the app's mail passes DMARC;
  - every source is identified;
  - no legitimate failures;
  - a normal bounce rate.

### 3. Templates

- **Types:** activation code, reset code, email-change code, and the email-changed notice, each in es and en, with the language taken from the account or the requesting screen.
- **Format:** plain text plus minimal inline-styled HTML, using the brand colours as text only, with no remote images.
- **Content:** only the code, its expiry and fixed text, plus the footer "No respondas a este correo; escribe a contacto@isaacgarcia.stream".
- **Snapshot tests** fix the output.

### 4. Budgets and limits (Redis, mirrored in Postgres)

- **Two classes of email:**
  - `activation`: activation codes.
  - `recovery`: reset codes, email-change codes and email-changed notices.
- **Global budget:**
  - The rolling 24-hour count is a sorted set of send timestamps.
  - The month (UTC) is a counter with a 40-day expiry.
  - An atomic Lua script reserves a slot only if the email's class is under its caps: activation up to 80 a day and 2,700 a month; all emails up to 95 a day and 2,950 a month.
  - A reservation is released when the send fails.
- **Mirror:** every attempt is written to `email_send_log`. If Redis loses its data, the counters are rebuilt from the log.
- **Mailbox normalisation** (in `packages/shared/src/utils`):
  - Lowercase.
  - Strip `+tag` for all domains.
  - For `gmail.com` and `googlemail.com`, remove dots and treat `googlemail` as `gmail`.
  - Limits key on `HMAC(normalised)`. Delivery always goes to the address exactly as entered.
- **Per mailbox:** 3 per hour and 6 per 24 hours. **Per IP:** 10 email-triggering requests per 24 hours. These apply on top of the code limits from change 6.
- **Circuit breaker:** a quota or rate-limit error from Resend sets `email:paused` until the provider's window resets. While it is set, requests behave as if the budget were exhausted.

### 5. Order of checks

Cheapest first, and none of them uses budget:
1. CAPTCHA
2. Form token and honeypot
3. Address quality
4. Per-IP limit
5. Per-mailbox limit
6. Code limits (change 6)
7. Suppression list
8. Global budget reservation
9. Send

On failure, the code is deleted, the cooldown and the reservation are released, and the user sees "No hemos podido enviar el correo, inténtalo de nuevo".

### 6. Address quality and bot filtering

- **Address quality:**
  - Syntax: a zod email check with a 254-character limit.
  - Disposable domains: a vendored `disposable-email-domains` list (CC0, licence file included), refreshed at each release.
  - Mail server: an MX lookup with an A/AAAA fallback, a 3 s timeout and a 24 h Redis cache per domain. A timeout allows the address and logs a warning.
- **Form token:** `GET /api/auth/form-token` returns an HMAC-signed `{ issuedAt, formId }`, accepted between 2 s and 30 min old.
- **Honeypot:** a field hidden visually and from assistive technology (`aria-hidden`, `tabindex=-1`, `autocomplete=off`).
- **Silent discard:** a filled honeypot, a submission that is too fast, or a missing token gets the normal response with no side effects.
- **Front helper:** a `shared/ui` directive provides the honeypot field and the form token to every email form (used from change 6).

### 7. Webhooks and suppression

- **Endpoint:** `POST /api/webhooks/resend`. It is exempt from session and CSRF checks but still behind the edge.
- **Verification:** signature checked with the provider's method, ±5 min timestamp tolerance, and idempotent through `private.webhook_events(event_id unique)`.
- **Effect:** hard bounces and complaints add a row to `email_suppressions(mailbox_hash, reason, created_at, cleared_at)`.
- **Admin control:** an admin API lists and clears suppressions.

### 8. Usage API

`GET /api/admin/email/usage` (admin only, wired once admin roles exist in change 14) returns the last 24 h and the month by type, the remaining budgets, the suppressed count and the 80% warning flag.

### 9. Data

- **Tables:** `email_send_log(id, class, type, mailbox_hash, status, provider_message_id, dedupe_key unique, created_at)`, `email_suppressions`, `private.webhook_events`, `private.captured_emails` (staging only).
- **RLS:** deny-all on all of them.
- **Retention:** Supabase Cron purges the send log after 30 days and webhook events after 7 days.

## Risks / Trade-offs

- **The free tier caps registrations at about 80 a day.**
  - → Acceptable for a portfolio. A paid plan only changes the caps in config.
- **Normalising "+tag" for every domain may group mailboxes that are really different.**
  - → It only makes the limits stricter. Delivery is unaffected.
- **DNS lookups add latency to registration.**
  - → 3 s timeout, cache, and allow on timeout.
- **The disposable-domain list goes stale.**
  - → It is refreshed at every release. Turnstile and the limits still apply.
