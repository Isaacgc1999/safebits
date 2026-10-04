# Spec Delta

## Purpose

Sets the conventions every API endpoint follows so the backend stays efficient, predictable and able to scale horizontally.

## ADDED Requirements

### Requirement: Efficient payloads
API responses SHALL be compressed. Catalog chunks MUST be cacheable through versioned identifiers and validators. List endpoints MUST use cursor pagination with a maximum page size of 100 items.

#### Scenario: Oversized page request
- **WHEN** a client asks for 500 recipes in one page
- **THEN** at most 100 are returned together with a cursor for the next page

### Requirement: Stateless instances
Backend instances SHALL keep no user or session state in memory between requests, so any instance can serve any request.

#### Scenario: Session across instances
- **WHEN** a user signs in through one instance and the next request reaches another
- **THEN** the request is authenticated normally

### Requirement: Consistent error responses
Every API error SHALL use one JSON shape with a stable error code, a message that is safe to show, and the request's correlation ID.

#### Scenario: Validation error
- **WHEN** a request fails validation
- **THEN** the response is HTTP 400 with the standard error shape and no internal details
