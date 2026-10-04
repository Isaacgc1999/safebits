# Design

## Context

- **Supabase Free:** no automatic backups and no point-in-time restore. The docs recommend `supabase db dump` and off-site copies.
- **R2 free tier:** 10 GB of storage and free egress. Cloudflare requires a payment method even for free use; the owner accepted this.
- **GitHub scheduled workflows** can be dropped under load, and are disabled after 60 days without commits in public repositories. Hence the independent freshness check.
- **From earlier changes:**
  - Change 2: the edge Worker with Email Routing `send_email` for operator alerts.
  - Change 5: the email dispatcher.
  - Change 14: the admin back office.

## Goals / Non-Goals

**Goals:**
- A backup that cannot be read if stolen, cannot be deleted by a leaked CI credential, and is proven to restore.
- Errors are noticed within the hour, and no data leaves the project's own infrastructure.

**Non-Goals:**
- Point-in-time recovery (a paid feature), backing up Redis (ephemeral counters only), third-party APM.

## Decisions

### 1. Backup job

- **Schedule:** `.github/workflows/backup.yml` runs daily at 03:17 UTC, plus manual dispatch.
- **Steps:**
  1. `supabase db dump` into roles, schema and data files.
  2. A manifest of row counts per table.
  3. `tar` with zstd compression.
  4. `age -r <operator public key>` encryption.
  5. Upload to `r2://safebits-backups/daily/YYYY-MM-DD.tar.zst.age`; on the 1st of each month also to `monthly/`.
- **Credentials:** the R2 token is scoped to this bucket. The database URL is a GitHub secret. Plaintext exists only in the runner's temporary directory, which is wiped at the end of the job, and nothing is uploaded as a workflow artifact.

### 2. Retention and immutability

- **Retention:** R2 bucket lock rules make objects in `daily/` undeletable for 30 days and in `monthly/` for 365 days. Lifecycle rules delete them after 35 and 400 days.
- **Immutability:** even a leaked upload token cannot delete or overwrite a locked object.
- **Keys:** the operator's `age` private key is kept offline, in a password manager and on a paper copy, and never in CI or the cloud.

### 3. Freshness check

The edge Worker gets a read-only R2 binding and a daily cron (`43 7 * * *`). It lists `daily/` and, if the newest object is older than 36 hours, sends one alert through Email Routing `send_email`. This also catches a disabled GitHub schedule.

### 4. Restore drill

The runbook `docs/runbooks/restore.md` covers:
1. Download the newest backup.
2. Decrypt it with the offline key.
3. Start a disposable local Supabase stack.
4. Restore roles, schema and data.
5. Compare row counts with the manifest.
6. Sign in with the dedicated `restore-check` account.
7. Destroy the stack, and record the date and results.

Production data is never restored into staging. The drill runs before launch (change 17) and every 6 months.

### 5. Error tracking

- **Frontend:** a global Angular `ErrorHandler` plus an HTTP interceptor for 5xx responses. Reports use `fetch` with `keepalive` and send:
  - the scrubbed message;
  - up to 50 stack frames with URL paths only;
  - the route template (no concrete IDs);
  - the app version;
  - the browser family and version.
- **Scrubbing:** emails, UUIDs, long numbers and query strings are replaced by placeholders before sending. Nothing from form values or local data is ever read.
- **Endpoint:** `POST /api/telemetry/errors` validates with zod, accepts at most 16 kB, and is limited to 10 per minute per device. It is exempt from CSRF because it changes no user data. Excess reports are dropped silently.
- **Backend:** the Fastify `onError` hook and process-level handlers record server errors with the correlation ID, route, type and scrubbed stack.
- **Grouping:** a fingerprint is the SHA-256 of the error type, the normalised top frames and the route template. `private.error_groups` keeps the count, first and last seen, versions and status; `private.error_events` is purged after 30 days.
- **Alerts:** a new group, or a group with more than 20 events in an hour, triggers an email to the operator through the dispatcher (`recovery` class), at most 5 a day. A resolved group that occurs again reopens.
- **Admin:** a DeskAdmin panel lists groups and their details and lets admins resolve them.

### 6. Load capacity

- **Reference instance:** `tools/load/compose.yml` runs the backend limited to 1 vCPU and 1 GB, with local Postgres and Redis seeded with realistic data. It can run locally or in a manually triggered CI job.
- **k6 scripts:** a realistic mix (sync push and pull, catalog chunks, price entry, plan revalidation, auth checks) at 100 requests per second for 10 minutes, with thresholds of p95 ≤ 250 ms for reads, p95 ≤ 500 ms for writes and errors below 0.1%.
- **Scale-out test:** two instances behind a round-robin proxy, which must reach at least 1.8 times the throughput of one.
- **Results:** recorded in `docs/performance.md`.

## Risks / Trade-offs

- **Losing the `age` private key makes every backup useless.**
  - → Two offline copies, checked at each restore drill.
- **An R2 payment method is required.**
  - → Usage is far below the free 10 GB, and a Cloudflare billing alert is set at €0.01.
- **Free hosts cannot match the reference instance.**
  - → The targets are proven on the reference container, and the scaling path is documented.
- **Error reports could leak data despite scrubbing.**
  - → Scrubbing tests with personal-data fixtures, and form values are never read.
