# Tasks

## 1. Database foundation

- [ ] 1.1 Write the base migration (extensions, global sequence, `seq`/`updated_at` trigger function, soft-delete convention, a reusable RLS deny-all helper); verify `supabase db reset` applies cleanly locally and in staging
- [ ] 1.2 Implement the Kysely data layer (pooler in transaction mode, unnamed statements, per-request transaction with `SET LOCAL ROLE authenticated` and claims) and the privileged connection, restricted by a dependency-cruiser allowlist; verify an integration test shows RLS applies through the data layer and a non-allowlisted module cannot import the privileged connection
- [ ] 1.3 Build the RLS test harness in `tools/rls-test` (two users, per-table policy suites, read and write isolation assertions); verify it fails on a fixture table with a permissive policy

## 2. Hardening primitives

- [ ] 2.1 Configure `@fastify/helmet` for API responses (CSP `default-src 'none'`, `frame-ancestors 'none'`, HSTS, nosniff, referrer and permissions policies); verify an integration test asserts every header
- [ ] 2.2 Add the zod type provider with `.strict()` schemas, and a server-controlled-fields convention test; verify unknown fields and forged `author`/`isSystem` fields return 400 in the standard error shape
- [ ] 2.3 Add the global error handler (`{ code, message, correlationId }`) and pino redaction; verify tests show no stack trace in responses and no secrets or emails in captured logs
- [ ] 2.4 Implement the crypto utilities (AES-256-GCM with key IDs, HMAC-SHA-256, constant-time comparison, random generators) in `safebits_back/src/shared/utils`; verify round-trip, wrong-key, rotation and tamper-detection tests
- [ ] 2.5 Implement the cookie helper (only the app's names, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, no `Domain`) and the CSRF token utility; verify unit tests for the attributes and for token validation
- [ ] 2.6 Add the CI bundle secret scan of the built frontend; verify it fails on a fixture bundle containing a key-like string

## 3. Abuse protection

- [ ] 3.1 Implement the Redis client and the atomic Lua sliding-window limiter with the fail-closed and in-memory fallback policies; verify tests against local Redis, including Redis-down behaviour
- [ ] 3.2 Issue the `__Host-sb-did` device cookie on first contact; verify a test asserts its attributes
- [ ] 3.3 Implement per-route limits from one config file (per account and per IP; 429 with `Retry-After`) and escalating temporary blocks; verify tests with a fake clock for limits, escalation, expiry and a block seen by a second instance
- [ ] 3.4 Implement the Turnstile verification service; verify tests with Cloudflare's always-pass and always-fail test keys
- [ ] 3.5 Create `private.audit_log` and the audit service; verify a test that a security event writes a row without secrets

## 4. API conventions

- [ ] 4.1 Add the generic `Page<T>` type, the cursor helpers and the 100-item cap in `packages/shared`, with a reference paginated endpoint; verify a request for 500 items returns at most 100 with a next cursor
- [ ] 4.2 Verify compression at the edge and the absence of in-memory user state; verify a test through `wrangler dev` that JSON responses are compressed, and a two-instance test that requests succeed on either instance

## 5. Documentation

- [ ] 5.1 Write `docs/security.md` (architecture, data layer, RLS conventions, headers, crypto and key rotation, limits, audit log); verify every requirement of the three specs in this change maps to a section
