# Spec Delta

## Purpose

Slows down and blocks automated abuse of the API, such as flooding and scripted attacks, without permanently locking out legitimate users who share a network. Limits specific to sign-in and one-time codes are defined in identity/authentication.

## ADDED Requirements

### Requirement: API rate limits
Every API endpoint SHALL be rate limited per account and per IP. Requests over the limit MUST receive HTTP 429 with a Retry-After header and MUST NOT be processed.

#### Scenario: Flooding an endpoint
- **WHEN** a client exceeds the limit of an endpoint
- **THEN** further requests receive HTTP 429 with Retry-After until the window resets

### Requirement: Escalating temporary blocks
A device or IP that repeatedly triggers cooldowns SHALL be blocked for 15 minutes, then 1 hour, then 24 hours on repeated offences within 24 hours. Blocks MUST always be temporary.

#### Scenario: Repeat offender
- **WHEN** the same device triggers a cooldown for the third time within 24 hours
- **THEN** it is blocked for 24 hours

#### Scenario: No permanent IP ban
- **WHEN** any automatic block expires
- **THEN** requests from that IP and device are accepted again

### Requirement: Security device identifier
The server SHALL issue each browser a random device identifier in a secure, HttpOnly cookie, used only for security limits. It MUST NOT be derived from hardware or fingerprinting. Clearing it MUST NOT bypass limits keyed by account or IP.

#### Scenario: Cookie cleared to evade limits
- **WHEN** an attacker in cooldown deletes the device cookie and retries the same email
- **THEN** the account and IP limits still apply

### Requirement: Consistent limits across instances
Counters, cooldowns and blocks SHALL be shared by all backend instances and survive the restart of any single instance.

#### Scenario: Request to another instance
- **WHEN** a blocked client's request is served by a different backend instance
- **THEN** the block still applies
