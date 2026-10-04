# Proposal

## Why

Every later feature stores personal or health data and exposes API endpoints. The database conventions, the row-level-security data layer, the security headers, validation, encryption, rate limiting and audit logging must exist before the first feature, so features plug into one hardened foundation instead of each re-inventing it.

## What Changes

- **Base migration:** extensions (`citext`, `pg_trgm`, `pg_cron`), the global change sequence and the `seq`/`updated_at` triggers, the soft-delete convention, and deny-by-default RLS for every table.
- **Kysely data layer:**
  - Each request runs in a transaction that sets the `authenticated` role and the user's claims, so RLS applies.
  - A separate privileged connection is restricted to named modules.
  - An RLS test harness is reused by every later change.
- **Hardening:**
  - API security headers.
  - Strict zod validation with server-controlled fields rejected.
  - A standard error shape with correlation IDs.
  - Log redaction.
  - AES-256-GCM encryption with versioned keys, and HMAC helpers.
  - Cookie and CSRF primitives.
  - A secret scan of the built frontend bundle.
- **Abuse protection:**
  - Redis sliding-window limiters for each route, per account and per IP.
  - Escalating temporary blocks and the security device cookie.
  - Turnstile verification, and the audit log.
- **API conventions:** cursor pagination with at most 100 items, compression at the edge, stateless instances, consistent error responses.

## Capabilities

### New Capabilities

- `security/application-hardening`: secrets out of the browser, cookies, encryption, hashing, HTTPS, headers, validation, injection, XSS and CSRF resistance, object-level authorisation, server-controlled fields, safe errors and audit logging.
- `security/abuse-protection`: API rate limits, escalating blocks, the security device identifier, and limits that stay consistent across instances.
- `platform/api-conventions`: efficient payloads, stateless instances and consistent error responses.

### Modified Capabilities

None.

## Impact

- **Depends on** `setup-workspace-and-quality-gates` and `add-environments-and-edge-hosting`.
- **Code:** `safebits_back/src/shared/` (data layer, security plugins, limiters, crypto), `packages/shared` (error codes, pagination types), `supabase/migrations/` (base migration), `tools/rls-test/`.
- **Later changes:** session, CSRF and hashing primitives are wired into sign-in in `add-authentication-and-legal`, where their end-to-end scenarios are verified.
