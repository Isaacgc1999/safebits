# Tasks

## 1. Spike and data

- [ ] 1.1 Spike Supabase Auth from the server (`admin.createUser` unconfirmed, `signInWithPassword` responses for unconfirmed users and wrong passwords, per-IP limits, session revocation) and record findings and dashboard settings in `docs/auth.md`; verify the settings are applied in local, staging and production
- [ ] 1.2 Add the migrations for `private.sessions`, `public_profiles` (unique `citext` alias) and `consents`, the Supabase Cron function deleting accounts not activated within 7 days, and the new tables in the RLS harness; verify the migrations, RLS tests and a cleanup test with fixture accounts

## 2. Core services

- [ ] 2.1 Implement sessions (hashed ID, `__Host-sb-sid`, 30-day idle, 90-day absolute, rotation, revocation) and wire the CSRF token (`GET /api/auth/csrf`, header check on every state-changing route); verify tests for expiry, rotation (session fixation), revocation, and forged or missing CSRF tokens
- [ ] 2.2 Implement the password policy (length, not the email, local list, Pwned Passwords range lookup with a 2 s timeout and fallback); verify unit tests with a mocked range API
- [ ] 2.3 Implement the code service (6 digits, HMAC, `EX 600`, overwrite, `SET NX` cooldown, 5-attempt invalidation, hourly limits, constant-time comparison); verify tests for every code scenario in the authentication spec, including TTL expiry and deletion
- [ ] 2.4 Implement alias generation at activation (format, uniqueness, blocklist, retry on collision); verify unit and integration tests for the public-profile scenarios

## 3. Flows

- [ ] 3.1 Implement registration (CAPTCHA, form token and honeypot, consents with age, password policy, identical response for existing emails, activation email through the dispatcher); verify integration tests for success, duplicate email, missing consent and silent discard
- [ ] 3.2 Implement activation and resend (60 s cooldown, previous code invalidated); verify that an inactive account cannot sign in and that activation enables it and assigns an alias
- [ ] 3.3 Implement sign-in (generic errors, CAPTCHA after 3 failures, 15-minute cooldown after 5, inactive account routed to activation, audit events); verify integration tests for every wrong-password scenario
- [ ] 3.4 Implement password reset (generic request response, code, new password, end other sessions, sign in here); verify tests for known and unknown emails
- [ ] 3.5 Implement Google sign-in (nonce, ID token through `signInWithIdToken`, consents before creation, linking by verified email, PKCE + state fallback); verify integration tests with mocked Google responses
- [ ] 3.6 Implement sign-out with server-side revocation; verify the old cookie is rejected afterwards

## 4. Screens

- [ ] 4.1 Build Bienvenida, Crear cuenta, Código (60 s countdown), Entrar (Turnstile after 3 failures, Google button) and Nueva contraseña from the designs, with live-region errors, in es and en; verify Playwright end-to-end tests (registration → activation → sign-in, password reset) using Mailpit locally and the capture inbox in staging
- [ ] 4.2 Run axe and visual comparison against the auth designs; verify zero accessibility violations and screenshots within tolerance

## 5. Legal

- [ ] 5.1 Write the legal notice, privacy policy (processors, rights, AEPD), cookie policy and terms (recipe licence, transfer on deletion, moderation rules, disclaimers) in es and en, prerendered with an article layout built from the design system's typography and card patterns (recorded in `docs/design-decisions.md`); verify they are reachable signed out and present in the build output
- [ ] 5.2 Implement versioned consents and the re-acceptance gate (AppTerminos); verify that bumping the terms version forces acceptance at the next sign-in
- [ ] 5.3 Add the cookie inventory test; verify every `Set-Cookie` is listed in the cookie policy as strictly necessary

## 6. Documentation

- [ ] 6.1 Complete `docs/auth.md` (flows, limits, sessions, Google setup, rotation of secrets); verify every requirement of the three specs maps to a section
