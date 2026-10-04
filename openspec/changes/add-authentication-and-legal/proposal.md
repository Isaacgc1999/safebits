# Proposal

## Why

Every personal feature needs real accounts. The owner's rules are strict:
- Activation and reset codes expire after 10 minutes, are single-use, have a 60-second resend cooldown, and are deleted once used or expired.
- Google sign-in must be fast and secure.
- Wrong attempts lead to cooldowns, and responses never reveal which emails have accounts.

Registration also requires accepting the terms and privacy policy and confirming a minimum age of 14, so the legal pages and consent records ship together with sign-up.

## What Changes

- **Registration** with email and password (CAPTCHA, consents, password policy with a breached-password check), activated by a 6-digit code.
- **Sign-in** with email and password, with CAPTCHA after 3 failures and a 15-minute cooldown after 5.
- **Google sign-in:** Google Identity Services, with a server-side PKCE fallback for installed iOS apps.
- **Password reset** with a code. Other sessions end and the user is signed in on the current device.
- **Codes:** stored hashed in Redis, one active per purpose, 10-minute expiry, 60 s resend cooldown, invalidated after 5 wrong attempts, deleted when used or expired.
- **Sessions:** a hashed, server-side `__Host-sb-sid` cookie with a 30-day idle and 90-day absolute lifetime, rotated on sign-in, plus the session-bound CSRF token.
- **Public alias:** a random alias assigned at activation; the real name is never shown.
- **Unactivated accounts** are deleted after 7 days by Supabase Cron.
- **Auth screens** built from the designs: Bienvenida, Crear cuenta, Código, Entrar, Nueva contraseña.
- **Legal:** the legal notice, privacy policy, cookie policy and terms in es and en, versioned consent records, and the re-acceptance gate when the terms change (Términos actualizados).

## Capabilities

### New Capabilities

- `identity/authentication`: registration, codes, activation, sign-in, Google, reset, sessions, sign-out, wrong-attempt cooldowns, code request limits, CAPTCHA on sensitive forms, generic responses.
- `identity/public-profile`: the public alias assigned at activation.
- `legal/terms-and-consent`: registration consents, consent records, terms content, allergy and price disclaimers, strictly necessary cookies, the legal notice and the privacy policy.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–5.
- **Code:** `safebits_back/src/modules/auth/`, `modules/legal/`, `safebits_front/src/app/features/auth/`, `features/legal/`.
- **Migrations:** `private.sessions`, `public_profiles`, `consents`, and the Cron cleanup function.
- **External:** Supabase Auth (Google provider configured; built-in emails never used), a Google OAuth client with the production and staging origins, Turnstile hostnames.
- **Later verification:** the allergy and price disclaimer requirements are verified on the screens that show them, in changes 10–13.
