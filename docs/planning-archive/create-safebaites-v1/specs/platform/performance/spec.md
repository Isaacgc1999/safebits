# Spec Delta

## Purpose

Sets measurable speed and scalability targets so the app feels instant on mid-range phones and the backend stays responsive as the number of users grows.

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

### Requirement: Non-blocking catalog download
On first use, recipe summaries SHALL become available before full recipe details. The app MUST stay usable while the rest of the catalog downloads in the background, and an interrupted download MUST resume where it stopped.

#### Scenario: Interrupted first download
- **WHEN** the connection drops halfway through the first catalog download and later returns
- **THEN** the download resumes from the last completed chunk and the app stays usable throughout

### Requirement: Heavy work off the main thread
Plan generation, list optimisation and prep scheduling SHALL run off the main interface thread, so the interface stays responsive while they run.

#### Scenario: Generating a plan
- **WHEN** a user generates a plan and taps other controls while it runs
- **THEN** each interaction responds within 200 ms

### Requirement: API latency under load
In the load-test environment, each backend instance SHALL sustain 100 requests per second of a realistic traffic mix for 10 minutes with:
- p95 latency of 250 ms or less for reads;
- p95 latency of 500 ms or less for writes;
- an error rate below 0.1%.

#### Scenario: Load test
- **WHEN** the load test runs against one instance
- **THEN** all latency and error thresholds are met, or the pipeline fails

### Requirement: Horizontal scalability
Backend instances SHALL be stateless: any instance can serve any request. Adding instances MUST increase throughput with no code or data changes.

#### Scenario: Session across instances
- **WHEN** a user signs in through one instance and the next request reaches another
- **THEN** the request is authenticated normally

#### Scenario: Scaling out
- **WHEN** the load test runs against two instances instead of one
- **THEN** sustained throughput is at least 1.8 times that of a single instance within the same latency thresholds

### Requirement: Efficient payloads
API responses SHALL be compressed. Catalog chunks MUST be cacheable through versioned identifiers and validators. List endpoints MUST use cursor pagination with a maximum page size of 100 items.

#### Scenario: Oversized page request
- **WHEN** a client asks for 500 recipes in one page
- **THEN** at most 100 are returned together with a cursor for the next page
