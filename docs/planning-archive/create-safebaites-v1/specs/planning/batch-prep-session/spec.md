# Spec Delta

## Purpose

Turns the weekly plan into a practical prep-day session: an ordered timeline that respects the equipment, plus clear fridge and freezer instructions so food stays safe until it is eaten.

## ADDED Requirements

### Requirement: Storage feasibility
A planned meal SHALL go in the fridge if it is eaten within the recipe's fridge days counted from the prep day. Otherwise it goes in the freezer with an instruction to move it to the fridge the day before, if the recipe is freezable. Otherwise it MUST NOT be placed in that slot.

#### Scenario: Fridge then freezer
- **WHEN** a dish that keeps 3 fridge days and is freezable is prepped on Sunday for Monday and Thursday
- **THEN** Monday's portions go in the fridge
- **AND** Thursday's go in the freezer with "pasar a la nevera el miércoles"

#### Scenario: Not freezable, too late
- **WHEN** a non-freezable dish that keeps 2 fridge days is placed on Thursday after a Sunday prep
- **THEN** the placement is refused with the storage reason shown

### Requirement: Prep timeline
The app SHALL produce an ordered prep-day timeline that merges all planned recipes:
- Shared preparation is grouped, such as chopping all onions at once with the total quantity.
- Independent tasks run in parallel.
- Each task shows its start time, and the total duration is estimated.

#### Scenario: Grouped chopping
- **WHEN** three recipes each need chopped onion
- **THEN** the timeline has a single task to chop the total quantity of onion

### Requirement: Equipment capacity in the timeline
The timeline SHALL never schedule more simultaneous oven tasks than ovens, nor more hob tasks than burners. Simultaneous tasks in one oven MUST share the same temperature.

#### Scenario: Two temperatures, one oven
- **WHEN** one oven is available and two recipes need 200 °C and 180 °C
- **THEN** the two oven tasks are scheduled one after the other

### Requirement: Portioning and labels
The session SHALL end with a portioning list: for each meal, the number of containers, fridge or freezer, and label text (dish, day to eat, eat-by date), plus the total number of containers.

#### Scenario: Container count
- **WHEN** the plan has 5 dinners for a household of 2 stored as one container per meal
- **THEN** the list shows 5 labelled containers with their storage place

### Requirement: Interactive checklist
Users SHALL be able to tick timeline steps as they cook. Progress is saved, works offline and syncs across devices.

#### Scenario: Progress kept
- **WHEN** a user ticks 6 steps on a tablet and later opens the session on a phone
- **THEN** the phone shows the 6 steps as done after syncing

### Requirement: Day-of instructions
Each day's meal SHALL show reheating instructions and any same-day finishing step, such as dressing a salad.

#### Scenario: Same-day step
- **WHEN** Wednesday's lunch is a salad whose dressing is added on the day
- **THEN** Wednesday shows "aliñar justo antes de comer" with the reheating or serving notes
