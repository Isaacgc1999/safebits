# Spec Delta

## Purpose

Gives safeBAItes a recognisable, minimal and cozy look built on the provided logo, self-hosted typography and a distinctive chamfered control style, while staying accessible and fast.

## ADDED Requirements

### Requirement: Logo usage
The provided safeBAItes logo SHALL be the brand mark in the app header, the sign-in screens, the loading screen, the favicon and the installed-app icons. It MUST be delivered as a vector with a transparent background, and raster icons, including maskable ones, are generated from it at the required sizes.

#### Scenario: Installed app icon
- **WHEN** a user installs the app on Android
- **THEN** the home-screen icon shows the safeBAItes logo correctly inside the maskable safe zone

#### Scenario: Header mark
- **WHEN** any signed-in screen is shown
- **THEN** the header shows the logo as a crisp vector at every screen density

### Requirement: Self-hosted fonts
All fonts SHALL be served from the app's own origin, from files bundled with the build. The app MUST NOT request fonts or stylesheets from any third-party host or remote URL. The fonts MUST include the Spanish characters (ñ, á, é, í, ó, ú, ü, ¿, ¡).

#### Scenario: No third-party font requests
- **WHEN** the network requests of a complete user journey are inspected
- **THEN** every font file is loaded from the app's origin and none from any other host

### Requirement: Typography roles
Headings, buttons and labels SHALL use the display typeface in uppercase with wide letter spacing. Body text MUST use the reading typeface. Prices and quantities MUST use tabular figures so columns line up.

#### Scenario: Aligned prices
- **WHEN** a shopping list with prices of different widths is shown
- **THEN** the decimal separators of the prices line up vertically

### Requirement: Chamfered control style
Buttons, inputs, cards and panels SHALL share one chamfered shape: two opposite corners cut diagonally, a thin outline, an optional leading icon, and an uppercase letter-spaced label. Pill shapes and default browser control styles MUST NOT be used.

#### Scenario: Visual regression
- **WHEN** the visual regression suite renders the button, input, card and panel components in both themes
- **THEN** the screenshots match the approved chamfered references

### Requirement: Dynamic interaction states
Every interactive control SHALL have distinct default, hover, focus-visible, pressed, disabled and loading states. Hover, press and loading changes MUST be animated (for example an outline trace, an icon nudge or a subtle press), with each transition lasting 250 ms or less. The focus outline MUST follow the chamfered shape.

#### Scenario: Keyboard focus
- **WHEN** a user moves between buttons with the Tab key
- **THEN** the focused button shows a chamfer-shaped outline that is visible in both themes

#### Scenario: Loading state prevents double submission
- **WHEN** a user presses "Guardar" and the request is in progress
- **THEN** the button shows its animated loading state and ignores further presses until the request ends

### Requirement: Reduced motion
When the operating system requests reduced motion, all non-essential animations SHALL be disabled. Every state MUST remain distinguishable without motion.

#### Scenario: Reduced motion enabled
- **WHEN** the device has reduced motion enabled and the user hovers and presses a button
- **THEN** the state changes are shown without animation

### Requirement: Light and dark themes
The app SHALL offer a warm light theme and a deep navy dark theme, both using the greens of the logo as accents. It follows the system setting by default. A manual choice MUST be saved on the device and, once signed in, on the account.

#### Scenario: System dark mode
- **WHEN** a new user's system is in dark mode
- **THEN** the app opens in the dark theme

#### Scenario: Manual override
- **WHEN** a user picks the light theme while the system is dark
- **THEN** the app stays light on that device and on the user's other devices after syncing

### Requirement: Accessible visuals
Contrast SHALL meet WCAG 2.2 AA: 4.5:1 for text, and 3:1 for interface components and focus indicators. Touch targets MUST be at least 44 by 44 CSS pixels on touch devices. Information MUST never be conveyed by colour alone: allergen badges, for example, include text or an icon.

#### Scenario: Automated accessibility check
- **WHEN** the automated accessibility check runs on every main screen in both themes
- **THEN** it reports no contrast or target-size violations

### Requirement: Optimised images
Raster images SHALL be served as AVIF or WebP with a fallback, sized for the space they occupy, with explicit dimensions so the layout does not shift. Images below the fold MUST load lazily. Icons and illustrations MUST be vectors.

#### Scenario: Responsive image
- **WHEN** a raster image is displayed in a 320-pixel-wide slot on a 2x screen
- **THEN** the browser receives an AVIF or WebP file about 640 pixels wide
