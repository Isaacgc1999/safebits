# Spec Delta

## Purpose

Defines separate local, staging and production environments so every change is verified on a production-like system before users see it, without ever mixing data between environments.

## ADDED Requirements

### Requirement: Isolated environments
Production SHALL run at `https://safebits.isaacgarcia.stream` and staging at `https://staging.safebits.isaacgarcia.stream`. Each environment MUST have its own database, cache and secrets, and no environment can access another's data.

#### Scenario: Staging credentials against production
- **WHEN** the staging backend's database credentials are used against the production database
- **THEN** the connection is refused

### Requirement: Restricted staging
Staging SHALL require a credential to open and MUST tell search engines not to index it.

#### Scenario: Anonymous visit
- **WHEN** someone opens staging without the credential
- **THEN** the response is HTTP 401 and no app content is served

#### Scenario: Indexing
- **WHEN** any staging response is inspected
- **THEN** it carries a `noindex` directive

### Requirement: No real email outside production
Outside production, emails SHALL be captured instead of sent, so tests can read them and no sending budget is used.

#### Scenario: Activation in staging
- **WHEN** a person registers in staging
- **THEN** the activation email is stored in the capture inbox and nothing reaches the email provider

### Requirement: Promotion through staging
Every merge to the main branch SHALL deploy to staging and apply pending migrations there, then run the end-to-end and security scans. Production MUST only be deployed by an explicit manual action after those checks pass for the same commit.

#### Scenario: Failing staging checks
- **WHEN** the end-to-end suite fails on staging for a commit
- **THEN** that commit cannot be deployed to production

### Requirement: Identical forward-only migrations
All environments SHALL apply the same migration files in the same order. Migrations MUST only move forward and stay compatible with the previously deployed build.

#### Scenario: Migration not yet on staging
- **WHEN** a production deployment includes a migration that staging has not applied
- **THEN** the deployment is refused

### Requirement: Environment badge
Every non-production environment SHALL show a visible badge with its name. Production MUST never show one.

#### Scenario: Staging badge
- **WHEN** a user opens staging
- **THEN** a "Staging" badge is visible on every screen
