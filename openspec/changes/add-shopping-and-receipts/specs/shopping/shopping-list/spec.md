# Spec Delta

## Purpose

Converts the weekly plan into a shopping list per supermarket with concrete products, pack sizes and costs. The list is usable in the store and kept consistent with plan changes and the pantry.

## ADDED Requirements

### Requirement: Quantity aggregation
The list SHALL sum the quantity of each ingredient across all planned meals, scaled to portions, and subtract what is in the pantry.

#### Scenario: Aggregated quantity
- **WHEN** three planned meals need 300 g, 400 g and 200 g of chicken thighs and the pantry has none
- **THEN** the list needs 900 g of chicken thighs

### Requirement: Supermarket assignment
Each item SHALL be assigned to one of the user's chains so the total cost is lowest, without using more chains than the user's weekly maximum. When splitting across chains saves money, the saving MUST be shown.

#### Scenario: Saving from a second store
- **WHEN** the user allows 2 stores and splitting between Mercadona and Lidl is 6,40 € cheaper than either alone
- **THEN** the list is split and shows "Comprando en 2 supermercados ahorras 6,40 €"

### Requirement: Pack selection
For each item the list SHALL choose the pack combination that covers the needed quantity at the lowest cost, and show the leftover quantity.

#### Scenario: Cheapest pack combination
- **WHEN** 900 g is needed and the chain sells 500 g at 2,60 € and 1 kg at 4,90 €
- **THEN** one 1 kg pack is chosen and a leftover of 100 g is shown

### Requirement: Safe products only
The list SHALL only contain products compatible with the household's allergies, including traces.

#### Scenario: Unsafe product skipped
- **WHEN** the cheapest oat product has "may contain gluten" and the household is coeliac
- **THEN** a gluten-free oat product is chosen instead

### Requirement: List layout
The list SHALL be grouped by supermarket, then by store section (fruta y verdura, carne, pescado, lácteos, despensa, congelados, otros). Each line shows the product description, number of packs, price with its source, and the meals that use it.

#### Scenario: Line details
- **WHEN** a user opens the list
- **THEN** each line shows product, packs, price with source label and the recipes it is for

### Requirement: Ticking items off
Users SHALL be able to tick items as bought. Ticks work offline and sync across devices.

#### Scenario: Ticks synced
- **WHEN** items are ticked on a phone in the store and the phone later reconnects
- **THEN** the desktop shows the same items as bought after syncing

### Requirement: Recalculation after plan edits
When the plan changes after the list was made, the list SHALL keep ticked items and show additional needs as "Falta por comprar". It MUST remove unticked items no longer needed and move ticked items no longer needed to leftovers.

#### Scenario: Swap after shopping
- **WHEN** a user swaps a meal after ticking all items
- **THEN** only the new ingredients appear as "Falta por comprar"
- **AND** bought ingredients that are no longer needed become leftovers

### Requirement: Pantry
Users SHALL be able to mark staples they always have, such as salt, oil and spices, so they are left off the list. At the end of the week, leftovers of long-life ingredients MUST be added to the pantry with their quantities. Users MUST be able to edit or remove pantry items.

#### Scenario: Leftover rice carried over
- **WHEN** 600 g of a 1 kg rice pack is left at the end of the week
- **THEN** the pantry shows 400 g of rice and next week's list needs 400 g less rice

#### Scenario: Fresh leftovers not carried over
- **WHEN** spinach is left over at the end of the week
- **THEN** it is not added to the pantry automatically

### Requirement: Extra items
Users SHALL be able to add extra free-text items to the list, with an optional price that, when given, counts towards the list total.

#### Scenario: Extra item
- **WHEN** a user adds "papel de cocina" with 1,20 €
- **THEN** it appears in the chosen supermarket section and the total increases by 1,20 €
