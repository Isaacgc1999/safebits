# Spec Delta

## Purpose

Makes safebits usable by everyone, including people with low vision or colour-vision deficiencies and people who rely on a keyboard or a screen reader.

## ADDED Requirements

### Requirement: Contrast
In both themes, text SHALL reach at least 4.5:1 against its background (3:1 for large text), and interface boundaries and focus indicators at least 3:1. Every token pair used for text or boundaries MUST be checked automatically.

#### Scenario: Token check
- **WHEN** the contrast check runs over every text and boundary token pair in both themes
- **THEN** every pair meets its minimum

### Requirement: Colour-vision safety
Meaning SHALL never depend on colour alone: every coloured state, tag or badge MUST also carry an icon and text. The semantic fills MUST stay distinguishable from each other under protanopia, deuteranopia and tritanopia simulations.

#### Scenario: Flagged meal in greyscale
- **WHEN** a screenshot of the plan with a flagged meal is converted to greyscale
- **THEN** the flagged meal is still identifiable by its icon and its "Contiene huevo" text

#### Scenario: Simulation check
- **WHEN** the colour-vision simulation runs over the semantic fills of both themes
- **THEN** every pair keeps a perceptible difference above the project threshold

### Requirement: Higher contrast mode
When the system requests more contrast, or the user turns on "Contraste alto" in account settings, the app SHALL use stronger boundaries, ink text on paper and outlined variants instead of pastel fills. In forced-colours mode it MUST use the system colours and keep focus outlines and icons visible.

#### Scenario: Windows high contrast
- **WHEN** the app is opened with forced colours active
- **THEN** every control, icon and focus outline remains visible and usable

### Requirement: Keyboard operability
Every function SHALL be usable with a keyboard alone, in a logical focus order and without keyboard traps. Sheets and dialogs MUST keep focus inside while open and return it to the opener when closed, and a skip link MUST lead to the main content.

#### Scenario: Swap a meal by keyboard
- **WHEN** a user swaps a meal using only the keyboard
- **THEN** they can open the swap sheet, choose a recipe and confirm, and focus returns to the meal

### Requirement: Screen reader support
Every control SHALL have an accessible name, icon-only buttons MUST be labelled, and screens MUST use headings and landmarks. Status changes such as the sync state, form errors, timers and busy buttons MUST be announced through live regions.

#### Scenario: Form error announced
- **WHEN** a registration form is submitted with an invalid email
- **THEN** the error is announced by the screen reader and linked to the field

### Requirement: Zoom and reflow
Content SHALL remain usable at 400% zoom and at 320 CSS pixels wide without horizontal page scrolling; only the prep timeline may scroll inside its own region. Increased text spacing MUST NOT hide content.

#### Scenario: 400% zoom
- **WHEN** the shopping list is shown at 400% zoom
- **THEN** every item can be read and ticked without horizontal page scrolling

### Requirement: Touch targets
On touch devices every target SHALL be at least 44 by 44 CSS pixels, and shopping list rows at least 60 pixels tall.

#### Scenario: Target-size check
- **WHEN** the automated target-size check runs on every main screen
- **THEN** no violation is reported
