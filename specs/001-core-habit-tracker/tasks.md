# Tasks: Core Habit Tracker

**Input**: Design documents from `specs/001-core-habit-tracker/`  
**Prerequisites**: [plan.md](file:///c:/Users/ADMIN/Projects/habit-tracker/specs/001-core-habit-tracker/plan.md), [spec.md](file:///c:/Users/ADMIN/Projects/habit-tracker/specs/001-core-habit-tracker/spec.md), [research.md](file:///c:/Users/ADMIN/Projects/habit-tracker/specs/001-core-habit-tracker/research.md), [data-model.md](file:///c:/Users/ADMIN/Projects/habit-tracker/specs/001-core-habit-tracker/data-model.md), [contracts/habits-contracts.md](file:///c:/Users/ADMIN/Projects/habit-tracker/specs/001-core-habit-tracker/contracts/habits-contracts.md)  
**Tests**: Following TDD discipline per Constitution Principle I (tests authored first and confirmed failing before implementation).  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`US1`, `US2`, `US3`, `US4`)
- Exact file paths are specified in every task description.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, toolchain, and styling foundation

- [ ] T001 Initialize Next.js project with TypeScript strict mode, Tailwind CSS, Lucide React, and Vitest in package.json and tsconfig.json
- [ ] T002 [P] Configure Tailwind CSS design tokens, typography, and dark mode theme variables in src/app/globals.css and tailwind.config.ts
- [ ] T003 [P] Setup Vitest testing framework and test runner configuration in vitest.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data layer, domain types, boundary schemas, and UI primitives required before user stories

⚠️ **CRITICAL**: Foundational tasks must be completed before user story implementation begins.

- [ ] T004 Define Prisma schema with Habit, HabitLog, SkipPolicy, and LogStatus enums plus composite unique index in prisma/schema.prisma
- [ ] T005 Initialize Prisma client singleton and database connection helper in src/lib/db/prisma.ts
- [ ] T006 [P] Create shared TypeScript domain types and ActionResult response envelope in src/lib/domain/types.ts
- [ ] T007 [P] Define Zod validation schemas for habit and log mutations in src/lib/schemas/habits.ts
- [ ] T008 [P] Create accessible design system UI primitives (Button, Dialog, Badge, Input) in src/components/ui/Button.tsx and src/components/ui/Dialog.tsx
- [ ] T009 Create root application layout and dashboard shell container in src/app/layout.tsx and src/components/layout/DashboardShell.tsx

**Checkpoint**: Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 - Habit Creation and Configuration (Priority: P1) 🎯 MVP

**Goal**: Users can create, view, update, archive, and delete habits with title, description, and explicit skip policy ("Streak Freeze" vs "Streak Reset").

**Independent Test**: Create a habit via form dialog, see it listed in the active habits dashboard, edit its configuration, archive it (hides from list), and permanently delete a habit after confirmation.

### Tests for User Story 1 (TDD) ⚠️
> *Write these tests FIRST and confirm they FAIL before writing implementation code.*

- [ ] T010 [P] [US1] Write failing Server Action contract tests for createHabitAction, updateHabitAction, archiveHabitAction, and deleteHabitAction in src/tests/actions/habits.test.ts

### Implementation for User Story 1

- [ ] T011 [US1] Implement habit management Server Actions (createHabitAction, updateHabitAction, archiveHabitAction, deleteHabitAction) with Zod boundary validation in src/actions/habits.ts
- [ ] T012 [P] [US1] Build HabitFormDialog component for creating and editing habits with title, description, and skip policy picker in src/components/habits/HabitFormDialog.tsx
- [ ] T013 [P] [US1] Build HabitCard component displaying habit details, skip policy tag, and action menu in src/components/habits/HabitCard.tsx
- [ ] T014 [US1] Build HabitList component and integrate habit creation dialog into src/components/habits/HabitList.tsx and src/app/page.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable as an MVP.

---

## Phase 4: User Story 2 - Daily Status Logging (Done, Skipped, Pending) (Priority: P1)

**Goal**: Users can check off daily habits as "Done" with 1-click, mark them as "Skipped" via dedicated skip action, or reset to "Pending" with perceived sub-100ms optimistic UI updates.

**Independent Test**: Click primary checkbox to toggle Done/Pending; select Skip from dedicated action to mark Skipped; verify immediate optimistic visual update and database persistence.

### Tests for User Story 2 (TDD) ⚠️
> *Write these tests FIRST and confirm they FAIL before writing implementation code.*

- [ ] T015 [P] [US2] Write failing contract tests for toggleHabitDoneAction, setHabitSkippedAction, clearHabitStatusAction, and setHabitStatusAction in src/tests/actions/logs.test.ts

### Implementation for User Story 2

- [ ] T016 [US2] Implement daily status Server Actions (toggleHabitDoneAction, setHabitSkippedAction, clearHabitStatusAction, setHabitStatusAction) in src/actions/logs.ts
- [ ] T017 [P] [US2] Build DailyCheckoff component with 1-click primary checkbox, dedicated skip action button/menu, and useOptimistic instant state toggle in src/components/habits/DailyCheckoff.tsx
- [ ] T018 [US2] Integrate DailyCheckoff into HabitCard with optimistic state update and server error rollback handling in src/components/habits/HabitCard.tsx

