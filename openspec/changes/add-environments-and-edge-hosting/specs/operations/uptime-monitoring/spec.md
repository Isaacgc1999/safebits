# Spec Delta

## Purpose

Detects when the public app or its API stops responding and alerts the operator, while keeping production and staging within the hosting provider's free monthly hours.

## ADDED Requirements

### Requirement: External checks
A monitor running outside the project's own infrastructure SHALL request the app page every 5 minutes and the API health endpoint every 30 minutes.

#### Scenario: Configured checks
- **WHEN** the monitor configuration is reviewed
- **THEN** it contains the 5-minute page check and the 30-minute API check for production

### Requirement: Outage alerts
After two consecutive failed checks, the operator SHALL receive an alert email, followed by a recovery notice when the service recovers. These alerts MUST NOT use the app's own email budget.

#### Scenario: API down
- **WHEN** the API health check fails twice in a row
- **THEN** the operator receives an outage email, and a recovery email once it passes again

### Requirement: Health endpoint
`GET /api/health` SHALL report the status of the database and the cache without exposing versions, hostnames or secrets. It MUST answer HTTP 503 when a dependency is unreachable.

#### Scenario: Database unreachable
- **WHEN** the database cannot be reached
- **THEN** `/api/health` answers HTTP 503 and names the failing dependency only as "database"

### Requirement: Free hosting hours
Check intervals SHALL keep the combined monthly usage of the production and staging backends within the host's free instance hours, verified every month.

#### Scenario: Monthly review
- **WHEN** the monthly instance-hour usage is reviewed
- **THEN** the projected total for the month is within the free allowance
