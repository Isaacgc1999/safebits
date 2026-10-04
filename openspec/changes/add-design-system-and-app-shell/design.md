# Design

## Context

- **`safebits-diseno/` is the visual source of truth.** It contains:
  - `design-system/README.md`, the brand book;
  - `tokens.json` (light and dark), plus `screens/ds/safebits/tokens.css`;
  - `components/bundle.css`, with each component's preview and README;
  - `screens/*.dc.html`, the screens: literal HTML and CSS specifications with copy and mock state;
  - `screens/screens.css`, the screen-level patterns;
  - `screens/Icons.dc.html`, the line-icon sprite;
  - `screens/canvas.json`, the board order.
- **What the design decided** (it replaces the earlier chamfered and navy proposal):
  - Cozy pastel colours, with pill buttons sitting on a 3 px lip and 20 px card radius.
  - Fraunces (SOFT 100) for display text and Atkinson Hyperlegible Next for body text.
  - Sentence case, no emoji, the informal "tú".
- **Known limits of the design:**
  - There is no logo; the owner chose the provided shield, redrawn in sage, next to the wordmark.
  - The colours are a proposal and must be checked.
  - Contrast was calculated by hand.
  - There are no loading or empty states, no 404, and no desktop editor or prep screens.
- **Brand sources:** `docs/brand/logo-source.jpg` (the shield) and `docs/brand/button-reference.png`, which the design superseded.
- **Base:** change 1 provides the Angular 22 app and the generic building blocks; change 2 provides the edge `_headers` step.

## Goals / Non-Goals

**Goals:**
- Pixel-faithful, accessible, fast components that every feature composes.
- Every screen in the inventory has a lazy route and a placeholder, so later changes only fill in features.

**Non-Goals:**
- Feature logic and data (later changes).

## Decisions

### 1. Tokens as code

- **Generation:** `tools/design/tokens` reads `tokens.json` and generates:
  - `safebits_front/src/styles/tokens.css`, with CSS custom properties for `:root`, `[data-theme="dark"]` and the higher-contrast overrides;
  - `shared/constants/design-tokens.ts`, with the typed token names used by components.
- **Single source:** the JSON stays the source, and CI fails if the generated files are stale.
- **Colour changes:** if the contrast or colour-vision checks fail, the JSON is adjusted. Each change is shown to the owner and recorded in `docs/design-decisions.md`.

### 2. Themes and contrast

- **The `ThemeStore`** is a signal store that holds the preference (`system`, `light`, `dark`) and the `contrast` flag, and sets `data-theme` and `data-contrast` on `<html>`.
  - `system` follows `prefers-color-scheme`.
  - The higher-contrast mode applies when `prefers-contrast: more` matches or the user switches it on: stronger `line-strong` boundaries, ink text on paper, and outlined variants instead of pastel fills.
  - `@media (forced-colors: active)` maps everything to system colours and keeps focus outlines and icons visible.
- **Persistence:** the preference is kept on the device. Syncing it to the account arrives with the profile in change 9.

### 3. Accessibility tooling

- **`tools/design/contrast`:** computes the WCAG ratio for every text and boundary token pair in both themes and in the higher-contrast mode.
- **`tools/design/cvd`:**
  - Simulates protanopia, deuteranopia and tritanopia on the semantic fills (Machado et al. 2009 matrices).
  - Requires a CIEDE2000 difference of at least 10 between every pair of semantic fills, and between each fill and `paper`.
  - Pairs that fail must also carry a distinct icon, which is always required anyway, and are reported to the owner.
- **Automated checks:** axe-core on every main screen in both themes, plus target-size and reflow checks at 320 px and 400% zoom.
- **Manual pass:** a screen-reader checklist (NVDA and VoiceOver) in `docs/accessibility.md`.

### 4. Brand mark

