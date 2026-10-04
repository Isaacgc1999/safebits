# Tasks

## 1. Tokens, themes and accessibility checks

- [ ] 1.1 Write `tools/design/tokens` to generate `tokens.css` (cream, cocoa and higher-contrast overrides) and typed token constants from `safebits-diseno/design-system/tokens.json`, with a CI staleness check; verify the generated CSS matches `screens/ds/safebits/tokens.css` for both themes
- [ ] 1.2 Write `tools/design/contrast` and `tools/design/cvd` (Machado simulation, CIEDE2000 ≥ 10); run them, propose any token adjustments to the owner, and record the approved values in `docs/design-decisions.md`; verify both checks pass in both themes and in the higher-contrast mode
- [ ] 1.3 Implement the signal `ThemeStore` (system, light or dark; contrast flag; `data-theme` and `data-contrast`; device persistence) with `prefers-contrast` and `forced-colors` support; verify unit tests and screenshots in all modes

## 2. Brand, fonts and icons

- [ ] 2.1 Redraw the shield from `docs/brand/logo-source.jpg` as a sage two-tone SVG plus a small glyph, build the wordmark (Fraunces WONK italic "bits"), and write `tools/brand` (sharp) to generate the favicon and PWA icons, including maskable ones; verify sizes, the maskable safe zone, and owner approval recorded in `docs/design-decisions.md`
- [ ] 2.2 Self-host `@fontsource-variable/fraunces` and `@fontsource-variable/atkinson-hyperlegible-next` (Latin and Latin Extended WOFF2 only, preload the first-screen fonts, `swap`); verify a Playwright test that no font or stylesheet is requested from another host and that ñ, á, ü, ¿ and ¡ render
- [ ] 2.3 Port the icon sprite from `Icons.dc.html` into `assets/icons.svg` with the `sb-icon` component; verify every icon in the sprite renders in the gallery

## 3. Component library

- [ ] 3.1 Build `sb-button`, `sb-field`, `sb-chip`/`sb-chips`, `sb-tag` and `sb-check`, with every state from the design, busy stripes, reduced motion and accessible names; verify unit tests per component
- [ ] 3.2 Build `sb-card`, `sb-meal-card`, `sb-meter`, `sb-sync`, `sb-row`, `sb-glyph` and `sb-lanes`; verify unit tests per component
- [ ] 3.3 Build `sb-sheet`, `sb-dialog` (focus trap and restore), `sb-stepper`, `sb-switch`, `sb-code-input`, `sb-segmented<T>`, `sb-option-tiles<T>` and `sb-list<T>` (CDK virtual scrolling); verify unit tests, including keyboard behaviour
- [ ] 3.4 Add the development-only gallery route and Playwright visual regression against reference screenshots of the design previews, in both themes, with the higher-contrast mode and reduced motion; verify every component matches within 0.5%

## 4. Missing states derived from the design

- [ ] 4.1 Record in `docs/design-decisions.md` how each missing piece is derived from the existing design (the table in design decision 9: skeletons, empty states, error state, 404, staging badge, demo banner, higher-contrast variant, desktop editor and prep layouts); verify every entry names its source design and uses only existing tokens, components and patterns
- [ ] 4.2 Build `sb-skeleton`, `sb-empty`, `sb-error`, `sb-env-badge`, `sb-demo-banner` and the 404 screen from those derivations, wired to `ListState<T>` (skeleton after 300 ms); verify unit tests for each state and visual regression snapshots in both themes

## 5. App shell and navigation

- [ ] 5.1 Build the shell: header with the shield and wordmark, the mobile tab bar (hidden in focused flows), the desktop side nav at ≥ 1024 px, the skip link and landmarks; verify Playwright at 375 px and 1440 px and keyboard navigation through the shell
- [ ] 5.2 Add lazy placeholder routes for every screen in the inventory of design decision 7, and the 404 screen; verify a test that the route list equals the inventory and that no feature route is eagerly imported
- [ ] 5.3 Build the prerendered public landing page from DeskLanding (links to sign in and to the demo) and configure `outputMode: "static"` with prerendering of the public routes; verify the build output contains the prerendered landing HTML
- [ ] 5.4 Run the accessibility suite (axe on every placeholder and the landing page in all modes, target size, reflow at 320 px and 400%) and write the manual screen-reader checklist in `docs/accessibility.md`; verify zero violations

## 6. Localization, HTTP and PWA

- [ ] 6.1 Set up Transloco (es default, en) with bundled files, a language switcher saved on the device, and the CI key-parity check; verify the check fails on a fixture with a missing key and switching needs no reload
- [ ] 6.2 Implement the locale helpers (EUR in es and en, dd/mm/yyyy, Madrid day and week boundaries starting Monday, kg/L thresholds); verify tests including "4,20 €", "1,5 kg" and a DST boundary
- [ ] 6.3 Implement the same-origin `ApiClient` (typed zod-parsed responses, in-memory CSRF header, error mapping, offline signal); verify unit tests
- [ ] 6.4 Add `@angular/pwa` (manifest with the brand icons, shell-only caching, update prompt) and export the `autoCsp` hashes to the edge `_headers` step; verify the installed shell loads offline and the staging CSP blocks a test inline script

## 7. Performance

- [ ] 7.1 Add Lighthouse CI (landing and shell routes) and Angular budgets aligned with the frontend-performance spec, plus a Playwright long-task trace; verify the pipeline fails on a fixture that breaks a budget and passes on the app
