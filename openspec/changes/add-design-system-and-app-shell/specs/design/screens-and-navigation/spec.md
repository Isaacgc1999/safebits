# Spec Delta

## Purpose

Defines which screens safebits has, how people move between them, and how every screen behaves while loading, empty, failing or offline, following the approved designs.

## ADDED Requirements

### Requirement: Screen inventory
The app SHALL provide every screen in the approved design inventory, each at a stable route, and every screen MUST be reachable through navigation or a defined flow.

#### Scenario: Inventory check
- **WHEN** the route list is compared with the screen inventory
- **THEN** every screen has a route and every route belongs to the inventory

### Requirement: Mobile navigation
Below 1024 px the app SHALL show a rounded bottom tab bar with Semana, Recetas, Prep, Lista and Tú, marking the active tab with a sage pill behind its icon. The tab bar MUST be hidden inside focused flows such as onboarding, the recipe editor and the code screens.

#### Scenario: Switching tabs
- **WHEN** a user taps Lista on the tab bar
- **THEN** the shopping list opens and the Lista tab is marked active

### Requirement: Desktop navigation
From 1024 px the app SHALL show a 240 px side navigation with the same destinations, and use the desktop layouts of the approved designs, such as the five-day plan grid with a side column.

#### Scenario: Desktop week
- **WHEN** a signed-in user opens the plan on a 1440 px screen
- **THEN** the side navigation, the five-day grid and the side column with the budget and prep cards are shown

### Requirement: Onboarding presentation
Onboarding SHALL appear as a modal sheet on mobile and as a dialog on desktop, with a "Paso N de 10" indicator and back and next actions.

#### Scenario: Step indicator
- **WHEN** a user reaches the cuisines step
- **THEN** the sheet shows "Paso 4 de 10"

### Requirement: Public landing page
Signed-out visitors SHALL see the public landing page at the root of the app, prerendered so it loads without running the application code. Signed-in users opening the root MUST land on their week.

#### Scenario: Signed-out visitor
- **WHEN** a signed-out visitor opens `https://safebits.isaacgarcia.stream/`
- **THEN** the prerendered landing page is shown with links to sign in and to the demo

### Requirement: Loading states
Content that takes longer than 300 ms to appear SHALL show a skeleton shaped like the final layout. Full-screen spinners MUST NOT be used after the first launch.

#### Scenario: Slow recipe list
- **WHEN** the recipe list takes one second to load
- **THEN** skeleton cards are shown until the real cards arrive

### Requirement: Empty states
Every list or screen that can be empty SHALL explain why in one short sentence and offer one action.

#### Scenario: Empty cookbook
- **WHEN** a user with no own recipes opens "Mis recetas"
- **THEN** they see "Aún no tienes recetas propias" and a "Crear receta" button

### Requirement: Error states
A failed load SHALL show a short message in the product's voice with a retry action, never raw error text. Unknown routes MUST show a not-found screen with a way back to the week.

#### Scenario: Unknown route
- **WHEN** a user opens `/no-existe`
- **THEN** the not-found screen is shown with a button back to the week

### Requirement: Design fidelity
Implemented screens SHALL match the approved designs (layout, copy and states) within the visual-comparison tolerance. Screens or states missing from the designs MUST be built only from the existing design system's tokens, components and patterns, without new visual elements, and each one MUST be recorded with the existing design it derives from.

#### Scenario: Missing state
- **WHEN** a screen needs an error state that the designs do not show
- **THEN** it is built from existing components and patterns and recorded in the design decisions log with its source
