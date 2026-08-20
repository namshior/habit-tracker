# Interface Contracts: Core Habit Tracker

**Feature**: Core Habit Tracker  
**Branch**: `001-core-habit-tracker`  
**Date**: 2026-08-19  

## Server Actions & API Contracts

All mutations and queries use type-safe TypeScript interfaces validated with Zod schemas.

---

### 1. Habit Mutations (`src/actions/habits.ts`)

#### `createHabitAction`
- **Input Payload**:
  ```typescript
  export interface CreateHabitInput {
    title: string; // 1-100 characters
    description?: string; // Optional, max 500 characters
    skipPolicy?: 'FREEZE' | 'RESET'; // Default: 'FREEZE'
  }
  ```
- **Validation Schema (Zod)**:
  ```typescript
  export const createHabitSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional(),
    skipPolicy: z.enum(['FREEZE', 'RESET']).default('FREEZE'),
  });
  ```
- **Response**:
  ```typescript
  export type ActionResult<T> = 
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string; details?: Record<string, string[]> } };
  ```

#### `updateHabitAction`
- **Input Payload**:
  ```typescript
  export interface UpdateHabitInput {
    id: string;
    title: string;
    description?: string;
    skipPolicy: 'FREEZE' | 'RESET';
  }
  ```
- **Validation Schema (Zod)**:
  ```typescript
  export const updateHabitSchema = z.object({
    id: z.string().min(1),
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional(),
    skipPolicy: z.enum(['FREEZE', 'RESET']),
  });
  ```

#### `archiveHabitAction` / `deleteHabitAction`
- **Input Schema**:
  ```typescript
  export const habitIdSchema = z.object({
    id: z.string().min(1),
  });
  ```

---

### 2. Daily Log Mutations (`src/actions/logs.ts`)

These operations preserve the clarified interaction model (primary checkbox for Done/Pending, dedicated action for Skipped).

#### `toggleHabitDoneAction` (Primary Checkbox Interaction)
- **Purpose**: Toggles between `DONE` and `PENDING` for a given habit and date. If current status is `DONE`, deletes the log (reverts to `PENDING`); otherwise, upserts status as `DONE`.
- **Validation Schema (Zod)**:
  ```typescript
  export const habitDateSchema = z.object({
    habitId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  });
  ```

#### `setHabitSkippedAction` (Dedicated Skip Action)
- **Purpose**: Explicitly marks a habit as `SKIPPED` for a given date via the dedicated skip button or row action menu.
- **Validation Schema (Zod)**: Uses `habitDateSchema`.

#### `clearHabitStatusAction` (Clear / Reset Action)
- **Purpose**: Removes any recorded log for a habit on a given date, resetting it to `PENDING`.
- **Validation Schema (Zod)**: Uses `habitDateSchema`.

#### `setHabitStatusAction` (Generic Status Setter)
- **Purpose**: Direct status assignment used in calendar matrices or bulk operations.
- **Input Payload**:
  ```typescript
  export interface SetHabitStatusInput {
    habitId: string;
    date: string; // YYYY-MM-DD
    status: 'DONE' | 'SKIPPED' | 'PENDING';
  }
  ```
- **Validation Schema (Zod)**:
  ```typescript
  export const setHabitStatusSchema = z.object({
    habitId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    status: z.enum(['DONE', 'SKIPPED', 'PENDING']),
  });
  ```

---

### 3. Business Queries & Composite Orchestration (`src/lib/services/habits.ts`)

The service layer is used strictly for composite retrieval and domain orchestration:

#### `getActiveHabitsWithSummaries(referenceDate: string)`
- **Returns**: `Promise<HabitWithSummary[]>`
- Retrieves all unarchived habits with their associated historical logs up to `referenceDate`, applies `src/lib/domain/streak.ts` calculation functions, and returns enriched `HabitWithSummary` view models.

#### `getHabitHistory(habitId: string, startDate: string, endDate: string)`
- **Returns**: `Promise<HabitLogEntry[]>`
- Retrieves all log records within the requested date range for calendar / matrix views.
