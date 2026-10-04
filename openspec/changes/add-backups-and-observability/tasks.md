# Tasks

## 1. Backups

- [ ] 1.1 Create the R2 bucket `safebits-backups` with bucket lock rules (`daily/` 30 days, `monthly/` 365 days), lifecycle rules (35 and 400 days), a bucket-scoped upload token, and a €0.01 billing alert; verify a test upload succeeds and deleting a locked object with the upload token is refused
- [ ] 1.2 Write `.github/workflows/backup.yml` (dump of roles, schema and data, row-count manifest, zstd, `age` encryption with the operator's public key, upload to `daily/` and on the 1st to `monthly/`, temporary files wiped, no artifacts); verify a manual run produces an encrypted object that cannot be read without the private key
- [ ] 1.3 Add the daily freshness check to the edge Worker (read-only R2 binding, cron `43 7 * * *`, alert after 36 hours through `send_email`); verify Worker tests with mocked listings for fresh and stale cases
- [ ] 1.4 Write `docs/runbooks/restore.md` and run the first restore drill in a disposable local stack (row counts match the manifest, the `restore-check` account signs in, the stack is destroyed); verify the drill result is recorded with its date

## 2. Error tracking

- [ ] 2.1 Add the migrations for `private.error_groups` and `private.error_events` with a Cron purge after 30 days; verify the migrations and the purge test
- [ ] 2.2 Implement `POST /api/telemetry/errors` (zod validation, 16 kB cap, 10 per minute per device, silent drop) and backend capture through `onError` and the process handlers, with fingerprinting and grouping; verify integration tests for grouping, the flood scenario and correlation IDs
- [ ] 2.3 Implement the frontend `ErrorHandler`, the 5xx interceptor and scrubbing; verify unit tests with personal-data fixtures that nothing personal is sent
- [ ] 2.4 Implement the alerts (new group, more than 20 per hour, at most 5 per day, reopening on recurrence) and the DeskAdmin error panel with resolution; verify integration tests for the spike scenario and a Playwright test of the panel

## 3. Load capacity

- [ ] 3.1 Write `tools/load/compose.yml` (reference instance at 1 vCPU and 1 GB with seeded data) and the k6 scripts with the spec thresholds; verify a run at 100 requests per second for 10 minutes meets the thresholds
- [ ] 3.2 Add the two-instance round-robin test; verify throughput is at least 1.8 times that of one instance within the thresholds, and record the results in `docs/performance.md`

## 4. Documentation and legal

- [ ] 4.1 Add Cloudflare R2 (backups) to the processors in the privacy policy (es and en) and document the backup, error-tracking and alerting setup in `docs/operations.md`; verify the published privacy page lists R2 and every requirement of the three specs maps to a section
