# Design

## Context

- **From earlier changes:**
  - Change 6: sessions, codes, aliases, and the email dispatcher (change 5).
  - Change 14: published recipes, reports and notifications.
  - Changes 9–13: every personal data domain.
- **Designs:** AppCuenta (alias, email, sessions, export, theme) and AppEliminar.

## Goals / Non-Goals

**Goals:**
- Deletion is complete, verifiable and leaves shared content consistent.
- Export contains every personal category in a machine-readable format.

**Non-Goals:**
- Exporting other users' content, or undoing a deletion.

## Decisions

### 1. Credentials and email

- **Password:** a change checks the current password with Supabase Auth (change 6 pattern), updates it with `auth.admin.updateUserById`, rotates the current session and deletes all others. Setting a password for a Google account uses the `set-password` code purpose.
- **Email:** a change uses the `email-change` code sent to the new address through the dispatcher (budget class `recovery`). On success the address is updated and the `email-changed` notice is sent to the old one.

### 2. Sessions

The account screen lists `private.sessions` rows for the user, with a coarse device and browser label and the last activity. Revoking deletes a row, so it stops working immediately.

### 3. Export

`GET /api/account/export` (rate-limited, recent sign-in required) streams JSON. A registry of `ExportSection<T>` providers, one per module, keeps the module boundaries. It covers the profile, preferences, decrypted health restrictions, equipment, recipes and versions, plans, lists, pantry, receipts, price entries, notifications and consents.

### 4. Deletion

On the privileged connection, in one transaction:
1. Verify re-authentication (password or a code).
2. Delete personal rows in every module through `DeletionSection` providers.
3. Set `owner_id` to null on published recipes, so they appear as "Sistema", and delete private ones.
4. Anonymise `user_prices` by detaching them from the user.
5. Delete sessions and the Supabase Auth user, and write the audit log.

The client then wipes local data (change 8). A test registers the same email again to confirm a fresh account is created.

## Risks / Trade-offs

- **A partial deletion would leave personal data behind.**
  - → A single transaction, every module enforced to provide a deletion section, and a test that scans every table for the deleted user ID.
- **Exports can be large.**
  - → Streaming, plus a rate limit of one export per hour.
