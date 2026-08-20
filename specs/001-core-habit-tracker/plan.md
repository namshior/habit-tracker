# Implementation Plan: Core Habit Tracker

**Branch**: `001-core-habit-tracker` | **Date**: 2026-08-19 | **Spec**: [spec.md](file:///c:/Users/ADMIN/Projects/habit-tracker/specs/001-core-habit-tracker/spec.md)

**Input**: Feature specification from `specs/001-core-habit-tracker/spec.md`

## Summary

Build the core Habit Tracker web application enabling users to create and manage daily habits, mark status as `Done`, `Skipped`, or `Pending` for any calendar date, view real-time current and longest streaks, and explicitly define the behavior of skipped days (`Streak Freeze` vs `Streak Reset`). The architecture adheres strictly to clean domain separation, test-driven development (TDD), resilient idempotent data storage (Prisma + SQLite), strict Zod schema boundary validation, explicit status operations matching the primary checkbox (`Done`/`Pending`) and dedicated skip action model, and perceived sub-100ms UI responsiveness via optimistic client updates.

## Technical Context

**Language/Version**: TypeScript 5.x (Strict Mode enabled, zero implicit `any`)  
**Primary Dependencies**: Next.js 15+ (App Router), React 19, Tailwind CSS, Lucide React, Zod 3.x, Prisma ORM 6.x  
**Storage**: SQLite (Local-first / Development) via Prisma ORM, designed for zero-friction PostgreSQL production parity  
**Testing**: Vitest for unit & domain tests, React Testing Library for component tests, Playwright for end-to-end user journeys  
**Target Platform**: Modern Web Browsers (Desktop & Mobile Responsive)  
**Project Type**: Full-Stack Web Application (Next.js App Router with Server Actions & Clean Domain Core)  
**Performance Goals**: Sub-100ms perceived UI responsiveness for status check-off and skip interactions via React optimistic updates (`useOptimistic`), decoupling instantaneous user feedback from asynchronous server persistence; fast in-memory streak calculation latency  
**Constraints**: Pure, framework-agnostic domain logic in `src/lib/domain/streak.ts`; deterministic ISO `YYYY-MM-DD` date indexing; 100% idempotent mutations via `@@unique([habitId, date])`  
**Scale/Scope**: Single-user local habit management supporting 50+ concurrent active habits, thousands of historical logs, and real-time multi-month matrix queries  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Compliance Strategy | Status |
|:----------|:------------|:--------------------|:-------|
| **I. Test-First Development (TDD)** | Unit, integration, & contract tests authored and failing before implementation; >=80% coverage. | Author `src/tests/domain/streak.test.ts` and `src/tests/actions/habits.test.ts` first, asserting streak formulas and action schemas. | **PASS** |
| **II. Clean Architecture** | Pure domain layer isolated from UI and Database. | `src/lib/domain/streak.ts` contains pure calculation functions independent of Prisma, Next.js, and React. | **PASS** |
| **III. Data Integrity & Resilient State** | Deterministic timestamps, timezone-aware calendar dates, idempotent mutations, migration management. | Calendar dates stored as ISO `YYYY-MM-DD`; composite unique constraint `@@unique([habitId, date])` ensures mutation idempotency. | **PASS** |
| **IV. Strict Type Safety** | Strict TypeScript, zero compiler warnings, boundary schema validation with Zod. | Zod schemas validate all Server Action inputs and UI forms; shared TypeScript interfaces across domain and UI. | **PASS** |
| **V. Structured Observability & Errors** | Structured JSON logs, predictable `ActionResult<T>` error schemas without leaking internals. | Standardized `ActionResult<T>` envelope for all actions; structured error codes (`NOT_FOUND`, `VALIDATION_ERROR`). | **PASS** |

## Project Structure

### Documentation (this feature)

```text
specs/001-core-habit-tracker/
├── spec.md              # Feature specification
├── plan.md              # Master technical implementation plan
├── research.md          # Phase 0: Technical decisions & rationale
├── data-model.md        # Phase 1: Database & domain entities
├── quickstart.md        # Phase 1: Verification & testing guide
├── contracts/           # Phase 1: Server action schemas & API contracts
│   └── habits-contracts.md
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository layout)

```text
src/
├── app/
│   ├── layout.tsx              # Root HTML & design shell
│   ├── page.tsx                # Main Habit Dashboard view
│   └── globals.css             # Tailwind CSS & design tokens
├── actions/
│   ├── habits.ts               # Server Actions: createHabitAction, updateHabitAction, archiveHabitAction, deleteHabitAction
│   └── logs.ts                 # Server Actions: toggleHabitDoneAction (primary checkbox), setHabitSkippedAction (dedicated skip action), clearHabitStatusAction, setHabitStatusAction
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Accessible design system button
│   │   ├── Dialog.tsx          # Modal dialog component
│   │   └── Badge.tsx           # Status badge
│   ├── habits/
│   │   ├── HabitCard.tsx       # Individual habit display card
│   │   ├── HabitList.tsx       # List of active habits
│   │   ├── HabitFormDialog.tsx # Create/Edit habit modal with skip policy
│   │   ├── DailyCheckoff.tsx   # 1-click primary checkoff & dedicated skip action
│   │   ├── StreakBadge.tsx     # Current & longest streak badge
│   │   └── HabitWeeklyMatrix.tsx # 7-day / 30-day historical grid
│   └── layout/
│       ├── Header.tsx          # Header with date picker & summary stats
│       └── DashboardShell.tsx  # Main responsive container
├── lib/
│   ├── db/
│   │   └── prisma.ts           # Prisma client singleton
│   ├── domain/
│   │   ├── streak.ts           # Pure streak calculation engine (Pure TypeScript)
│   │   └── types.ts            # Shared domain types & interfaces
│   ├── schemas/
│   │   └── habits.ts           # Zod validation schemas
│   └── services/
│       └── habits.ts           # Composite queries: hydrates habits with historical logs and executes domain streak calculation
└── tests/
    ├── domain/
    │   └── streak.test.ts      # Pure domain streak calculation unit tests
    ├── actions/
    │   ├── habits.test.ts      # Server action contract tests
    │   └── logs.test.ts        # Daily logging action tests
    └── integration/
        └── habit-flow.test.ts  # End-to-end story integration tests

prisma/
└── schema.prisma               # Prisma schema definition
```

**Structure Decision**: Selected Next.js App Router full-stack layout with a dedicated pure domain directory (`src/lib/domain/streak.ts`) to enforce strict separation of concerns, colocated server actions (`src/actions/`), and lean service orchestration (`src/lib/services/habits.ts`) strictly for composite multi-entity hydration and domain streak evaluation without redundant CRUD pass-through layers.

## Complexity Tracking

> **No Constitution Violations**: The proposed architecture fully adheres to all constitutional principles without exceptions or unnecessary abstractions.

| Item | Assessment | Rationale |
|:-----|:-----------|:----------|
| Pure Domain Logic | Full Compliance | Isolated in `src/lib/domain/streak.ts` for 100% testability. |
| Lean Service Orchestration | Full Compliance | `src/lib/services/habits.ts` is scoped strictly to composite retrieval and domain hydration, avoiding boilerplate pass-through for direct mutations. |
| Boundary Validation | Full Compliance | Enforced via Zod schemas on all Server Actions. |
| Data Layer | Full Compliance | Prisma ORM with SQLite ensures rapid local development and seamless production deployment. |
