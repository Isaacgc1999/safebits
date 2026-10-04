# Spec Delta

## Purpose

Covers the legal texts, consents and notices needed to operate lawfully in Spain and the EU, including minimum age, user-generated content, price estimates and cookies.

## ADDED Requirements

### Requirement: Registration consents
Creating an account, including through Google, SHALL require accepting the terms and the privacy policy and confirming the person is at least 14 years old. None of these may be pre-ticked.

#### Scenario: Consent missing
- **WHEN** a person tries to register without confirming the age requirement
- **THEN** registration is refused

### Requirement: Consent records
Each consent SHALL be recorded with the document version and time. When the terms or privacy policy change materially, users MUST accept the new version at their next sign-in before continuing.

#### Scenario: New terms version
- **WHEN** the terms are updated to a new version
- **THEN** existing users must accept them at their next sign-in

### Requirement: Terms of service content
The terms SHALL state:
- Users grant a worldwide, royalty-free, perpetual and irrevocable licence to host, display, adapt and translate the recipes they publish.
- On account deletion, published recipes stay in the app attributed to "Sistema".
- The moderation rules and how reports, decisions and appeals work.
- Prices are estimates, the app is not affiliated with any supermarket, and the allergy disclaimer.

#### Scenario: Terms page
- **WHEN** a user opens the terms
- **THEN** the recipe licence, transfer on deletion, moderation rules and disclaimers are present in Spanish and English

### Requirement: Allergy disclaimer
Recipe details and shopping lists SHALL show a notice to always check product labels for allergens.

#### Scenario: Notice on the list
- **WHEN** a user opens a shopping list
- **THEN** the allergen-label notice is visible

### Requirement: Price disclaimer
Screens that show prices SHALL indicate that they are approximate.

#### Scenario: Plan cost
- **WHEN** a user views the plan cost
- **THEN** a "Precios orientativos" note is visible

### Requirement: Strictly necessary cookies only
The app SHALL set only strictly necessary cookies (session, anti-CSRF, security device identifier, language) and no analytics or advertising cookies. A cookie policy page MUST list each cookie and its purpose.

#### Scenario: Cookie audit
- **WHEN** the cookies set by the app are inspected
- **THEN** each one is listed in the cookie policy as strictly necessary

### Requirement: Legal notice and privacy policy
The app SHALL publish:
- A legal notice with the provider's identity and a contact email that also serves as the content-moderation contact point.
- A privacy policy covering the controller, purposes, legal bases, service providers, EU data location, retention, user rights, and the right to complain to the AEPD.

#### Scenario: Legal pages reachable
- **WHEN** any visitor, signed in or not, opens the footer
- **THEN** links to the legal notice, privacy policy, cookie policy and terms are available