- **Redraw:** `docs/brand/logo-source.jpg` is redrawn as a two-tone SVG shield in `sage-ink` and `sage-fill`, plus a simplified glyph for sizes of 32 px and smaller.
- **Wordmark:** "safe" in ink and "bits" in italic sage, Fraunces with WONK on, rendered as live text in the header for accessibility and as SVG for icons.
- **Icons:** `tools/brand` (sharp) generates `favicon.svg`, `favicon.ico`, `apple-touch-icon`, and 192 and 512 px PWA icons, including maskable ones with a 20% safe zone.

### 5. Fonts and icons

- **Fonts:** `@fontsource-variable/fraunces` (opsz, wght, SOFT and WONK axes) and `@fontsource-variable/atkinson-hyperlegible-next`.
  - Only Latin and Latin Extended WOFF2 subsets.
  - The fonts needed for the first screen are preloaded, with `font-display: swap`.
  - `font-src 'self'`.
- **Icons:** the sprite is ported from `Icons.dc.html` as `assets/icons.svg` and used through an `sb-icon` component with `<use href>`. It has a 24 px grid, a 1.7 px stroke (2 px inside buttons and tags) and uses `currentColor`.

### 6. Component library (`shared/ui`)

- **How components are built:**
  - Every component is standalone and OnPush, with signal inputs and outputs and no business logic.
  - Generic where reuse exists, for example `sb-list<T>` with item templates and virtual scrolling, `sb-segmented<T>` and `sb-option-tiles<T>`.
  - Styles are ported from `bundle.css` and `screens.css` into component styles that use the tokens, and no comments are ported.
- **Components:**

| Component | Design source |
|---|---|
| `sb-button` (default, accent, quiet, danger, icon, sm, block; busy stripes) | Button |
| `sb-field` (label, hint, error, suffix; ≥ 16 px input) | Field |
| `sb-chip`, `sb-chips` (selectable, danger) | Chip |
| `sb-tag` (fridge, freeze, est, allergen, community; icon + text) | Tag |
| `sb-card` (interactive, flagged, warm, sunk) | Cover, MealCard |
| `sb-meal-card` | MealCard |
| `sb-meter` (over, steps) | Meter |
| `sb-sync` (synced, syncing N, offline N) | SyncStatus |
| `sb-row` (shopping row, 60 px, price source) | ShoppingRow |
| `sb-lanes` (Horno, Fuegos, Tú; now, heat, passive, done) | PrepTimeline |
| `sb-glyph`, `sb-check`, `sb-switch`, `sb-stepper`, `sb-code-input`, `sb-sheet`, `sb-dialog`, `sb-tabbar`, `sb-sidenav`, `sb-skeleton`, `sb-empty`, `sb-error`, `sb-env-badge` | screens.css and new designs |

- **Gallery and visual regression:** a development-only gallery route renders every component, state and theme. Playwright compares it with reference screenshots taken from the design previews rendered with local fonts, with a tolerance of 0.5% of pixels.

### 7. Screen inventory and routes

All feature routes are lazy. Placeholders are added now; each later change replaces its own.

| Route | Design file | Built in change |
|---|---|---|
| `/` (signed out) | DeskLanding | 4 |
| `/bienvenida`, `/crear-cuenta`, `/codigo`, `/entrar`, `/recuperar`, `/nueva-contrasena` | AuthBienvenida, AuthRegistro, AuthCodigo, AuthLogin, AuthReset | 6 |
| `/terminos-actualizados`, `/legal/*` | AppTerminos (+ new legal pages) | 6 |
| `/onboarding/:paso` (sheet or dialog) | Main, Onboarding2–10, DeskOnboarding | 9 |
| `/semana`, `/semana/cambiar/:slot` | AppSemana, DeskSemana, AppCambiar | 12 |
| `/recetas`, `/recetas/:id`, `/recetas/nueva`, `/recetas/:id/editar` | AppRecetas, DeskRecetas, AppReceta, AppEditor | 11 |
| `/recetas/:id/publicar`, `/recetas/:id/reportar` | AppPublicar, AppReportar | 14 |
| `/prep`, `/prep/taperes` | AppPrep, AppTaperes | 12 |
| `/lista`, `/lista/precio/:producto` | AppLista, DeskLista, AppPrecio | 13, 10 |
| `/tickets/:id`, `/despensa`, `/presupuesto` | AppTicket, AppDespensa, AppPresupuesto | 13 |
| `/tu`, `/tu/cuenta`, `/tu/eliminar` | AppAjustes, AppCuenta, AppEliminar | 9, 15 |
| `/avisos` | AppAvisos | 14 |
| `/admin` | DeskAdmin | 14 |
| `**` | new 404 design | 4 |

