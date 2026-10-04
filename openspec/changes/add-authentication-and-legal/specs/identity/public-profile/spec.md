# Spec Delta

## Purpose

Gives every account a public alias that is the only identity other users ever see.

## ADDED Requirements

### Requirement: Public alias
Every account SHALL receive a unique random alias when it is activated, such as "cocina_7f3k". Aliases MUST be 3 to 20 characters (letters, digits, underscore, dot), unique ignoring case and not on the offensive-words list. The real name MUST never be shown to other users.

#### Scenario: Alias on activation
- **WHEN** an account is activated
- **THEN** it has a unique alias that follows the format rules

#### Scenario: Real name stays private
- **WHEN** a user who signed in with Google publishes a recipe
- **THEN** other users see only the alias, never the name obtained from Google
