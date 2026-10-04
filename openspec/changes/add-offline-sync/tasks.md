# Tasks

## 1. Server

- [ ] 1.1 Add `private.processed_mutations` with a Cron purge after 30 days; verify the migration and the purge test
- [ ] 1.2 Implement `POST /api/sync/push` with the typed `EntitySyncHandler<T>` registry (ordered, per-mutation transaction, idempotency, `ok` or `rejected` per mutation); verify an integration test that a repeated mutation ID is applied once and an invalid mutation is rejected with its code
- [ ] 1.3 Implement `GET /api/sync/pull` by `seq` cursor, including tombstones; verify a second device receives creates, updates and deletes in order
- [ ] 1.4 Implement the catalog manifest, the versioned summary and detail chunks (immutable caching, ETag) and the change feed; verify chunks are stable per version, cached at the edge in staging, and never include private recipes

## 2. Device

- [ ] 2.1 Implement the per-user Dexie database and `LocalRepository<TEntity>` (entity and outbox in one transaction, UUIDv7); verify unit tests with fake-indexeddb
- [ ] 2.2 Implement the resumable catalog downloader (summaries first, then details with planned and favourite recipes prioritised); verify a test where an interrupted download resumes at the next chunk while the app stays usable
- [ ] 2.3 Implement the sync engine (debounce, `online` and `visibilitychange` triggers, backoff up to 5 min, failed fetch means offline) and wire `sb-sync` with the pending count and its live region; verify unit tests with fake timers
- [ ] 2.4 Handle rejected mutations (removed from the outbox and reported with the reason); verify a unit test and the UI message
- [ ] 2.5 Handle session expiry (outbox kept, flushed after the same user signs in), the sign-out warning and full local wipe, `navigator.storage.persist()`, the quota error state and app updates that keep the outbox; verify Playwright tests for each

## 3. End-to-end

- [ ] 3.1 Run the sync scenarios: tick 10 items offline and drop the connection mid-sync, then reconnect; edit the same record on two browser contexts; open the installed app in airplane mode. Verify exactly 10 server-side ticks, convergence of both contexts, and the shell loading offline

## 4. Documentation

- [ ] 4.1 Write `docs/sync.md` (mutation format, ordering, idempotency, cursors, conflict rule, chunk versioning, how a feature registers an entity); verify it matches the implemented schemas
