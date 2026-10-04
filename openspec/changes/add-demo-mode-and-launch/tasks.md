# Tasks

## 1. Demo mode

- [ ] 1.1 Add the `demo` build configuration (no manifest, no service worker) and `provideDemoMode()` binding every `Repository<TEntity>` to `DemoRepository<TEntity>` on the `sb-demo` database; verify unit tests that no demo provider can reach the `ApiClient`
- [ ] 1.2 Write the fixture generator (household of two, planned week, list, prep progress, sample receipt) and copy the catalog chunks into `assets/demo/catalog/` at build time; verify a test that every recipe referenced by the fixture exists in the copied catalog
- [ ] 1.3 Implement the typed `FeatureFlags` and the "No disponible en la demo" sheet with the link to create a real account, applied to every gated action; verify unit tests per flag and a Playwright test for the publish scenario
- [ ] 1.4 Show the `sb-demo-banner` from change 4, "Restablecer demo" and the automatic reset 24 hours after the first change; verify Playwright for the reset scenario and a fake-clock test for the automatic reset
- [ ] 1.5 Add the `demo` edge environment (Custom Domain `demo.safebits.isaacgarcia.stream`, static only, `/api/*` 404, `noindex`, CSP `connect-src 'self'`) and deploy it with production; verify a Playwright network check that every request of a full demo journey goes to the demo origin and no install option is offered
- [ ] 1.6 Run the core flows in the demo (regenerate the week, swap, prep, list, receipt, price entry, recipes, cookbook); verify Playwright passes for each, plus axe and visual comparison of the banner

## 2. Launch

- [ ] 2.1 Link the demo from the landing page; verify the link works from the prerendered page
- [ ] 2.2 Run the full journey in es and en on production (desktop Chrome and Edge, Android Chrome, installed iPhone app including Google through the PKCE fallback) and confirm the restore drill from change 16 is recorded; verify every item in `docs/release-checklist.md` is ticked
- [ ] 2.3 Run an OWASP ZAP scan against production; verify no high or medium alerts remain, or each one is documented as a false positive

## 3. DMARC enforcement after launch

- [ ] 3.1 After 14 consecutive days of reports meeting the exit criteria, move to `p=quarantine; sp=quarantine` and log the date and figures in `docs/email.md`; verify the record resolves with the new policy and production emails still reach the inbox
- [ ] 3.2 After another 14 such days, and within 8 weeks of the first production email, move to `p=reject; sp=reject` and log it; verify the record shows both values and a spoofed test message claiming `no-reply@safebits.isaacgarcia.stream`, sent to Gmail from an unauthorised server, is rejected
