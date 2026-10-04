# Spec Delta

## Purpose

Defines how safebits is served on its own subdomain of the owner's domain: fast as a PWA, fully isolated from the portfolio, and with the backend reachable only through the protected edge.

## ADDED Requirements

### Requirement: Public address
The app SHALL be served at `https://safebits.isaacgarcia.stream/`.

#### Scenario: Opening the app
- **WHEN** a person opens `https://safebits.isaacgarcia.stream/`
- **THEN** the safebits app loads

### Requirement: Redirect from paths on the root domain
Requests to `https://isaacgarcia.stream/safebits` or `https://isaacgarcia.stream/safebaites`, or to any path below them, SHALL be permanently redirected to the subdomain. The prefix is removed, and the rest of the path and the query string MUST be kept.

#### Scenario: Base path
- **WHEN** a person opens `https://isaacgarcia.stream/safebits`
- **THEN** the response is a permanent redirect to `https://safebits.isaacgarcia.stream/`

#### Scenario: Deep link with the former name
- **WHEN** a person opens `https://isaacgarcia.stream/safebaites/plan?semana=42`
- **THEN** the response is a permanent redirect to `https://safebits.isaacgarcia.stream/plan?semana=42`

### Requirement: Deep links
Any app route SHALL load the app when opened directly or reloaded. Unknown paths under `/api/` MUST return a JSON 404 response, never the app page.

#### Scenario: Reload on an inner route
- **WHEN** a user reloads `https://safebits.isaacgarcia.stream/plan`
- **THEN** the app loads and shows the plan screen

#### Scenario: Unknown API path
- **WHEN** a client requests `/api/does-not-exist`
- **THEN** the response is HTTP 404 with a JSON body and no HTML

### Requirement: Isolation as its own origin
The app SHALL run only on its own origin. It MUST NOT load scripts, styles, fonts or images from the portfolio or from any other origin, apart from the Google sign-in and CAPTCHA widgets. The portfolio MUST remain unaffected by the app.

#### Scenario: Requests made by the app
- **WHEN** the network requests of a complete user journey are inspected
- **THEN** every request goes to `safebits.isaacgarcia.stream`, except those of the Google sign-in and CAPTCHA widgets

#### Scenario: Portfolio unaffected
- **WHEN** a user who installed the app opens `https://isaacgarcia.stream/`
- **THEN** the portfolio is shown unchanged and is not controlled by the app's service worker

### Requirement: App shell served from the edge
The app's static files SHALL be served from the edge independently of the backend, so the app opens even when the backend is asleep or down.

#### Scenario: Backend asleep
- **WHEN** the backend is not running and a user opens the installed app
- **THEN** the app shell loads and shows the connecting or offline state with local data

### Requirement: Backend reachable only through the edge
The backend SHALL reject every request that does not carry the edge's secret credential. Such requests MUST receive HTTP 404, except a minimal liveness endpoint that returns no data.

#### Scenario: Direct request to the backend host
- **WHEN** a client calls the backend's own host address directly, bypassing `safebits.isaacgarcia.stream`
- **THEN** the response is HTTP 404 and no application data or behaviour is exposed

### Requirement: Trusted client IP
The client IP used for rate limits and blocks SHALL come only from the edge. Forwarding headers sent by clients MUST be ignored.

#### Scenario: Spoofed forwarding header
- **WHEN** a client sends `X-Forwarded-For: 1.2.3.4` while in an IP cooldown
- **THEN** the cooldown still applies to the client's real IP

### Requirement: App-specific cookie names
Every cookie the app sets SHALL have an app-specific name prefix and be host-only and Secure, so cookies set on the parent domain can never collide with or overwrite them.

#### Scenario: Parent-domain cookie present
- **WHEN** a cookie named `sid` scoped to `.isaacgarcia.stream` is present in the browser
- **THEN** the app ignores it and the session still uses the app's own host-only cookie

### Requirement: Security headers on static files
HTML and other static responses SHALL carry the same security headers as the API (content security policy, HSTS, framing protection, no-sniff, referrer and permissions policies).

#### Scenario: Headers on the app page
- **WHEN** `https://safebits.isaacgarcia.stream/` is requested
- **THEN** the response includes the content security policy, HSTS and framing protection headers

### Requirement: Cache policy for updates
Hashed static assets SHALL be cacheable long-term. The app page, service worker files and manifest MUST be revalidated on every request, so a new deployment reaches users at their next visit.

#### Scenario: New deployment
- **WHEN** a new version is deployed and a user opens the app
- **THEN** the app detects the update and offers to reload
