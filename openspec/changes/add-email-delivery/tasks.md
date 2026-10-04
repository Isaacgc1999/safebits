# Tasks

## 1. Domain and DNS

- [ ] 1.1 Create the Resend account and verify `safebits.isaacgarcia.stream` in the EU region (DKIM, SPF and bounce MX as DNS-only records in Cloudflare; tracking disabled), recording the records in `docs/email.md`; verify the domain shows as verified in the EU region and a test email to Gmail shows spf=pass, dkim=pass with `d=safebits.isaacgarcia.stream`, and dmarc=pass
- [ ] 1.2 Publish DMARC stage 0 at `_dmarc.isaacgarcia.stream` and enable Cloudflare DMARC Management; verify the record resolves and reports start to appear
- [ ] 1.3 Verify the contact mailbox routed in change 2 against the spec and add it to `docs/email.md`; verify an external email to `contacto@isaacgarcia.stream` reaches the operator

## 2. Mailer and templates

- [ ] 2.1 Implement the `Mailer` interface with `ResendMailer` (retries, sending-only key), `CaptureMailer` (staging, admin-only read endpoint for tests) and `SmtpMailer` (local), selected by `MAILER` with production locked to `resend`; verify unit tests with a mocked SDK and an integration test per adapter
- [ ] 2.2 Write the four es/en templates (code, expiry and fixed text only; plain text plus HTML; no remote images; contact footer) and the language selection; verify snapshot tests and a test that a name or alias containing a URL never appears in any rendered email

## 3. Budgets and limits

- [ ] 3.1 Add the migrations (`email_send_log`, `email_suppressions`, `private.webhook_events`, `private.captured_emails`) with deny-all RLS, Cron purges, and the tables in the RLS harness; verify `supabase db reset` and the purge tests
- [ ] 3.2 Implement mailbox normalisation and HMAC hashing in `packages/shared/src/utils`; verify unit tests for the alias-variants scenario
- [ ] 3.3 Implement the atomic budget reservation (rolling 24 h plus UTC month; activation 80/2,700; all emails 95/2,950; release on failure) and rebuild from `email_send_log`; verify tests with a fake clock at every threshold and after a Redis flush
- [ ] 3.4 Implement the per-mailbox (3/h, 6/24 h) and per-IP (10/24 h) limits and the provider circuit breaker; verify integration tests for each limit and for the provider-quota scenario

## 4. Address quality and bot filtering

- [ ] 4.1 Implement the address checks (syntax and length, vendored CC0 disposable list with licence file, MX then A/AAAA with a 3 s timeout, 24 h cache and allow-on-timeout); verify tests with mocked DNS for the disposable, no-mail-server and timeout cases
- [ ] 4.2 Implement the signed form-token endpoint, honeypot validation and the 2 s minimum on the backend, and the `shared/ui` honeypot and form-token directive on the front; verify that a silent discard returns the normal response and writes no send-log row

## 5. Sending pipeline, webhooks and usage

- [ ] 5.1 Wire the check order of design decision 5 into an `EmailDispatcher` service with send-failure recovery; verify integration tests for the provider-unavailable scenario (code deleted, cooldown and budget released)
- [ ] 5.2 Implement `POST /api/webhooks/resend` (signature check, ±5 min tolerance, idempotency, suppression on hard bounce or complaint) and register it in Resend; verify tests with valid, forged and replayed payloads
- [ ] 5.3 Implement the admin email usage and suppression API (guarded by a role check that change 14 connects); verify integration tests for the 76-email warning scenario

## 6. Documentation

- [ ] 6.1 Complete `docs/email.md` (records, adapters, budgets, checks, DMARC stages and exit criteria, rollback); verify every requirement of the email-delivery spec maps to a section
