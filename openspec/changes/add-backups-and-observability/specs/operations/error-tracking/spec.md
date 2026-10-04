# Spec Delta

## Purpose

Captures frontend and backend errors in the project's own storage, groups them and alerts the operator, without sending any data to third parties.

## ADDED Requirements

### Requirement: Frontend error reports
Uncaught frontend errors and API calls that fail with a server error SHALL be reported to the app's own endpoint with the app version, route, browser and stack trace. Reports MUST NOT contain personal data, form values, tokens or health data.

#### Scenario: Uncaught error
- **WHEN** an uncaught error occurs in the browser
- **THEN** a report reaches the error endpoint without any personal data

### Requirement: Backend error capture
Every server error and unhandled exception SHALL be recorded with its correlation ID, route, error type and stack trace, without personal data or secrets.

#### Scenario: Server error
- **WHEN** a request fails with HTTP 500
- **THEN** an error record exists with the same correlation ID that was shown to the user

### Requirement: Grouping
Errors SHALL be grouped by fingerprint, keeping the count, the first and last occurrence, and the affected app versions.

#### Scenario: Repeated error
- **WHEN** the same error happens 50 times
- **THEN** one group shows a count of 50

### Requirement: Error alerts
A new error group, or a group that occurs more than 20 times in an hour, SHALL trigger an alert email to the operator. At most 5 error alerts MUST be sent per day.

#### Scenario: Error spike
- **WHEN** an existing error group occurs 25 times within an hour
- **THEN** the operator receives one alert email

### Requirement: Report endpoint protection
The error endpoint SHALL accept at most 10 reports per minute per device, each at most 16 kB. Excess reports MUST be dropped without showing anything to the user.

#### Scenario: Flood of reports
- **WHEN** a client sends 100 reports within a minute
- **THEN** only 10 are stored

### Requirement: Retention and review
Error records SHALL be kept for 30 days. Admins MUST be able to list the groups, see their details and mark a group as resolved.

#### Scenario: Resolved group
- **WHEN** an admin marks an error group as resolved and it occurs again
- **THEN** it reopens and counts as new for alerting
