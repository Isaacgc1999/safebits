# Tasks

## 1. Credentials and profile

- [ ] 1.1 Implement the alias change (format, uniqueness, blocklist) shown at once on published recipes; verify integration tests for the taken-alias and alias-updated scenarios
- [ ] 1.2 Implement the password change (current password, other sessions ended) and setting a password for Google accounts through a code; verify integration tests, including a wrong current password counting towards the cooldown
- [ ] 1.3 Implement the email change (code to the new address, notice to the old one); verify an integration test with Mailpit locally and the capture inbox in staging

## 2. Sessions and export

- [ ] 2.1 Implement the active sessions list with revoke-one and revoke-others; verify revoked sessions fail immediately
- [ ] 2.2 Implement the export registry and the streaming JSON export (recent sign-in, rate limit, decrypted health data for the owner); verify a test that the file contains every category of the spec

## 3. Deletion

- [ ] 3.1 Implement the deletion registry and the transactional deletion of design decision 4; verify integration tests that another user's plan still works with the recipe now shown as "Sistema", price entries remain only anonymously, every table is clean of the user ID, and the email can register again

## 4. Screens

- [ ] 4.1 Build AppCuenta (alias, email, password, sessions, export, theme and contrast) and AppEliminar (re-authentication, clear consequences, rose destructive action), in es and en; verify a Playwright end-to-end test of deletion, axe, and visual comparison with the designs