**Navigation:**
- **Mobile:** the tab bar (Semana, Recetas, Prep, Lista, Tú), hidden in focused flows.
- **Desktop (≥ 1024 px):** the 240 px side nav and two-column layouts.
- **Onboarding:** `sb-sheet` on mobile, `sb-dialog` on desktop.

### 8. Generic UX states

- **`ListState<T>`** (from change 1) drives the `sb-skeleton`, `sb-empty` and `sb-error` templates.
  - The skeleton appears only after 300 ms.
  - Empty states use one sentence and one action.
  - Error states use the product's voice with a retry.
- **Copy** follows the brand book ("Contiene huevo · Elegir otra", never "Error: …").

### 9. Missing designs, derived from the existing design

The owner decided that screens and states not in `safebits-diseno` are derived from the existing design, with no separate mock-up or approval round. They use only existing tokens, components and patterns, and add no new visual elements:

| Missing piece | Derived from |
|---|---|
| Loading skeletons for Semana, Recetas and Lista | the `.ghost` placeholder blocks in `screens.css`, shaped like each screen's cards |
| Empty states (Mis recetas, Avisos, Lista, Tickets, Despensa) | `sb-card--sunk` with a recipe glyph, one `body` sentence and one `sb-btn` |
| Generic error state | the `notice` pattern with butter colours, a retry `sb-btn--quiet`, and copy in the brand voice |
| 404 | the AuthBienvenida layout with the wordmark, one sentence and a "Volver a tu semana" button |
| Staging badge | `sb-tag` in butter with an icon and text |
| Demo banner | the `notice notice--sky` pattern pinned under the header, with a link |
| Higher-contrast variant | the same components with `line-strong` boundaries, ink text and outlined variants instead of pastel fills |
| Desktop editor and prep | the AppEditor and AppPrep sections in the two-column desktop grid of DeskRecetas and DeskSemana |

Each derivation is recorded in `docs/design-decisions.md` with the design it comes from, and covered by the visual regression suite.

### 10. Localization, HTTP and PWA

- **Transloco:** es (default) and en files bundled for offline use, with a CI key-parity check.
- **Locale helpers:** `Intl` formatting for EUR, dd/mm/yyyy, Madrid time and weeks starting on Monday.
- **HTTP:** the same-origin `ApiClient` with typed request and response schemas (zod parsing), an in-memory CSRF header, error mapping to the standard error shape, and a "failed fetch means offline" signal.
- **PWA:** `@angular/pwa`, with a manifest using the brand icons and colours, caching only the shell and assets, and an update prompt.
- **CSP:** Angular `autoCsp` hashes are exported to the edge `_headers` generator from change 2.

### 11. Performance budgets

Lighthouse CI runs on the landing page and the shell routes. Angular budgets match the spec: at most 200 kB of compressed initial JavaScript and 100 kB per lazy feature. A Playwright trace checks for long tasks.

## Risks / Trade-offs

- **The proposed pastels may fail the contrast or colour-vision thresholds.**
  - → Automated checks, token adjustments approved by the owner, and icons plus text everywhere.
- **Pixel comparison against the design previews is fragile with fonts.**
  - → Local fonts in both the previews and the app, and a 0.5% tolerance.
- **The sage shield may lose detail at 16 px.**
  - → A simplified glyph at small sizes.
- **Derived states could drift from the design's look.**
  - → They may only use existing tokens, components and patterns; each one is recorded with its source and covered by visual regression.
