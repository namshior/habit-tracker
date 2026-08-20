# Feature Specification: Core Habit Tracker

**Feature Branch**: `001-core-habit-tracker`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "Build the core Habit Tracker: users can add habits, mark each habit as done or skipped for each day, view the current streak for each habit, and explicitly define the behavior of a skipped day."

## Clarifications

### Session 2026-08-19

- Q: How should the daily habit status toggle interact in the UI? → A: Direct Checkbox + Action Menu (Single-click toggles Done/Pending; separate dedicated action/icon triggers "Skipped").
- Q: Does the Streak Freeze policy enforce a maximum threshold on consecutive skipped days? → A: Unlimited Consecutive Skips (Any sequence of explicitly marked "Skipped" days maintains the frozen streak until the next completion or unlogged missed day).
- Q: How should the system handle habit retirement / removal? → A: Both Archive and Hard Delete ("Archive" hides from active views while preserving history; "Delete" permanently purges after explicit confirmation).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Habit Creation and Configuration (Priority: P1)

A user wants to add habits they want to build (e.g., "Morning Meditation", "Read 20 Pages") and configure how each habit behaves when a day is marked as skipped, as well as archive or permanently delete habits they no longer wish to track.

**Why this priority**: Creating and managing habits is the prerequisite foundation for all habit tracking, daily logging, and streak computation.

**Independent Test**: Can be tested independently by creating a habit with a name, description, and chosen skip policy ("Streak Freeze" vs "Streak Reset"), and verifying it appears in the active habit list with correct settings, and can be archived or deleted.

**Acceptance Scenarios**:

1. **Given** a user is on the habit management interface, **When** they submit a new habit with title "Drink 2L Water" and skip policy "Streak Freeze", **Then** the habit is created and appears in the active habits list with a starting streak of 0.
2. **Given** an existing habit, **When** the user updates its title or changes its skip policy, **Then** the updated configuration is saved and immediately reflected across the application.
3. **Given** an existing habit, **When** the user archives it, **Then** it is hidden from the active daily tracker while preserving all past logs and streak metrics.
4. **Given** an existing habit, **When** the user deletes it and confirms the prompt, **Then** the habit and all its associated historical logs are permanently removed.
5. **Given** a user attempts to create a habit with an empty title, **When** they submit the form, **Then** the system prevents creation and displays a validation message.

---

### User Story 2 - Daily Status Logging (Done, Skipped, Pending) (Priority: P1)

A user wants to quickly check off their daily habits as "Done" with a single click or mark them as "Skipped" via a dedicated skip action (e.g., when sick, traveling, or taking a planned rest day), or undo an accidental mark back to "Pending".

**Why this priority**: Daily logging is the primary recurring interaction for users; a direct single-click completion path combined with an explicit skip action prevents accidental state cycling while ensuring friction-free daily logging.

**Independent Test**: Can be tested independently by clicking the primary checkbox to toggle "Done"/"Pending" and using the dedicated skip action to mark "Skipped" for the current date, verifying the status persists immediately.

**Acceptance Scenarios**:

1. **Given** an active habit for today in "Pending" status, **When** the user clicks the primary habit check-off target, **Then** the status updates to "Done", a completion record is stored for today, and the habit displays a completed state.
2. **Given** an active habit for today in "Pending" or "Done" status, **When** the user selects the dedicated "Skip" action from the habit row or action menu, **Then** the status updates to "Skipped" and the skip record is stored for today.
3. **Given** a habit marked as "Done" or "Skipped" today, **When** the user unmarks it (clicks completed check-off or selects clear), **Then** the status reverts to "Pending" and the daily log record is cleared.

---

### User Story 3 - Streak Computation & Explicit Skipped-Day Rules (Priority: P1)

A user wants to see their current streak count and longest streak for each habit, calculated accurately according to that habit's explicit skipped-day policy.

**Why this priority**: Streaks provide the core psychological motivation for habit adherence; accurate calculation according to explicit rules builds trust.

**Independent Test**: Can be tested independently by feeding defined multi-day sequences of (Done, Skipped, Missed) statuses to a habit and verifying the resulting current streak and longest streak match the configured policy mathematics.

**Acceptance Scenarios**:

1. **Given** a habit configured with **Streak Freeze** (default), **When** logs for consecutive days are `[Done, Done, Skipped, Done]`, **Then** the current streak is calculated as `3` (the skipped day preserved the streak without resetting it or incrementing it).
2. **Given** a habit configured with **Streak Freeze** and multiple consecutive skipped days `[Done, Done, Skipped, Skipped, Skipped, Done]`, **Then** the current streak is preserved across all consecutive skips and becomes `3` upon the next completion.
3. **Given** a habit configured with **Streak Reset**, **When** logs for consecutive days are `[Done, Done, Skipped, Done]`, **Then** the current streak is calculated as `1` (the skipped day broke the previous streak, resetting it).
4. **Given** a habit with logs `[Done, Done, Missed (no log), Done]`, **When** streak is calculated under either policy, **Then** the current streak is `1` because an unmarked/missed day always breaks a streak.
5. **Given** a habit with consecutive completed days and today's status still "Pending", **When** yesterday was completed, **Then** the active streak from yesterday is retained and marked as active for today.

---

### User Story 4 - Historical Day-by-Day Tracking & Retrospective Edits (Priority: P2)

A user wants to navigate past days (e.g., this week or this month), view previous daily statuses, and retroactively mark or correct a status for a past day they forgot to log.