**Checkpoint**: User Stories 1 and 2 work seamlessly together with 1-click checkoff and dedicated skip logging.

---

## Phase 5: User Story 3 - Streak Computation & Explicit Skipped-Day Rules (Priority: P1)

**Goal**: Calculate and display current streak and longest streak in real-time according to explicit skip policies (Streak Freeze preserving streak across unlimited skips vs Streak Reset resetting count).

**Independent Test**: Run unit tests across multi-day sequences of Done, Skipped, and Missed days for Freeze and Reset policies; verify live streak badges and statistics on habit cards.

### Tests for User Story 3 (TDD) ⚠️
> *Write these tests FIRST and confirm they FAIL before writing implementation code.*

- [ ] T019 [P] [US3] Write comprehensive failing unit tests for pure streak mathematics (Freeze policy, Reset policy, consecutive skips, leading skips, pending today, longest streak preservation) in src/tests/domain/streak.test.ts

### Implementation for User Story 3

- [ ] T020 [US3] Implement pure, framework-agnostic calculateStreak function in src/lib/domain/streak.ts
- [ ] T021 [US3] Implement composite query service getActiveHabitsWithSummaries in src/lib/services/habits.ts combining Prisma queries with streak calculations
- [ ] T022 [P] [US3] Build StreakBadge component displaying current streak with flame icon, longest streak milestone, and skip policy badge in src/components/habits/StreakBadge.tsx
- [ ] T023 [US3] Connect StreakBadge to HabitCard and summary metrics in src/components/habits/HabitCard.tsx and src/components/layout/Header.tsx

**Checkpoint**: Core habit loop complete with 100% mathematically accurate streak computation and explicit skip policies.

---

## Phase 6: User Story 4 - Historical Day-by-Day Tracking & Retrospective Edits (Priority: P2)

**Goal**: Users can navigate past dates in a weekly/calendar grid, review past completion badges, and retroactively mark or correct past days with automatic streak recalculation.

**Independent Test**: Navigate to 3 days ago in the weekly matrix, mark as Done, and observe that historical logs and current/longest streaks recalculate automatically.

### Tests for User Story 4 (TDD) ⚠️
> *Write these tests FIRST and confirm they FAIL before writing implementation code.*

- [ ] T024 [P] [US4] Write integration test verifying retroactive log edits and streak recalculation over multi-day history in src/tests/integration/habit-flow.test.ts

### Implementation for User Story 4

- [ ] T025 [US4] Implement getHabitHistory date range query service in src/lib/services/habits.ts
- [ ] T026 [P] [US4] Build HabitWeeklyMatrix component rendering a 7-day interactive history strip per habit with date picker navigation in src/components/habits/HabitWeeklyMatrix.tsx
- [ ] T027 [US4] Integrate HabitWeeklyMatrix into main dashboard view with retroactive status toggle support and future date prevention in src/app/page.tsx

**Checkpoint**: All user stories functional with full historical review and retrospective editing capabilities.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, quickstart validation, and quality gates verification

- [ ] T028 [P] Add structured error logging and user-facing notifications in src/components/ui/Toast.tsx and Server Actions
- [ ] T029 Run end-to-end validation scenarios against specs/001-core-habit-tracker/quickstart.md
- [ ] T030 Execute full Vitest test suite asserting >=80% coverage across domain and actions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories.
- **User Stories (Phases 3–6)**:
  - **US1 (Phase 3)**: Depends on Foundational (Phase 2).
  - **US2 (Phase 4)**: Depends on US1 (Phase 3).
  - **US3 (Phase 5)**: Depends on US2 (Phase 4).
  - **US4 (Phase 6)**: Depends on US3 (Phase 5).
- **Polish (Phase 7)**: Depends on all user stories being complete.

### Parallel Opportunities

- **Phase 1 (Setup)**: `T002` (Tailwind) and `T003` (Vitest) can run in parallel after `T001`.
- **Phase 2 (Foundational)**: `T006` (Types), `T007` (Schemas), and `T008` (UI components) can run in parallel after `T004` & `T005`.
- **Phase 3 (US1)**: `T010` (Contract tests), `T012` (Form Dialog), and `T013` (Habit Card) can run in parallel before `T014`.
- **Phase 4 (US2)**: `T015` (Log tests) and `T017` (Daily Checkoff UI) can run in parallel before `T018`.
- **Phase 5 (US3)**: `T019` (Streak unit tests) and `T022` (StreakBadge UI) can run in parallel.
- **Phase 6 (US4)**: `T024` (Integration test) and `T026` (Weekly Matrix UI) can run in parallel.

---

## Implementation Strategy

### MVP First (Phases 1 → 2 → 3: User Story 1)
1. Complete Setup & Foundational phases.
2. Implement User Story 1 (Habit Creation & Configuration).
3. Validate independently: Habit creation, update, archive, and delete.

### Incremental Delivery (Phases 4 → 5 → 6)
1. Layer in User Story 2: Daily Check-off (Done, Skipped, Pending).
2. Layer in User Story 3: Streak Engine (`src/lib/domain/streak.ts`) with Freeze and Reset mathematical policies.
3. Layer in User Story 4: Historical Weekly Matrix & Retrospective edits.
4. Run Polish & Test Coverage Verification (Phase 7).
