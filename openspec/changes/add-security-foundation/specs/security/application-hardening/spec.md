# Spec Delta

## Purpose

Defines the baseline security controls that protect credentials, personal and health data, and the platform itself against common and advanced web attacks.

## ADDED Requirements

### Requirement: No secrets in the browser
The frontend SHALL NOT contain API keys, service credentials or access or refresh tokens. These MUST NOT be stored in localStorage, sessionStorage, IndexedDB, Cache Storage or any cookie readable by scripts.

#### Scenario: Inspecting the built app
- **WHEN** the production bundle and all browser storage are inspected after signing in
- **THEN** no API key, service credential, access token or refresh token is found

### Requirement: Browser talks only to the own backend
The browser SHALL send application requests only to the app's own backend on the same origin. The database, authentication provider, cache and email services MUST be reachable only by the backend. The only third-party scripts allowed are the Google sign-in and CAPTCHA widgets.

#### Scenario: Network traffic after sign-in
- **WHEN** the network requests of a signed-in session are inspected
- **THEN** all data requests go to the app's origin

### Requirement: Session cookie protection
The session SHALL be carried by an opaque random identifier of at least 128 bits in a cookie with the HttpOnly, Secure and SameSite attributes and a host-only prefix. The identifier MUST be replaced on sign-in and on any change of password or privileges.

#### Scenario: Session fixation attempt
- **WHEN** a user signs in with a session identifier set before authentication
- **THEN** a new identifier is issued and the old one is invalid

### Requirement: Encryption of server-held credentials
Tokens and credentials the backend keeps on behalf of a user SHALL be encrypted at rest with authenticated encryption. Encryption keys MUST come from secret configuration and never from the source repository.

#### Scenario: Reading the session store
- **WHEN** the raw contents of the session store are read
- **THEN** no provider token is readable in plain text

### Requirement: Hashing of passwords and codes
Passwords SHALL be stored only with an adaptive password hash. One-time codes MUST be stored only as keyed hashes. Neither may be logged or returned by any API.

#### Scenario: Database inspection
- **WHEN** account and code storage are inspected
- **THEN** no password or code is present in plain text

### Requirement: HTTPS only
All traffic SHALL use HTTPS with HSTS. Plain HTTP requests MUST be redirected to HTTPS.

#### Scenario: HTTP request
- **WHEN** a client requests the app over plain HTTP
- **THEN** it is redirected to HTTPS and the response carries an HSTS header

### Requirement: Security headers
Every page and API response SHALL include:
- A content security policy that allows scripts only from the app's origin plus the Google sign-in and CAPTCHA providers, with no inline scripts unless hash-allowed, and that forbids framing.
- No-sniff, a strict referrer policy and a restrictive permissions policy.

#### Scenario: Injected inline script blocked
- **WHEN** a page contains an inline script that is not in the policy
- **THEN** the browser refuses to execute it

#### Scenario: Framing attempt
- **WHEN** another site embeds the app in a frame
- **THEN** the browser refuses to render it

### Requirement: Strict input validation
Every API input SHALL be validated against a strict schema (types, lengths, ranges, formats). Unknown fields MUST be rejected. Invalid requests MUST receive HTTP 400 without internal details.

#### Scenario: Unknown field
- **WHEN** a request includes a field not defined for that endpoint
- **THEN** it is rejected with HTTP 400 and nothing is stored

### Requirement: Injection resistance
User input SHALL never be concatenated into database queries or commands. Input containing query syntax MUST be stored and handled as plain text.

#### Scenario: SQL injection payload
- **WHEN** a recipe title "x'); DROP TABLE recipes;--" is saved
- **THEN** it is stored and displayed literally and no other data is affected

### Requirement: Cross-site scripting resistance
User-generated content SHALL always be rendered as text, never as HTML or script.

#### Scenario: Script in a recipe
- **WHEN** a recipe step contains "<img src=x onerror=alert(1)>"
- **THEN** it is displayed literally and nothing executes

### Requirement: Cross-site request forgery protection
State-changing requests SHALL require a valid anti-CSRF token and a same-site origin.

#### Scenario: Forged request
- **WHEN** another website submits a request to change a user's data using the user's cookie
- **THEN** the request is rejected

### Requirement: Object-level authorization
Every request SHALL be authorised against the owner of each record, both in the API and in the database. Requests for another user's private records MUST behave as if the record did not exist.

#### Scenario: Accessing another user's plan
- **WHEN** user A requests a plan identifier belonging to user B
- **THEN** the response is HTTP 404 and no data is returned

### Requirement: Server-controlled fields
Clients SHALL NOT be able to set server-controlled fields: author, system flag, role, moderation status, version numbers, community prices and timestamps.

#### Scenario: Forging a system recipe
- **WHEN** a client submits a recipe with a system flag or another user's author ID
- **THEN** the request is rejected with HTTP 400

### Requirement: Safe errors and audit logging
Error responses SHALL NOT expose stack traces or internals. Security events (sign-ins, failures, cooldowns, blocks, credential changes, deletions, admin actions) MUST be logged with time, account, IP and device ID. Logs MUST NOT contain passwords, codes, tokens or health data.

#### Scenario: Internal error
- **WHEN** an unexpected server error occurs
- **THEN** the client receives a generic message with a reference ID and the details are only in server logs
