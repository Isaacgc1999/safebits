# Spec Delta

## Purpose

Keeps the app installable and fully usable without connectivity. Local data and queued changes synchronise automatically and safely across the user's devices when the connection returns.

## ADDED Requirements

### Requirement: Installable app
The app SHALL be installable from Edge or Chrome on Windows and to the home screen on Android and iOS. It runs in its own window. After the first visit, the app shell MUST load without a connection.

#### Scenario: Launch offline
- **WHEN** an installed app is opened in airplane mode
- **THEN** it loads and shows the last synced data

### Requirement: Offline features
After the first sync, these features SHALL work offline:
- Plans, the catalog, the cookbook, shopping lists and receipts.
- Price entry, preferences and equipment.
- The prep checklist.

Registration, sign-in, password reset, email change, account deletion and data export MUST require a connection and say so.

#### Scenario: Sign-in offline
- **WHEN** a signed-out user opens the sign-in screen without a connection
- **THEN** the app explains that a connection is needed to sign in

### Requirement: Connectivity indicator
The app SHALL show when it is offline and how many changes are waiting to sync. A failed request MUST mark the app as offline even if the browser reports being online.

#### Scenario: Captive Wi-Fi
- **WHEN** the device is on a Wi-Fi network that blocks requests
- **THEN** the app shows the offline state and keeps changes queued

### Requirement: Queued changes
Every change made offline SHALL be stored on the device in order and sent automatically when connectivity returns. Each change carries a unique identifier so that resending never applies it twice.

#### Scenario: Interrupted sync
- **WHEN** 10 items ticked offline are being synced and the connection drops halfway
- **THEN** after reconnection the server has exactly 10 ticks with no duplicates

### Requirement: Retry with backoff
A failed sync SHALL be retried with increasing delays of up to 5 minutes. It MUST also retry immediately when connectivity returns or the app comes back to the foreground.

#### Scenario: App reopened
- **WHEN** a user reopens the app with pending changes and a working connection
- **THEN** the changes are sent without waiting for the next retry delay

### Requirement: Conflict resolution
When the same record is changed on two devices, the change the server applies last SHALL win. All devices MUST converge to the server state after syncing.

#### Scenario: Same slot edited on two devices
- **WHEN** a phone edits Monday dinner offline, a desktop edits it online, and the phone syncs later
- **THEN** the phone's change is kept and the desktop shows it after its next sync

### Requirement: Server validation of synced changes
The server SHALL validate synced changes exactly as it validates online requests. Rejected changes MUST be reported to the user with the reason and removed from the queue.

#### Scenario: Rejected change
- **WHEN** a queued change is rejected by the server
- **THEN** the user sees which change failed and why

### Requirement: Session expiry while offline
Queued changes SHALL be kept if the session expires. They MUST be sent only after the same user signs in again. A different user signing in on the device MUST never send or see them.

#### Scenario: Re-sign-in
- **WHEN** a user's session expires while they have queued changes and they sign in again
- **THEN** the queued changes are sent

### Requirement: Sign-out clears the device
Signing out SHALL warn if there are unsynced changes. After confirmation it MUST delete all personal data stored on the device.

#### Scenario: Shared computer
- **WHEN** a user signs out on a shared computer and confirms
- **THEN** no plans, recipes, restrictions or other personal data of that user remain in the browser

### Requirement: Catalog synchronisation
The catalog SHALL be downloaded on first use and then updated incrementally. It covers system and public recipes, ingredients, products and reference prices.

#### Scenario: New public recipe
- **WHEN** a recipe is published by another user
- **THEN** it becomes available on this device after the next catalog sync

### Requirement: App updates
When a new app version is available the user SHALL be offered a reload. Queued changes MUST survive the update.

#### Scenario: Update with pending changes
- **WHEN** the app updates while changes are queued
- **THEN** the changes are still queued after the reload

### Requirement: Persistent storage
The app SHALL request persistent storage from the browser. If the device storage is full, it MUST show a clear message.

#### Scenario: Storage full
- **WHEN** saving local data fails because the device is out of space
- **THEN** the user sees a message explaining the problem
