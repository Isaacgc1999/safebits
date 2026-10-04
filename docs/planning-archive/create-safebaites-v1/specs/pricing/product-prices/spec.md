# Spec Delta

## Purpose

Gives every product a usable price by combining a system estimate, the user's own real prices and an anonymous community median, while resisting mistaken and malicious entries.

## ADDED Requirements

### Requirement: Estimated reference price
Every product SHALL have an estimated price per pack with the date it was estimated. Wherever an estimate is used, it MUST be labelled "Estimado" with that date.

#### Scenario: Estimate shown
- **WHEN** a product has no user or community price
- **THEN** its price is shown as "Estimado · oct 2026"

### Requirement: Price resolution order
The price used for a user SHALL be their own price if they have one, otherwise the community median if one exists, otherwise the estimate. Each displayed price MUST show its source.

#### Scenario: Own price wins
- **WHEN** a user has entered 1,35 € for a product whose community median is 1,29 €
- **THEN** that user sees 1,35 € labelled "Tu precio"

#### Scenario: Community price
- **WHEN** a user has no own price and the product has a community median
- **THEN** the median is shown labelled "Comunidad · N usuarios"

### Requirement: User price entry
A user SHALL be able to enter the real price of a product from the product view, the shopping list or a receipt line. An accepted entry becomes that user's own price. Individual entries MUST be private: other users never see the value, the author or the time.

#### Scenario: Price saved
- **WHEN** a user enters a valid price for a product
- **THEN** it becomes their price for that product in all calculations

### Requirement: Price range validation
An entered price SHALL be accepted only if it is greater than 0, has at most two decimals, and lies between the reference ÷ 2.5 and the reference × 2.5. The reference is the community median when one exists, otherwise the estimate. Rejected values MUST show an error and MUST NOT be stored.

#### Scenario: Upper limit
- **WHEN** the reference is 2,00 € and the user enters 5,00 €
- **THEN** the price is accepted

#### Scenario: Above the upper limit
- **WHEN** the reference is 2,00 € and the user enters 5,01 €
- **THEN** it is rejected with "El precio introducido no coincide con el precio real de este producto"

#### Scenario: Lower limit
- **WHEN** the reference is 2,00 € and the user enters 0,80 €
- **THEN** the price is accepted

#### Scenario: Absurdly low value
- **WHEN** the reference is 2,00 € and the user enters 0,01 €
- **THEN** it is rejected with the same error and nothing is stored

### Requirement: Daily entry limit
A user SHALL be able to submit at most 5 price entries for the same product per calendar day (Madrid time). Rejected attempts also count towards the limit.

#### Scenario: Sixth entry
- **WHEN** a user submits a sixth price for the same product on the same day
- **THEN** it is refused with a message that the daily limit has been reached

### Requirement: Community median
A product's community price SHALL be the median of the latest accepted price of each distinct user from the last 90 days. It is only shown when at least 5 distinct users have contributed. Each user counts once per product.

#### Scenario: Four contributors
- **WHEN** only 4 distinct users have entered prices for a product in the last 90 days
- **THEN** no community price exists and the estimate is used

#### Scenario: Fifth contributor
- **WHEN** a fifth distinct user enters a price
- **THEN** the community price becomes the median of the five latest values

#### Scenario: Repeated entries by one user
- **WHEN** one user enters five prices for the same product
- **THEN** only their latest value counts towards the median

### Requirement: Report a wrong estimate
A user SHALL be able to report that a product's estimate seems wrong, once per product until an admin resolves it. Reports go to the admin queue.

#### Scenario: Estimate reported
- **WHEN** a user reports the estimate of a product
- **THEN** the report appears in the admin moderation queue and the user cannot report it again until it is resolved