**Why this priority**: Users occasionally forget to log on the exact calendar day; allowing retroactive updates preserves data integrity without penalizing user lapses in logging.

**Independent Test**: Can be tested independently by navigating to a date 3 days ago, marking it as "Done", and confirming that both historical logs and subsequent streaks recalculate seamlessly.

**Acceptance Scenarios**:

1. **Given** a user viewing the weekly or calendar view, **When** they navigate to a previous calendar date, **Then** the historical status of each habit for that date is accurately displayed.
2. **Given** an unlogged (missed) past date, **When** the user retroactively marks it as "Done", **Then** the historical log is saved and the current/longest streaks are recalculated dynamically.
3. **Given** a user attempting to log for a future date, **When** the date is beyond the user's current local date, **Then** the system prevents status logging for future dates.

---

### Edge Cases

- **Multiple Consecutive Skipped Days (Freeze Policy)**: When a user logs multiple skipped days in a row (e.g., `[Done, Done, Skipped, Skipped, Skipped, Done]`), the streak remains frozen at `2` across all skipped days and resumes at `3` upon the next completed day, without arbitrary time limits on consecutive skips.
- **Leading Skipped Days**: When a habit starts with skipped days before any completed days (e.g., `[Skipped, Skipped, Done]`), the streak starts at `1` upon the first completed day without negative or undefined values.
- **All-Time Longest Streak Preservation**: When a current streak of 10 days is broken by a missed day, the `Current Streak` resets to 0 (or 1 on next completion), while `Longest Streak` remains preserved at 10.
- **Timezone Boundary Crossings**: When a user logs a habit near midnight or changes timezones, day categorization is evaluated against the user's local calendar date (YYYY-MM-DD) to prevent duplicate or shifted day entries.
- **Policy Modification on Existing History**: If a user changes a habit's skip policy from "Streak Reset" to "Streak Freeze" (or vice versa), the system deterministically recalculates streak values across historical logs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create new habits with a title (1 to 100 characters), optional description (up to 500 characters), and an explicit Skipped-Day Policy.
- **FR-002**: System MUST support two distinct Skipped-Day Policies per habit:
  - `Streak Freeze` (Default): A skipped day preserves the active streak without incrementing it or resetting it, supporting unlimited consecutive explicit skips.
  - `Streak Reset`: A skipped day breaks the active streak and resets it to 0, behaving identically to an uncompleted/missed day.
- **FR-003**: System MUST allow users to view, edit (title, description, skip policy), archive (hide from active tracking while retaining history), and permanently delete existing habits after confirmation.
- **FR-004**: System MUST provide a direct primary check-off interaction to toggle `Done` / `Pending` status and a dedicated secondary action/menu to mark `Skipped` status on any valid calendar date.
- **FR-005**: System MUST prevent logging completions or skips on future dates beyond the user's current local date.
- **FR-006**: System MUST compute `Current Streak` in real-time as the number of consecutive completed days leading up to today (including today if Done, or yesterday if today is still Pending, with skipped days evaluated according to the habit's policy).
- **FR-007**: System MUST compute `Longest Streak` representing the maximum consecutive completed streak recorded over the lifetime of the habit.
- **FR-008**: System MUST support retrospective status updates for past dates and automatically recompute historical records, current streaks, and longest streaks.
- **FR-009**: System MUST display visual indicators and status badges for habit states (Done, Skipped, Missed, Pending) across daily, weekly, and monthly views.
- **FR-010**: System MUST persist all habit metadata and daily status logs deterministically with UTC timestamps and local calendar date associations.

### Key Entities *(include if feature involves data)*

- **Habit**: Represents an individual habit tracked by a user.
  - *Attributes*: `id` (unique identifier), `title` (string), `description` (optional string), `skipPolicy` (`FREEZE` | `RESET`), `createdAt` (timestamp), `isArchived` (boolean).
- **HabitLog**: Represents the recorded completion or skip status for a specific habit on a single calendar day.
  - *Attributes*: `id` (unique identifier), `habitId` (reference to Habit), `date` (ISO calendar date string `YYYY-MM-DD`), `status` (`DONE` | `SKIPPED`), `loggedAt` (timestamp).
- **StreakSummary**: Derived metric object representing calculated statistics for a habit.
  - *Attributes*: `currentStreak` (non-negative integer), `longestStreak` (non-negative integer), `totalCompletions` (integer), `completionRate` (percentage).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and configure a new habit (including skip policy) in under 15 seconds.
- **SC-002**: Daily habit status updates (Done, Skipped, Pending) reflect in the UI and update streak metrics in under 100 milliseconds.
- **SC-003**: Streak calculation formulas produce 100% mathematically correct and reproducible results across all combinations of Done, Skipped, and Missed sequences.
- **SC-004**: Retrospective edits to past dates trigger immediate, consistent recalculation of streaks across all views without requiring manual page refreshes.
- **SC-005**: Users can review at least 30 days of historical habit progress in an intuitive, responsive view without visual clutter.

## Assumptions

- Habits follow a daily recurrence interval in the core feature.
- Calendar days transition at 00:00:00 (midnight) in the user's local timezone.
- An unmarked past day is treated as "Missed" during streak calculations.
- If today's status is "Pending" and yesterday was "Done" (or "Skipped" under freeze policy), the current streak remains active awaiting today's completion.
- Deleting a habit prompts for confirmation and permanently removes associated historical logs; archiving hides the habit from active tracking while preserving historical logs and metrics.
