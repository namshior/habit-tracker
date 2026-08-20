# Technical Research: Core Habit Tracker

**Feature**: Core Habit Tracker  
**Branch**: `001-core-habit-tracker`  
**Date**: 2026-08-19  

## Research Topics & Decisions

### 1. Pure Domain Streak Calculation Engine

- **Decision**: Implement a standalone, pure domain module (`src/lib/domain/streak.ts`) containing framework-agnostic calculation functions:
  ```typescript
  export function calculateStreak(
    logs: Array<{ date: string; status: 'DONE' | 'SKIPPED' }>,
    skipPolicy: 'FREEZE' | 'RESET',
    referenceDate: string // YYYY-MM-DD (typically today)
  ): StreakSummary
  ```
- **Rationale**:
  - Aligns with **Constitution Principle II (Clean Architecture)**: Domain mathematics in `src/lib/domain/streak.ts` are 100% decoupled from Next.js, React, and Prisma.
  - Enables comprehensive Test-Driven Development (TDD) via unit tests across edge cases (e.g., unlimited consecutive skips, leading skips, yesterday completed while today pending, leap days) with zero database overhead.
  - Mathematical definition:
    - Days are evaluated in chronological sequence up to `referenceDate`.
    - If `referenceDate` (today) is `Pending`: Current streak evaluates consecutive streak ending at `referenceDate - 1 day`.
    - `DONE`: Increments current streak count by 1. Updates longest streak if `currentStreak > longestStreak`.
    - `SKIPPED` under `FREEZE`: Maintains current streak unchanged (freezes count, does not increment, does not reset).
    - `SKIPPED` under `RESET`: Breaks streak; resets current streak to 0.
    - `MISSED` (unlogged past day): Breaks streak; resets current streak to 0.
- **Alternatives Considered**:
  - *Database Aggregations / SQL Window Functions*: Rejected because SQL window functions vary across SQLite and PostgreSQL, violate framework independence, and complicate unit testing.
  - *Component-Level Calculation*: Rejected because business logic in UI components violates Constitution Principle II.

---

### 2. Date & Timezone Integrity Model

- **Decision**: Represent all calendar dates as ISO 8601 calendar strings (`YYYY-MM-DD`) for day uniqueness and query boundaries. Store log event timestamps as UTC ISO DateTime (`loggedAt`).
- **Rationale**:
  - Aligns with **Constitution Principle III (Data Integrity & Resilient State Management)**.
  - Prevents day-shift bugs caused by timezone offsets or Daylight Saving Time (DST) transitions when performing daily grouping.
  - The client provides its local `YYYY-MM-DD` date string for daily status logs, ensuring actions correspond to the user's perception of "today".
- **Alternatives Considered**:
  - *Unix Epoch Milliseconds for Day Keys*: Rejected due to timezone conversion complexity and potential off-by-one day grouping errors.
  - *Storing Local Timezone Offsets with Every Log*: Rejected as unnecessarily complex for single-user local habit tracking.

---

### 3. Data Persistence & Idempotent Schema (Prisma + SQLite)

- **Decision**: Use Prisma ORM with SQLite for local development and PostgreSQL-ready schema definitions. Enforce a composite unique constraint `@@unique([habitId, date])` on the `HabitLog` model.
- **Rationale**:
  - Enforces database-level idempotency (Constitution Principle III).
  - Enables safe upsert operations: marking a habit as `Done` or `Skipped` multiple times for the same day updates the existing record rather than creating duplicates.
  - Clearing a log translates to a clean deletion or status reset.
- **Alternatives Considered**:
  - *Append-only Event Log*: Rejected for core MVP due to added read-time aggregation overhead; simple state-per-day model is faster, simpler, and less error-prone.
  - *Raw SQL*: Rejected because Prisma provides complete TypeScript type generation, fulfilling Constitution Principle IV.

---

### 4. Boundary Validation & Type Safety (Zod + TypeScript)

- **Decision**: Define Zod schemas for all mutations and server action inputs (`createHabitSchema`, `updateHabitSchema`, `toggleDoneSchema`, `setSkippedSchema`, `setHabitStatusSchema`, `habitIdSchema`).
- **Rationale**:
  - Satisfies **Constitution Principle IV (Strict Type Safety & Static Analysis)**.
  - Validates exact action parameters for the clarified interaction model: primary checkbox (`toggleHabitDoneAction`), dedicated skip action (`setHabitSkippedAction`), and explicit reset (`clearHabitStatusAction`).
  - Automatically parses and validates string lengths, enum values (`FREEZE` | `RESET`, `DONE` | `SKIPPED`), and date format regex (`^\d{4}-\d{2}-\d{2}$`) at the system boundary before reaching domain logic.
- **Alternatives Considered**:
  - *Manual conditional checks in action handlers*: Rejected because it leads to scattered validation logic and lacks automatic TypeScript inference.

---

### 5. UI Architecture, Optimistic Responsiveness, & Lean Service Scope

- **Decision**: 
  - Use Next.js App Router Server Actions paired with React optimistic state updates (`useOptimistic`) for instant sub-100ms perceived UI responsiveness upon checking off or skipping habits.
  - Restrict `src/lib/services/habits.ts` strictly to composite retrieval and domain hydration (fetching active habits with historical logs and computing `StreakSummary`), allowing simple CRUD mutations to execute directly in Server Actions via Prisma.
- **Rationale**:
  - Satisfies Success Criteria **SC-002** by delivering perceived sub-100ms feedback in the UI, decoupling instant client state transitions from asynchronous server persistence.
  - Avoids boilerplate passthrough wrappers while keeping domain streak orchestration cleanly centralized.
- **Alternatives Considered**:
  - *Full Client-Side SPA without Server Persistence*: Rejected because data must be durably stored via Prisma.
  - *Heavy Multi-Layer Service Architecture*: Rejected as unnecessary over-engineering for straightforward single-entity mutations.
