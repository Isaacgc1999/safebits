# Spec Delta

## Purpose

Sets measurable speed targets so safebits feels instant on mid-range phones and stays responsive while it works.

## ADDED Requirements

### Requirement: Core Web Vitals
On mid-range mobile emulation with throttled 4G, the landing, plan, recipe list and shopping list pages SHALL reach:
- Largest Contentful Paint of 2.5 s or less.
- Interaction to Next Paint of 200 ms or less.
- Cumulative Layout Shift of 0.1 or less.
- A Lighthouse performance score of at least 90.

#### Scenario: Performance gate
- **WHEN** the automated Lighthouse run measures a key page below any threshold
- **THEN** the pipeline fails and the change cannot be released

### Requirement: JavaScript budget
The JavaScript transferred for the first screen SHALL be at most 200 kB compressed, and each lazily loaded feature at most 100 kB compressed.

#### Scenario: Budget exceeded
- **WHEN** a build produces 230 kB of compressed initial JavaScript
- **THEN** the build fails and reports the budget breach

### Requirement: Fonts never block text
Text SHALL be visible immediately with a fallback font while the custom fonts load. Only WOFF2 files with Latin and Latin Extended subsets may be used. The fonts needed for the first screen MUST be preloaded and total at most 100 kB.

#### Scenario: Slow font
- **WHEN** font files load slowly
- **THEN** text is already readable in the fallback font and switches without shifting the layout

### Requirement: Long lists render only visible rows
Lists that can exceed 50 items SHALL render only the rows in or near the viewport, so scrolling stays smooth. This covers the recipe list, shopping lists, receipt history and the admin queue.

#### Scenario: Scrolling 2,000 recipes
- **WHEN** a user scrolls the full recipe list on mid-range mobile emulation
- **THEN** no main-thread task exceeds 50 ms during scrolling

### Requirement: Heavy work off the main thread
Plan generation, list optimisation and prep scheduling SHALL run off the main interface thread, so the interface stays responsive while they run.

#### Scenario: Generating a plan
- **WHEN** a user generates a plan and taps other controls while it runs
- **THEN** each interaction responds within 200 ms
