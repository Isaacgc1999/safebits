# Spec Delta

## Purpose

Gives safebits its recognisable cozy-pastel look, built on the approved design system, the shield logo and self-hosted typography, while keeping every colour meaningful and the interface calm, warm and fast.

## ADDED Requirements

### Requirement: Brand mark
The brand mark SHALL be the provided shield (S, B and fork) redrawn in the sage palette, next to the "safebits" wordmark ("safe" in ink and "bits" in italic sage, set in the display typeface). The shield alone MUST be the favicon and the installed-app icon, delivered as a vector with a transparent background.

#### Scenario: Header
- **WHEN** any signed-in screen is shown
- **THEN** the header shows the sage shield and the wordmark crisply at every screen density

#### Scenario: Installed icon
- **WHEN** the app is installed on Android
- **THEN** the home-screen icon is the sage shield inside the maskable safe zone

### Requirement: Self-hosted fonts
All fonts SHALL be served from the app's own origin, from files bundled with the build. The app MUST NOT request fonts or stylesheets from any third-party host or remote URL. The fonts MUST include the Spanish characters (ñ, á, é, í, ó, ú, ü, ¿, ¡).

#### Scenario: No third-party font requests
- **WHEN** the network requests of a complete user journey are inspected
- **THEN** every font file is loaded from the app's origin and none from any other host

### Requirement: Typography roles
Titles, large figures and the wordmark SHALL use the soft display serif, and everything people read and tap MUST use the reading typeface. Text MUST be in sentence case, prices and quantities MUST use tabular figures, text MUST never be smaller than 13 px, and form inputs never smaller than 16 px.

#### Scenario: Aligned prices
- **WHEN** a shopping list with prices of different widths is shown
- **THEN** the decimal separators of the prices line up vertically

#### Scenario: No all-caps labels
- **WHEN** any button or label is rendered
- **THEN** its text is in sentence case

### Requirement: Colour roles
Each pastel SHALL keep one meaning: sage for the brand and default actions, peach for the single main action of a screen, butter for warnings, heat and estimates, rose for allergens and danger, sky for the freezer, and lilac for community content. Text on a pastel MUST use that colour's ink token.

#### Scenario: One main action
- **WHEN** any screen is rendered
- **THEN** it contains at most one peach button

#### Scenario: Rose only for danger
- **WHEN** a screen shows rose
- **THEN** it marks an allergen, a flagged meal or a destructive action

### Requirement: Soft, tactile controls
Buttons, chips, tags and meters SHALL be pill-shaped, and cards and panels MUST use the rounded radius tokens. Buttons sit on a 3 px lip in a deeper shade of their own colour, lift slightly on hover and sink into the lip when pressed. The focus outline is 3 px with a 3 px offset and follows the control's shape.

#### Scenario: Visual regression
- **WHEN** the component gallery is rendered in both themes
- **THEN** the screenshots match the approved design-system previews within tolerance

### Requirement: Interaction states
Every interactive control SHALL have distinct default, hover, focus-visible, pressed, disabled and busy states. Transitions MUST last 140 ms or 220 ms. A busy button shows gentle moving stripes and ignores further presses until its action ends.

#### Scenario: Busy button
- **WHEN** a user presses "Guardar" and the request is in progress
- **THEN** the button shows its busy state and ignores further presses until the request ends

### Requirement: Reduced motion
When the operating system requests reduced motion, all non-essential animations SHALL be disabled. Every state MUST remain distinguishable without motion.

#### Scenario: Reduced motion enabled
- **WHEN** the device has reduced motion enabled and the user hovers and presses a button
- **THEN** the state changes are shown without animation

### Requirement: Theme choice
Users SHALL choose between "Como el sistema" (the default), "Claro" (cream) and "Oscuro" (cocoa). The choice MUST apply instantly, work offline, and be saved on the device and, once signed in, on the account.

#### Scenario: System default
- **WHEN** a new user's system is in dark mode
- **THEN** the app opens in the cocoa theme

#### Scenario: Manual choice syncs
- **WHEN** a user picks "Claro" on one device
- **THEN** their other devices use the cream theme after syncing

### Requirement: Icons and images
Icons SHALL come from the in-house line-icon sprite (24 px grid, 1.7 px stroke, current colour), and version 1 MUST use no photographs. Any raster image MUST be served as AVIF or WebP, sized for its slot, with explicit dimensions, and lazy-loaded below the fold.

#### Scenario: Responsive image
- **WHEN** a raster image is displayed in a 320-pixel slot on a 2x screen
- **THEN** the browser receives an AVIF or WebP file about 640 pixels wide
