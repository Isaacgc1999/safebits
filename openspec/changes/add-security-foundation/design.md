# Design

## Context

- **Already in place** from change 2: the backend accepts traffic only from the edge, the client IP comes from the edge header, and the `private` schema exists.
- **Supabase:**
  - Supabase Auth stores identities (wired in change 6).
  - Postgres is reached directly through the Supabase pooler.
  - The browser never talks to Supabase.

## Goals / Non-Goals

**Goals:**
- Defence in depth: validation in the API, row-level security in Postgres, encrypted health data.
- One reusable, tested building block per security concern.

**Non-Goals:**
- Sign-in flows and session wiring (change 6).
- Feature tables (owned by each feature change).

## Decisions

### 1. Database conventions

- **Base migration:** enables `citext`, `pg_trgm` and `pg_cron`, and creates the global sequence with a trigger function that sets `seq` and `updated_at` on insert and update.
- **Conventions for every user-owned table:**
  - a UUIDv7 `id`;
  - `owner_id` referencing `auth.users`;
  - `seq`, `updated_at`, and `deleted_at` for soft deletes;
  - RLS enabled with no permissive policy by default.
- **Money and quantities:** money is stored in integer cents, quantities in numeric with an explicit unit.
- **The `private` schema:** never exposed through the Data API.

### 2. Data layer

```
 request --> edge-auth --> session (change 6) --> userId
                                                    |
               Kysely transaction (pooler, transaction mode, unnamed statements)
               SET LOCAL ROLE authenticated
               set_config('request.jwt.claims', {"sub": userId, "role": "authenticated"}, true)
               --> repository queries (RLS policies use auth.uid())
```

- **Privileged connection:** used only by modules listed in an allowlist that dependency-cruiser enforces: migrations, seed, auth administration, heartbeat, account deletion, moderation, medians.
- **Why direct SQL rather than the REST API:** multi-statement transactions and idempotency tables are needed for sync (change 8).

### 3. RLS test harness

`tools/rls-test` creates two users, runs each table's policy suite as each of them, and asserts that:
- a user cannot read or write another user's rows;
- a user can read only global, public or own catalog rows.

Every feature change adds its tables to the harness.

### 4. Hardening primitives

- **Security headers:** `@fastify/helmet` for API responses: a CSP with `default-src 'none'` and `frame-ancestors 'none'`, plus nosniff, the referrer and permissions policies, and HSTS.
- **Validation:** zod type provider, with every schema `.strict()`. Server-controlled fields (author, system flag, role, moderation status, versions, community prices, timestamps) never appear in input schemas.
- **Errors:** a single handler returns `{ code, message, correlationId }`. Stack traces never leave the server.
- **Logging:** pino, redacting `password`, `code`, `token`, `cookie`, `authorization`, health payloads and email addresses.
- **Crypto:**
  - AES-256-GCM with a key ID prefix, so keys can be rotated.
  - HMAC-SHA-256, constant-time comparison, `crypto.randomInt` and `crypto.randomBytes` wrappers.
- **Cookie helper:** only allows the app's cookie names with `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/` and no `Domain`.
- **CSRF utility:** an HMAC token derived from the session secret, wired in change 6.
- **Bundle secret scan:** a CI step searches the built frontend for key patterns, service URLs and token-like strings.

### 5. Abuse protection

- **Device ID:** the `__Host-sb-did` cookie holds a random 128-bit value lasting 1 year, used only for security. The owner asked for MAC-address blocking, which is impossible: browsers cannot read a MAC address, and it never leaves the local network. This cookie, combined with the account and IP keys, replaces it.
- **Limiters:** atomic Lua sliding windows keyed by route with IP, account or device.
  - Limits for each route live in one config file.
  - Escalation counters (15 min, then 1 h, then 24 h) are kept for 24 h.
  - Requests over the limit get 429 with `Retry-After`.
- **If Redis is unavailable:** auth-sensitive routes fail closed with 503; other routes fall back to a per-instance in-memory limiter and log a warning.
- **Turnstile:** verified server-side through `siteverify`, using the hostnames of each environment.
- **Audit log:** `private.audit_log(at, account, ip, device, event, detail)` for security events, with no secrets.

### 6. API conventions

- **Pagination:** a generic `Page<T>` with an opaque cursor (keyset on `seq` or the sort key) and a maximum page size of 100.
- **Compression:** done by Cloudflare at the edge, so the origin does not spend CPU on it.
- **Statelessness:** sessions live in Postgres (change 6) and counters in Redis; nothing user-related is kept in instance memory.

## Risks / Trade-offs

- **The privileged connection is a powerful tool.**
  - → An allowlist enforced by dependency-cruiser, and audit logging of privileged actions.
- **Redis outages block sign-in**, because auth fails closed.
  - → Usage alerts, and sessions are kept out of Redis.
- **Some requirements here need sign-in to be tested end to end** (session fixation, CSRF on real forms).
  - → The primitives are unit-tested here, and those scenarios are verified in change 6.
