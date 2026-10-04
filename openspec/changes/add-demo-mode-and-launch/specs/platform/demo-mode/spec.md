# Spec Delta

## Purpose

Lets portfolio visitors try the whole product instantly at demo.safebits.isaacgarcia.stream with sample data, without an account, without emails and without any access to real users' data.

## ADDED Requirements

### Requirement: Demo address
The demo SHALL be served at `https://demo.safebits.isaacgarcia.stream/` from the same application build, running in demo mode.

#### Scenario: Opening the demo
- **WHEN** a visitor opens `https://demo.safebits.isaacgarcia.stream/`
- **THEN** the app opens in demo mode

### Requirement: Instant start with sample data
The demo SHALL open directly on the week of a sample household (two people, a planned week, a shopping list and a prep session), without sign-in or onboarding. The visitor MUST still be able to open the onboarding from the demo to try it.

#### Scenario: First visit
- **WHEN** a visitor opens the demo for the first time
- **THEN** the sample week is shown without any sign-in screen

### Requirement: Isolation from real data
The demo SHALL never call the production or staging API and MUST only load its own static files, including a public copy of the recipe catalog. It runs on its own origin, so it shares no cookies or storage with the real app.

#### Scenario: Network check
- **WHEN** the network requests of a complete demo journey are inspected
- **THEN** every request goes to `demo.safebits.isaacgarcia.stream`

### Requirement: Local changes and reset
Changes made in the demo SHALL be kept only in the visitor's browser. A "Restablecer demo" action MUST restore the sample data, and the demo MUST reset itself 24 hours after the visitor's first change.

#### Scenario: Reset
- **WHEN** a visitor swaps meals and then presses "Restablecer demo"
- **THEN** the original sample week is shown again

### Requirement: Core features available
Planning, swapping, the prep session, the shopping list, receipts, price entry, recipe browsing and the cookbook SHALL work in the demo with the same behaviour as in the real app, using local data only.

#### Scenario: Plan generation in the demo
- **WHEN** a visitor regenerates the week in the demo
- **THEN** a valid plan is generated on the device

### Requirement: Unavailable features explained
Registration, sign-in, Google sign-in, emails, publishing, reporting, community price contributions, account export and deletion, and the admin area SHALL be unavailable in the demo. Trying them MUST show "No disponible en la demo" with a link to create a real account.

#### Scenario: Trying to publish
- **WHEN** a visitor presses "Publicar" on a recipe in the demo
- **THEN** "No disponible en la demo" is shown with a link to the real app

### Requirement: Demo banner
Every demo screen SHALL show a banner saying the visitor is in the demo and that changes stay only in this browser, with a link to the real app.

#### Scenario: Banner visible
- **WHEN** any demo screen is shown
- **THEN** the demo banner is visible

### Requirement: Not installable or indexed
The demo SHALL NOT be installable as an app and MUST tell search engines not to index it.

#### Scenario: Install prompt
- **WHEN** a visitor opens the demo in a browser that supports installation
- **THEN** no install option is offered for the demo
