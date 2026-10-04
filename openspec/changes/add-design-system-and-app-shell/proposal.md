# Proposal

## Why

The owner approved a complete design in `safebits-diseno/`. It contains the cozy pastel design system, 41 screens, an icon sprite and a brand book. Every feature screen will be built from it, so the design system, accessibility rules, navigation, empty/loading/error states, translations and performance budgets must exist first. Otherwise each feature would re-implement them and drift from the design.

## What Changes

- **Design tokens:** generated from `safebits-diseno/design-system/tokens.json`. That covers the cream and cocoa themes and the pastel roles (sage, peach, butter, rose, sky, lilac, each with fill, lip and ink), plus type, spacing, radius and shadows.
- **Themes:** "Como el sistema" (default), "Claro" and "Oscuro". A higher-contrast mode follows the system setting or the user's "Contraste alto" switch, and forced colours are supported.
- **Colour-blind-safe palette:** checked with protanopia, deuteranopia and tritanopia simulations, and meaning never depends on colour alone.
- **Brand:** the provided shield redrawn in sage next to the "safebits" wordmark, with favicon and installed-app icons generated from the shield.
- **Fonts and icons:** Fraunces and Atkinson Hyperlegible Next, self-hosted from npm. The line-icon sprite is ported from `Icons.dc.html`.
- **Component library:** generic, signal-based, OnPush, ported from `components/bundle.css` and `screens/screens.css`. It covers button, field, chip, tag, card, meal card, meter, sync pill, shopping row, prep lanes, glyph, sheet, stepper, switch, option tiles, code input, segmented control, tab bar and side nav. It includes a development-only gallery and visual regression tests against the design previews.
- **App shell:**
  - The mobile tab bar (Semana, Recetas, Prep, Lista, Tú) and the desktop side nav.
  - Lazy routes for every screen in the inventory.
  - Generic loading, empty and error states and a 404 screen.
  - The prerendered public landing page.
- **Missing screens and states derived from the existing design** (no separate mock-ups): loading skeletons, empty states, the error state, 404, the staging badge, the demo banner, the high-contrast variant, and the desktop editor and prep layouts.
- **Also:**
  - Transloco (es and en) with a check that both languages have the same keys, plus locale helpers.
  - The same-origin HTTP layer.
  - `@angular/pwa`.
  - Angular `autoCsp` hashes fed to the edge `_headers`.
  - Lighthouse CI and performance budgets.

## Capabilities

### New Capabilities

- `design/visual-identity`: the brand mark, self-hosted fonts, typography roles, colour roles, soft tactile controls, interaction states, reduced motion, theme choice, icons and images.
- `design/accessibility`: contrast, colour-vision safety, higher-contrast mode, keyboard operability, screen reader support, zoom and reflow, touch targets.
- `design/screens-and-navigation`: the screen inventory, mobile and desktop navigation, onboarding presentation, the public landing page, loading/empty/error states, and fidelity to the design.
- `platform/localization`: languages, translation coverage, translated catalog content, formats, time zone and metric units.
- `platform/frontend-performance`: Core Web Vitals, the JavaScript budget, fonts that never block text, virtualised long lists, heavy work off the main thread.

### Modified Capabilities

None.

## Impact

- **Depends on** changes 1–3.
- **Code:** `safebits_front/src/app/shared/ui/`, `core/` (shell, theme, i18n, HTTP), `features/*` (route stubs), `tools/design/` (token generation, contrast and colour-vision checks), `tools/brand/`.
- **Design source:** `safebits-diseno/` is used as delivered. Derived states and any colour adjustments are recorded in `docs/design-decisions.md`.
- **Dependencies:** `@angular/pwa`, `@angular/cdk`, `@jsverse/transloco` (MIT), `@fontsource-variable/fraunces` and `@fontsource-variable/atkinson-hyperlegible-next` (OFL), `sharp` (dev), `@axe-core/playwright` (dev), `@lhci/cli` (dev).
