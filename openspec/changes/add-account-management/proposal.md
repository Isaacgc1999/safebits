# Proposal

## Why

Once every kind of user data exists, users must be able to manage and leave their account. That means changing the alias, password and email, reviewing sessions, exporting everything, and deleting the account under GDPR. Shared recipes must survive under "Sistema" when an account is deleted, as the terms state.

## What Changes

- **Alias change** (format and uniqueness from change 6), shown at once on published recipes.
- **Password change** with the current password, which ends other sessions. Accounts without a password, such as Google accounts, set one with an emailed code.
- **Email change,** confirmed by a code sent to the new address, with a notice to the old address.
- **Active sessions** (device and browser, last activity), with "close this session" and "close all others".
- **Data export:** a JSON file with every personal category, including decrypted health data for the owner.
- **Account deletion** (AppEliminar), after re-authentication:
  - personal data, private recipes and private ingredients are deleted;
  - published recipes pass to "Sistema";
  - price entries are kept only anonymously;
  - sessions end and the device is wiped;
  - the email can be used to register again.
- **Account screen** (AppCuenta): alias, email, password, sessions, export, theme and contrast.

## Capabilities

### New Capabilities

- `identity/account-management`: alias change, password change, email change, active sessions, data export, account deletion.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–14, because deletion and export touch every data domain.
- **Code:** `safebits_back/src/modules/account/` (with the privileged deletion module), `safebits_front/src/app/features/account/`.
