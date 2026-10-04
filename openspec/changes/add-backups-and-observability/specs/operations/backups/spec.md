# Spec Delta

## Purpose

Protects all user data against loss with automatic, encrypted, off-site database backups and a restore procedure that has been proven to work.

## ADDED Requirements

### Requirement: Daily backups
A complete backup of the production database (roles, schema and data, including accounts) SHALL be taken automatically every day.

#### Scenario: Daily run
- **WHEN** a day passes
- **THEN** a new production backup exists for that day

### Requirement: Encryption before upload
Backups SHALL be encrypted with the operator's public key before they leave the machine that creates them. The private key MUST be held only offline by the operator, and no plaintext backup may be stored or logged anywhere.

#### Scenario: Stolen backup file
- **WHEN** someone obtains a stored backup file without the operator's private key
- **THEN** its contents cannot be read

### Requirement: Off-site retention
Backups SHALL be stored with a provider separate from the database provider, keeping 30 daily and 12 monthly copies. During their retention period, stored backups MUST NOT be deletable or overwritable with the credentials that upload them.

#### Scenario: Retention
- **WHEN** backups have run for 14 months
- **THEN** 30 daily and 12 monthly copies are available and older ones have expired

#### Scenario: Compromised upload credential
- **WHEN** the upload credential is used to delete a stored backup
- **THEN** the deletion is refused

### Requirement: Freshness alert
If the newest backup is older than 36 hours, the operator SHALL receive an alert.

#### Scenario: Backup job stopped
- **WHEN** no backup has completed for 36 hours
- **THEN** the operator receives one alert email

### Requirement: Proven restore
A documented restore of a production backup SHALL be performed before launch and at least every 6 months, into a disposable isolated environment that is destroyed afterwards, verifying row counts and a successful sign-in. Production data MUST never be restored into staging or any shared environment.

#### Scenario: Restore drill
- **WHEN** the restore drill runs
- **THEN** the restored database matches the backup's row counts, a dedicated check account can sign in, the environment is destroyed, and the result is recorded with its date
