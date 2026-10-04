# Spec Delta

## Purpose

Lets signed-in users manage their identity and data: their public alias, credentials, email, active sessions, data export and account deletion, including what happens to the content they shared.

## ADDED Requirements

### Requirement: Alias change
A user SHALL be able to change their alias, subject to the same rules. The new alias MUST appear on all their published recipes.

#### Scenario: Alias updated on recipes
- **WHEN** a user changes their alias from "ana_cocina" to "ana.batch"
- **THEN** all their published recipes show "por @ana.batch"

### Requirement: Change password
A signed-in user SHALL be able to change their password by entering the current password and a new valid password. An account without a password, such as a Google account, MUST be able to set one through a code sent to its email. Changing or setting the password MUST end all other sessions.

#### Scenario: Password changed
- **WHEN** a user enters the correct current password and a valid new one
- **THEN** the password is changed and all other sessions are ended

#### Scenario: Wrong current password
- **WHEN** a user enters a wrong current password
- **THEN** the change is refused and the attempt counts towards the wrong-password cooldown

### Requirement: Change email
A user SHALL be able to change their email address only after entering a one-time code sent to the new address. A notice of the change MUST be sent to the old address.

#### Scenario: Email changed
- **WHEN** a user requests a change to a new email and enters the valid code sent to it
- **THEN** the account email is updated
- **AND** a notice is sent to the previous address

### Requirement: Active sessions
A user SHALL be able to see their active sessions (approximate device and browser, last activity) and end any one of them, or all except the current one.

#### Scenario: Sign out everywhere
- **WHEN** a user chooses to close all other sessions
- **THEN** every other session stops working immediately

### Requirement: Data export
A user SHALL be able to download all their personal data in a machine-readable JSON file. The file covers profile, preferences, dietary restrictions, equipment, recipes, plans, shopping lists, receipts, price entries and consent records.

#### Scenario: Export requested
- **WHEN** a signed-in user requests a data export
- **THEN** a JSON file containing all of their personal data is downloaded

### Requirement: Account deletion
A user SHALL be able to permanently delete their account after re-authenticating with their password or with a code. Deletion MUST remove all personal data and end all sessions. Their published recipes MUST transfer to the author "Sistema", and their price entries MUST be kept only anonymously.

#### Scenario: Account deleted
- **WHEN** a user confirms deletion and passes re-authentication
- **THEN** the following are deleted:
  - profile, preferences, dietary restrictions and equipment
  - plans, lists and receipts
  - private recipes and private ingredients
  - sessions
- **AND** their published recipes now show "Sistema" as the author
- **AND** their price entries remain only as anonymous community data

#### Scenario: Other users keep using transferred recipes
- **WHEN** another user has a plan containing a recipe published by the deleted account
- **THEN** that plan keeps working and the recipe shows the author "Sistema"

#### Scenario: Email can be reused
- **WHEN** the deleted account's email is used to register again
- **THEN** a brand-new account is created with no link to the deleted data
