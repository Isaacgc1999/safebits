# Proposal

## Why

With real accounts and health data, two failures matter most before launch: losing the database, and not noticing that the app is broken.
- **Backups:** Supabase's free plan takes no backups, and its docs tell free users to export their own and keep them off-site.
- **Errors:** Render's free plan keeps logs only briefly, and nothing alerts the operator about errors.

The owner also wants evidence that the backend is efficient and scales out, which needs load tests.

## What Changes

- **Daily encrypted backups:**
  - A GitHub Actions job runs `supabase db dump` (roles, schema, data) and encrypts the dump with the operator's `age` public key.
  - It uploads to Cloudflare R2, where retention locks stop the upload credential from deleting copies. 30 daily and 12 monthly copies are kept.
  - A daily freshness check from the edge Worker alerts the operator through Email Routing if the newest backup is older than 36 hours.
  - A documented restore drill runs before launch and every 6 months, in a disposable local stack.
- **Error tracking without third parties:**
  - Frontend errors and server errors are reported, scrubbed of personal data, to `/api/telemetry/errors`, which is rate-limited and size-limited.
  - Backend errors are captured with their correlation IDs.
  - Errors are grouped by fingerprint and kept for 30 days.
  - Alert emails (new group, or more than 20 an hour, at most 5 a day) go to the operator.
  - An admin panel lists groups and lets admins resolve them.
- **Load capacity:** k6 scripts on a reference container (1 vCPU, 1 GB) prove the latency targets and the 1.8× scale-out with two instances. Results go in `docs/performance.md`.
- **Privacy policy:** R2 backups are added to the list of processors.

## Capabilities

### New Capabilities

- `operations/backups`: daily backups, encryption before upload, off-site retention, freshness alert, proven restore.
- `operations/error-tracking`: frontend reports, backend capture, grouping, alerts, endpoint protection, retention and review.
- `platform/load-capacity`: API latency under load, and scaling out.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–15.
- **New:**
  - `.github/workflows/backup.yml`;
  - a freshness check in `safebits_edge` with a read-only R2 binding;
  - `safebits_back/src/modules/telemetry/` and `safebits_front/src/app/core/telemetry/`;
  - migrations for `private.error_groups` and `private.error_events`;
  - `tools/load/` and `docs/runbooks/restore.md`.
- **External:** a Cloudflare R2 bucket. A card on file is required by Cloudflare, but usage stays within the free 10 GB.
