# Design

## Context

- **From earlier changes:**
  - Change 3: every user table has `seq`, `updated_at` and `deleted_at`.
  - Change 6: sessions are server-side cookies, and nothing secret is stored in the browser.
  - Change 7: the catalog lives in Postgres.
  - Change 2: the edge caches only public versioned catalog chunks.

## Goals / Non-Goals

**Goals:**
- One generic, typed sync mechanism reused by every feature.
- The catalog available offline without slowing the first screen.

**Non-Goals:**
- Real-time push between devices; sync runs on events and on a timer.
- Merging conflicting edits field by field; the last write applied by the server wins.

## Decisions

### 1. Local storage

- **Database:** one Dexie database per user, named `sb-<hash(userId)>`, mirroring the user's entities, plus `outbox`, `meta` (cursors, last user, catalog download progress) and `catalog_summary` / `catalog_detail`.
- **The `LocalRepository<TEntity>`** (an implementation of the change 1 `Repository<TEntity>` port) writes the entity and appends `{ mutationId: uuidv7, entity, op, payload, baseSeq }` to the outbox in one Dexie transaction.
- **Last user:** the only identity record kept outside the per-user database is a non-secret "last user" entry (ID and alias), used to open local data offline.

### 2. Push and pull

- **Push:** `POST /api/sync/push` sends up to 100 mutations in order.
  - For each mutation the server, in one transaction, looks it up in `private.processed_mutations` (idempotency).
  - It then dispatches to the registered `EntitySyncHandler<T>`, which validates with the same zod schemas and domain rules as the online endpoints.
  - It returns `ok` or `rejected` with a code for each mutation.
- **Pull:** `GET /api/sync/pull?cursor=` returns rows with `seq > cursor` per registered entity, including tombstones.
  - Using a server sequence avoids clock-skew problems.
  - "Last write wins" means the last write the server applies.
- **Registry:** a typed map from entity name to handler, filled by each feature module.

### 3. Catalog delivery

- **Manifest:** `GET /api/catalog/manifest` returns the current version and its chunk counts.
- **Chunks:** `GET /api/catalog/{version}/summary/{n}` and `/detail/{n}` return 250 recipes each, with `Cache-Control: public, max-age=31536000, immutable` and an ETag. Cloudflare caches them, so the backend serves each chunk about once per catalog version.
  - **Summaries:** everything the planner needs (IDs, titles, tags, derived restrictions, nutrition, equipment, storage, ingredient lines).
  - **Details:** steps and texts.
- **Change feed:** `GET /api/catalog/changes?cursor=` sends updates between versions.
- **Downloader:** a background, resumable download that fetches summaries first, then details. Planned and favourite recipes go first. Progress per chunk is stored in `meta`.

### 4. Sync engine

- **When sync runs:** after each local write (debounced by 2 s), on the `online` event, on `visibilitychange` back to visible, and on a backoff timer (5 s doubling up to 5 min).
- **Offline detection:** a failed fetch marks the app offline, whatever `navigator.onLine` says.
- **Status:** a signal store exposes `synced`, `syncing(n)` and `offline(n)` to `sb-sync`, and changes are announced through a live region.

### 5. Sessions and devices

- **Session expiry:** the outbox stays and is sent only after the same user signs in again. A different user gets a different database.
- **Sign-out:** a warning if there are pending changes, then the user's database and any personal Cache Storage entries are deleted.
- **Storage:** `navigator.storage.persist()` is called at first sign-in, and quota errors show the generic error state from change 4.
- **Service worker:** caches only the app shell and assets.

## Risks / Trade-offs

- **"Last write wins" can overwrite an edit made at the same time on another device.**
  - → Records are small, and devices converge on their next sync.
- **A large catalog download on a mobile data plan.**
  - → Compressed chunks, summaries first, details in the background, and resume.
- **Browsers may evict local storage.**
  - → Persistent storage is requested, and the outbox is retried as soon as the app opens.
