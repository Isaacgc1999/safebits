# Spec Delta

## Purpose

Prevents the free-tier database and cache from being paused for inactivity by generating real activity on a schedule, and makes sure the operator finds out when that fails.

## ADDED Requirements

### Requirement: Heartbeat schedule
A heartbeat SHALL run automatically at 06:17 UTC on days 1, 7, 13, 19, 25 and 31 of each month, so that no more than 6 days pass between two scheduled runs.

#### Scenario: Gap between runs
- **WHEN** the scheduled run dates for any 3 consecutive years are listed
- **THEN** no two consecutive runs are more than 6 days apart

### Requirement: Real database activity
Each heartbeat SHALL write a heartbeat record and run read queries against the production database, and MUST also write a value to the cache.

#### Scenario: Successful heartbeat
- **WHEN** a heartbeat completes
- **THEN** the stored last-heartbeat time equals the run time and the cache holds the same timestamp

### Requirement: Retries to cover cold starts
A heartbeat SHALL make up to 3 attempts spread over at least 5 minutes. It succeeds as soon as one attempt succeeds.

#### Scenario: Backend waking up
- **WHEN** the first attempt times out because the backend is asleep and the second attempt succeeds
- **THEN** the heartbeat is recorded as successful and no alert is sent

### Requirement: Protected heartbeat endpoint
The heartbeat endpoint SHALL accept only requests carrying both the edge credential and the heartbeat secret. All other requests MUST receive HTTP 404. It is limited to 6 calls per hour.

#### Scenario: Unauthorised call
- **WHEN** a client calls the heartbeat endpoint without the heartbeat secret
- **THEN** the response is HTTP 404 and no database activity is generated

### Requirement: Failure alert
If every attempt of a scheduled heartbeat fails, one alert email SHALL be sent to the operator address and the failure recorded. The alert MUST be sent independently of the backend.

#### Scenario: All attempts fail
- **WHEN** all 3 attempts of a scheduled heartbeat fail
- **THEN** exactly one alert email reaches the operator and the failure is logged

### Requirement: Heartbeat visibility
The admin back office SHALL show the time of the last successful heartbeat, and MUST show a warning when it is more than 6 days old.

#### Scenario: Stale heartbeat
- **WHEN** the last successful heartbeat is 7 days old
- **THEN** admins see a warning in the back office

### Requirement: Manual heartbeat
Admins SHALL be able to run a heartbeat on demand from the back office. It is subject to the same rate limit.

#### Scenario: Manual run
- **WHEN** an admin presses "Ejecutar heartbeat"
- **THEN** a heartbeat runs and the last-heartbeat time updates
