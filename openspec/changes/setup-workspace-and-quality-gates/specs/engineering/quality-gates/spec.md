# Spec Delta

## Purpose

Makes the project's engineering standards enforceable: every change must pass automated gates for style, typing, architecture, tests, dependencies and code quality before it can be merged or deployed.

## ADDED Requirements

### Requirement: Merge gate
Every pull request SHALL run the full pipeline, and merging into the main branch MUST be blocked unless every gate in this capability passes.

#### Scenario: Failing gate
- **WHEN** a pull request fails any gate
- **THEN** it cannot be merged until the failure is fixed

### Requirement: Zero lint findings
Linting of code, templates and styles SHALL report zero errors and zero warnings. Inline directives that disable lint rules MUST NOT be accepted.

#### Scenario: Disable directive
- **WHEN** a file contains an inline directive that disables a lint rule
- **THEN** the pipeline fails and names the file and line

### Requirement: No comments in source
Source files (TypeScript, JavaScript, HTML templates, stylesheets, SQL migrations and JSON configuration) SHALL contain no comments.

#### Scenario: Comment added
- **WHEN** a pull request adds a comment to any source file
- **THEN** the pipeline fails and names the file and line

### Requirement: Strict typing
Type-checking SHALL run with the project's strict compiler options. Explicit or implicit `any`, unsafe casts and non-null assertions MUST fail the pipeline.

#### Scenario: Implicit any
- **WHEN** a function parameter has no type and none can be inferred
- **THEN** type-checking fails

### Requirement: Declarations live in shared folders
Constants, enums, types, interfaces, models, schemas and mappers SHALL be declared only in the `shared/<kind>/` folder of their workspace, or in the shared package when several workspaces use them. Layer boundaries between features, shared code and core code MUST be enforced.

#### Scenario: Interface inside a component
- **WHEN** an interface is declared inside a component file
- **THEN** the pipeline fails and points to the shared folder where it belongs

#### Scenario: Feature importing another feature
- **WHEN** one frontend feature imports the internals of another feature
- **THEN** the pipeline fails

### Requirement: Frontend conventions
Every Angular component SHALL be standalone and use OnPush change detection with signal-based inputs, outputs, queries and state. Every feature route MUST be lazy-loaded. Reusable building blocks MUST be generic and fully typed rather than duplicated per feature.

#### Scenario: Missing OnPush
- **WHEN** a component is declared without OnPush change detection
- **THEN** linting fails

#### Scenario: Eager feature route
- **WHEN** a feature route imports its component eagerly
- **THEN** linting fails

### Requirement: Test coverage
Every workspace SHALL keep at least 90% coverage of lines, branches, functions and statements from unit and integration tests.

#### Scenario: Coverage drop
- **WHEN** a workspace's branch coverage falls to 89.9%
- **THEN** the pipeline fails

### Requirement: Code quality gate
The code quality analysis SHALL report zero bugs, vulnerabilities and code smells, no unreviewed security hotspots, at most 3% duplication and the top rating in every category, on both new and overall code.

#### Scenario: New code smell
- **WHEN** a pull request introduces a code smell
- **THEN** the quality gate fails and the pull request cannot be merged

### Requirement: Dependency vulnerabilities
Dependency auditing SHALL report zero known vulnerabilities of any severity. Installation MUST NOT use force flags, legacy peer dependency resolution, overrides or resolutions.

#### Scenario: Vulnerable dependency
- **WHEN** a dependency with a known vulnerability is added
- **THEN** the pipeline fails

#### Scenario: Forbidden install option
- **WHEN** the repository configuration enables legacy peer dependency resolution or defines overrides
- **THEN** the pipeline fails

### Requirement: Secret scanning
Commits that contain credentials, keys or tokens SHALL fail the pipeline.

#### Scenario: Committed key
- **WHEN** a commit adds a file containing an API key
- **THEN** the pipeline fails and names the file
