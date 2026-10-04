# Spec Delta

## Purpose

Delivers the whole app in Spanish by default and in English on demand, with Spanish conventions for currency, numbers, dates, time zone and metric units.

## ADDED Requirements

### Requirement: Language selection
The app SHALL use Spanish by default and let the user switch between Spanish and English from settings and the sign-in screen. The switch MUST work offline and without losing data or reloading. The choice is saved on the device and, once signed in, on the account.

#### Scenario: Switch to English
- **WHEN** a user selects English in settings
- **THEN** the whole interface changes to English immediately

### Requirement: Complete translation coverage
Every interface text, email, error message and legal page SHALL exist in both languages. The build MUST fail if a text is missing in either language.

#### Scenario: Missing translation
- **WHEN** a developer adds a text in Spanish only
- **THEN** the build fails and names the missing key

### Requirement: Translated catalog content
System recipes, ingredients, products, equipment and categories SHALL be shown in the selected language.

#### Scenario: System recipe in English
- **WHEN** an English user opens a system recipe
- **THEN** its title, ingredients and steps are in English

### Requirement: Formats and time zone
Amounts SHALL be shown in euros using the conventions of the selected language, such as "4,20 €" in Spanish. Dates use day/month/year. Weeks start on Monday. Daily limits and week boundaries MUST use Madrid time.

#### Scenario: Spanish formatting
- **WHEN** a price of 4.2 euros is shown in Spanish
- **THEN** it is displayed as "4,20 €"

### Requirement: Metric units
Quantities SHALL be shown in g, kg, ml, L or units. Values of 1,000 g or more MUST be shown in kg, and 1,000 ml or more in L.

#### Scenario: Kilograms
- **WHEN** a list line needs 1500 g
- **THEN** it is shown as "1,5 kg" in Spanish
