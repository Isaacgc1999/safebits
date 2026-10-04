# Proposal

## Why

safebits is used in supermarkets with poor signal and on several devices. Every feature after this one stores user data that must be editable offline, queued, and synchronised safely when the connection returns. The recipe catalog (2,000+ recipes) must also be on the device without blocking the app. This sync engine has to exist before the features that use it.

## What Changes

- **Per-user Dexie database** on the device. Every write stores the entity and appends to an outbox in one transaction, with UUIDv7 IDs.
- **`POST /api/sync/push`:** ordered, idempotent mutations, each validated by the server with the same rules as online requests, and accepted or rejected one by one.
- **`GET /api/sync/pull`:** changes since a cursor, based on the server's change sequence and including deletions. When two devices edit the same record, the last write applied by the server wins.
- **Generic entity handler registry,** so later changes register their own entities.
- **Catalog delivery:**
  - versioned, immutable summary and detail chunks (250 recipes each), cached at the edge;
  - a change feed;
  - a resumable background downloader that fetches summaries first, then details, prioritising planned and favourite recipes.
- **Sync engine:** a debounce after writes, retries on reconnection and app focus, backoff up to 5 min, failed requests treated as offline, and the always-visible `sb-sync` pill with the pending count.
- **Rejected changes, session expiry and devices:**
  - rejected changes are reported to the user;
  - after a session expires, the outbox is kept for the same user;
  - signing out warns about unsynced changes, then wipes local data;
  - persistent storage is requested, and a full device gets a clear message.
- **App updates** keep queued changes.

## Capabilities

### New Capabilities

- `platform/offline-sync`: installable app, offline features, connectivity indicator, queued changes, retries, conflict resolution, server validation, session expiry, sign-out wipe, catalog synchronisation, non-blocking catalog download, app updates, persistent storage.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–7.
- **Code:** `safebits_back/src/modules/sync/` and `modules/catalog/` (delivery), `safebits_front/src/app/core/sync/`, `core/storage/`, `packages/shared` (mutation schemas, cursor types), migration `private.processed_mutations` with a Cron purge.
- **Later changes:** every later feature registers its entities with the sync handler registry.
