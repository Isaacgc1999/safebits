# Spec Delta

## Purpose

Records what the user actually bought and paid in each supermarket, to track real spending against the plan and keep the user's prices accurate.

## ADDED Requirements

### Requirement: Manual receipt entry
A user SHALL be able to create a receipt with:
- The supermarket and date.
- Lines, each a catalog product or free text, with quantity and price paid.
- Optional discount lines.

The total is computed from the lines.

#### Scenario: Receipt saved
- **WHEN** a user enters a Lidl receipt with 12 product lines and one discount line
- **THEN** it is saved with the computed total

### Requirement: Prefill from the shopping list
Finishing shopping in a supermarket SHALL create a draft receipt prefilled with that supermarket's ticked items and their current prices. The user can edit lines before saving.

#### Scenario: Terminar compra
- **WHEN** a user presses "Terminar compra" for Mercadona
- **THEN** a draft receipt opens with the ticked Mercadona items and their prices

### Requirement: Receipt prices update user prices
Each product line's unit price SHALL be submitted as a user price entry, subject to price validation and daily limits. A line whose price is rejected MUST be corrected or removed before the receipt can be saved.

#### Scenario: Price out of range on a receipt
- **WHEN** a receipt line has a price outside the allowed range for that product
- **THEN** that line shows the price error and the receipt cannot be saved until it is fixed

#### Scenario: Valid prices update user prices
- **WHEN** a receipt with valid line prices is saved
- **THEN** those prices become the user's own prices for those products

### Requirement: Receipt history
Users SHALL be able to list their receipts by week and month, view their details, edit them (with prices revalidated) and delete them.

#### Scenario: Monthly view
- **WHEN** a user opens October 2026
- **THEN** all receipts from that month are listed with their totals

### Requirement: Budget tracking
For each planned week the app SHALL show the budget, the plan's estimated cost and the actual spend from that week's receipts. Monthly and per-supermarket totals MUST also be shown.

#### Scenario: Planned against spent
- **WHEN** the budget is 60 €, the plan estimate is 54,30 € and receipts total 57,85 €
- **THEN** the week shows all three values and that spending stayed 2,15 € under budget

### Requirement: Offline receipts
Receipts SHALL be creatable offline. The server MUST revalidate them on sync. If a line is rejected on sync, the user MUST be notified to fix it.

#### Scenario: Rejected on sync
- **WHEN** an offline receipt line price is rejected by the server because the reference changed
- **THEN** the user is notified and the line is marked for correction
