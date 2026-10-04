# Proposal

## Why

Registration, password reset and email change all depend on emailed codes. These have to arrive reliably from the app's own domain, in the user's language, without ever exceeding Resend's free tier (100 emails a day, 3,000 a month), and the domain must not be usable for spoofing. All of this must exist before the authentication change can send its first code.

## What Changes

- **A `Mailer` interface with three adapters:**
  - `ResendMailer` in production, using the EU region and sending from `no-reply@safebits.isaacgarcia.stream`;
  - `CaptureMailer` in staging, which stores emails for tests and sends nothing;
  - `SmtpMailer` to Mailpit locally.
- **Fixed es/en templates** with no user-supplied text, no tracking and no remote images. The footer points to `contacto@isaacgarcia.stream`.
- **Budgets:**
  - Global daily and monthly caps with a reserve for account recovery.
  - Per-mailbox limits where aliases count together, and per-IP limits.
  - A circuit breaker for provider quota errors.
- **Address and bot checks:**
  - Address quality checks: syntax, disposable domains, mail server present.
  - Bot filtering: CAPTCHA, a signed form token with a minimum fill time, and a honeypot field.
- **Suppression** of hard bounces and complaints, from signed Resend webhooks.
- **Send-failure recovery**, and a privacy-preserving send log.
- **An admin API for email usage.** The admin screen is built in change 14.
- **DNS:** the Resend domain records in the EU region, and DMARC stage 0 (`p=none`) with reports in Cloudflare DMARC Management. Stages 1 and 2 are run after launch, in change 17.

## Capabilities

### New Capabilities

- `platform/email-delivery`: the authenticated sender, EU processing, staged and enforced DMARC, allowed email types and content, budgets, per-mailbox and per-IP limits, address quality, bot filtering, suppression, failure recovery, circuit breaker, usage monitoring, send-log privacy, the contact mailbox, and email language.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–3. The contact mailbox routing exists since change 2.
- **Code:** `safebits_back/src/modules/email/`, `packages/shared/src/utils` (mailbox normalisation), migrations for `email_send_log`, `email_suppressions` and `private.webhook_events`, and a front `shared/ui` honeypot and form-token helper.
- **External:** a Resend account and domain (EU region), DNS records in Cloudflare, the DMARC record and Cloudflare DMARC Management.
- **Dependencies:** `resend` (SDK) and `nodemailer` (development and tests). A vendored CC0 disposable-domains list.
