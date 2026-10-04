# Design

## Context

- **From earlier changes:**
  - Change 3: the data layer, crypto, cookie and CSRF primitives, limiters and Turnstile.
  - Change 5: the `EmailDispatcher`, with its budgets and bot filters.
  - Change 4: the design system and the auth route placeholders.
- **Supabase Auth's server-side behaviour** (unconfirmed users, rate limits when every request comes from one IP) must be measured before it is relied on.

## Goals / Non-Goals

**Goals:**
- Every rule the owner set for codes and attempts is enforced in our own code, where it can be tested.
- No provider token is ever kept.

**Non-Goals:**
- Account settings: alias change, password and email change, sessions list, export, deletion (change 15).

## Decisions

### 1. Supabase Auth stores identities, Node owns the rules

- **Supabase's built-in emails are never triggered.** The app never calls `signUp`, `resetPasswordForEmail` or `signInWithOtp`.
- **Registration:**
  1. CAPTCHA, form token and honeypot, consents (terms, privacy, age ≥ 14), and the password policy (10–128 characters, not the email, local common list, Pwned Passwords k-anonymity range lookup).
  2. `auth.admin.createUser({ email, password, email_confirm: false })`. An existing email gets the same response as a success, and no email is sent.
  3. An activation code is issued and sent through the `EmailDispatcher`.
- **Activation:** a valid code calls `auth.admin.updateUserById(id, { email_confirm: true })` and creates a `public_profiles` row with a random alias (an adjective-noun or `cocina_` stem plus 4 base36 characters, retried on collision and checked against the blocklist).
- **Sign-in:** `auth.signInWithPassword` server-side checks the password. Node reads the user ID and immediately revokes the Supabase session; only the app's own session is kept.
- **Spike first:** task 1.1 measures unconfirmed-user responses and per-IP limits before anything is built on them.

### 2. Codes (Redis)

- **Storage:** key `code:{purpose}:{userId}` holds `{ hmac, attempts }` with `EX 600`. A new code overwrites the key, which invalidates the previous one.
- **Generation:** `randomInt(0, 1_000_000)`, zero-padded to 6 digits.
- **Comparison:** constant time. The fifth wrong attempt deletes the key.
- **Cooldown:** `cooldown:{purpose}:{userId}` with `SET NX EX 60`.
- **Limits:** 5 per hour per account and 20 per hour per IP.
- **Deletion:** Redis deletes expired keys itself, which meets the "deleted on expiry" rule literally.

### 3. Sessions and CSRF

- **Sessions:** `private.sessions` stores a SHA-256 of a 256-bit session ID, plus the user, device ID, sign-in time, last-seen time and a user-agent summary.
  - The cookie is `__Host-sb-sid` (from the change 3 helper).
  - Lifetime: 30 days idle (sliding) and 90 days absolute.
  - Rotation: a new ID on sign-in and on password or privilege changes.
  - Revoking means deleting the row, effective immediately.
- **CSRF:** `GET /api/auth/csrf` returns an HMAC token derived from the session. The app keeps it in memory and sends it as `X-CSRF-Token` on every state-changing request.

### 4. Wrong-attempt protection

- **Counters:** `fail:pw:{email}:{device}` and `fail:pw:{email}:{ip}`.
- **Escalation:** CAPTCHA after 3 consecutive failures; after 5 within 15 min, a 15-minute cooldown for that email and device or IP. Repeat offenders escalate through the change 3 blocks.
- **Generic messages:**
  - "Email o contraseña incorrectos" for wrong credentials;
  - "Si el email existe, te hemos enviado un código" for code requests;
  - "Demasiados intentos. Inténtalo de nuevo en N minutos" for cooldowns.

### 5. Google sign-in

- **Main path:** the Google Identity Services button, using FedCM or a popup. Node issues a nonce bound to the session; the browser sends the ID token, and Node calls `auth.signInWithIdToken({ provider: 'google', token, nonce })`.
  - The consents screen appears before the account is created.
  - A verified email matching an existing account links to that same account.
  - Scopes are `openid email profile`.
- **Fallback for installed iOS apps:** an authorisation-code flow with PKCE and `state`, run by Node with its callback at `/api/auth/google/callback`.
- **CSP:** only the Google GSI script and frame are allowed.

### 6. Screens

The screens are built from AuthBienvenida, AuthRegistro, AuthCodigo (60 s countdown), AuthLogin (Turnstile after 3 failures) and AuthReset, using `sb-field`, `sb-code-input`, `sb-button` and the honeypot directive. Errors are announced through live regions. The tab bar is hidden.

### 7. Legal

- **Pages:** aviso legal, privacidad, cookies and términos in es and en, prerendered.
  - **Processors:** the privacy policy lists Supabase (EU), Render (EU), Cloudflare, Upstash (EU), Resend (EU region), Google (sign-in) and UptimeRobot (no personal data). Change 16 adds R2 backups.
  - **Rights:** user rights and the right to complain to the AEPD.
  - **Terms content:** the perpetual and irrevocable recipe licence, the transfer of published recipes to "Sistema" on deletion, the moderation rules, and the price, affiliation and allergy disclaimers.
- **Consents:** `consents(user, kind, document_version, accepted_at)`. A version bump forces re-acceptance at the next sign-in through the AppTerminos screen.
- **Cookie inventory:** a test enumerates every `Set-Cookie` and checks it against the cookie policy.

## Risks / Trade-offs

- **Supabase may rate-limit sign-ins**, because every server-side call comes from the Node host's IP.
  - → The spike measures it; raise the Supabase auth limits and enforce the real limits in Node.
- **Google sign-in can fail in iOS installed apps** (popups and FedCM).
  - → The PKCE fallback, tested on a real iPhone in change 17.
- **The breached-password lookup depends on an external service.**
  - → A 2 s timeout, falling back to the local common-password list with a logged warning.
