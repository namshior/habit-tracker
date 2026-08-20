# Data Model: Core Habit Tracker

**Feature**: Core Habit Tracker  
**Branch**: `001-core-habit-tracker`  
**Date**: 2026-08-19  

## Database Schema (Prisma ORM)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SkipPolicy {
  FREEZE // Preserves streak without incrementing or resetting
  RESET  // Breaks streak and resets count to 0
}

enum LogStatus {
  DONE    // Completed habit for the date
  SKIPPED // Explicitly skipped habit for the date
}

model Habit {
  id          String     @id @default(cuid())
  title       String
  description String?
  skipPolicy  SkipPolicy @default(FREEZE)
  isArchived  Boolean    @default(false)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  logs        HabitLog[]

  @@index([isArchived])
}

model HabitLog {
  id        String    @id @default(cuid())
  habitId   String
  date      String    // ISO calendar date format: YYYY-MM-DD
  status    LogStatus
  loggedAt  DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  habit     Habit     @relation(fields: [habitId], references: [id], onDelete: Cascade)

  @@unique([habitId, date])
  @@index([habitId, date])
  @@index([date])
}
```

---

## Domain & In-Memory Entities

### 1. Habit With Logs & Metrics (`HabitWithSummary`)

```typescript
export interface HabitEntity {
  id: string;
  title: string;
  description?: string | null;
  skipPolicy: 'FREEZE' | 'RESET';
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitLogEntry {
  id?: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: 'DONE' | 'SKIPPED';
  loggedAt?: Date;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  totalSkips: number;
  completionRate: number; // Percentage 0 - 100
  isTodayCompleted: boolean;
  isTodaySkipped: boolean;
}

export interface HabitWithSummary extends HabitEntity {
  logs: HabitLogEntry[];
  summary: StreakSummary;
}
```

---

## State Transition & Validation Rules

### Daily Habit Status Transitions

| Initial State | User Action | Next State | Database Operation |
|:--------------|:------------|:-----------|:-------------------|
| `Pending` (No record) | Click Checkbox (Done) | `Done` | `upsert({ status: 'DONE' })` |
| `Pending` (No record) | Select Skip Action | `Skipped` | `upsert({ status: 'SKIPPED' })` |
| `Done` | Click Checkbox (Uncheck) | `Pending` | `delete({ habitId, date })` |
| `Done` | Select Skip Action | `Skipped` | `upsert({ status: 'SKIPPED' })` |
| `Skipped` | Click Checkbox (Done) | `Done` | `upsert({ status: 'DONE' })` |
| `Skipped` | Select Clear Action | `Pending` | `delete({ habitId, date })` |

### Validation Rules (Zod)

1. **Habit Creation**:
   - `title`: 1 to 100 characters, trimmed, non-empty.
   - `description`: Optional, max 500 characters.
   - `skipPolicy`: Must be `'FREEZE'` or `'RESET'`, defaults to `'FREEZE'`.
2. **Habit Update**:
   - `id`: Valid CUID/string.
   - `title`: 1 to 100 characters.
   - `description`: Optional, max 500 characters.
   - `skipPolicy`: `'FREEZE'` or `'RESET'`.
3. **Status Logging**:
   - `habitId`: Valid CUID/string.
   - `date`: Valid ISO format `YYYY-MM-DD` and MUST NOT be greater than user's local date.
   - `status`: `'DONE'` | `'SKIPPED'` | `'PENDING'` (clear).
