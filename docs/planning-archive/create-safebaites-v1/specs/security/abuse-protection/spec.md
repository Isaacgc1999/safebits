# Spec Delta

## Purpose

Slows down and blocks automated abuse, such as brute force, credential stuffing, spam sign-ups and API flooding, without permanently locking out legitimate users who share a network.

## ADDED Requirements

### Requirement: Wrong password cooldown
After 3 consecutive failed sign-ins for the same email from the same device or IP, a CAPTCHA SHALL be required. After 5 failures within 15 minutes, sign-in for that email from that device and IP MUST be blocked for 15 minutes.

#### Scenario: CAPTCHA after 3 failures
- **WHEN** the third consecutive wrong password is entered for an email
- **THEN** the next attempt requires solving a CAPTCHA

#### Scenario: Cooldown after 5 failures
- **WHEN** the fifth wrong password within 15 minutes is entered
- **THEN** further attempts for that email from that device and IP are refused for 15 minutes with the remaining time shown

#### Scenario: Correct password during cooldown
- **WHEN** the correct password is entered during the cooldown
- **THEN** sign-in is still refused until the cooldown ends

### Requirement: Wrong code attempts
A one-time code SHALL be invalidated and deleted after 5 wrong attempts. The user MUST then request a new code, subject to the resend cooldown.

#### Scenario: Fifth wrong code
- **WHEN** a wrong code is entered for the fifth time
- **THEN** the current code stops working, even if the correct value is entered afterwards
- **AND** the user is told to request a new code

### Requirement: Code request limits
Code requests SHALL be limited to one per 60 seconds per account and purpose, five per hour per account, and twenty per hour per IP.

#### Scenario: Hourly account limit
- **WHEN** a sixth code is requested for the same account within one hour
- **THEN** the request is refused with the time remaining before another code can be requested

### Requirement: CAPTCHA on sensitive forms
Registration and password-reset requests SHALL always require a solved CAPTCHA. The number of registrations per IP and per device MUST be limited to 5 per hour.

#### Scenario: Registration without CAPTCHA
- **WHEN** a registration request arrives without a valid CAPTCHA token
- **THEN** it is refused and no account or email is created

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

### Requirement: Generic responses
Authentication responses SHALL NOT reveal whether an email is registered, activated or blocked specifically. Cooldown messages MUST be generic, such as "Demasiados intentos. Inténtalo de nuevo en 12 minutos."

#### Scenario: Probing for accounts
- **WHEN** an attacker submits sign-in, registration or reset requests for registered and unregistered emails
- **THEN** the visible responses are indistinguishable

### Requirement: Consistent limits across instances
Counters, cooldowns and blocks SHALL be shared by all backend instances and survive the restart of any single instance.

#### Scenario: Request to another instance
- **WHEN** a blocked client's request is served by a different backend instance
- **THEN** the block still applies
