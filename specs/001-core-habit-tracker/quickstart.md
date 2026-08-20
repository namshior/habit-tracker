# Quickstart & Validation Guide: Core Habit Tracker

**Feature**: Core Habit Tracker  
**Branch**: `001-core-habit-tracker`  
**Date**: 2026-08-19  

## Overview

This guide provides the setup and validation workflow to verify that the Core Habit Tracker functions properly end-to-end, including habit creation, streak calculations, skip behaviors, and historical tracking.

---

## 1. Prerequisites & Environment Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Database Initialization & Prisma Migration**:
   ```bash
   npx prisma migrate dev --name init_habit_tracker
   ```
3. **Run Unit & Integration Tests (TDD Verification)**:
   ```bash
   npm run test
   ```

---

## 2. Automated Test Verification

Verify core mathematical and domain test suites:

- **Streak Engine Unit Tests**:
  - `npm run test -- src/tests/domain/streak.test.ts`
  - Validates `FREEZE` and `RESET` policies, consecutive multi-skips, leading skips, and pending today scenarios.
- **Server Action Contract Tests**:
  - `npm run test -- src/tests/actions/habits.test.ts src/tests/actions/logs.test.ts`
  - Validates boundary parsing, Zod schemas, explicit log operations (`toggleHabitDoneAction`, `setHabitSkippedAction`), and database idempotency.

---

## 3. End-to-End Manual Validation Scenarios

### Scenario A: Habit Creation & Policy Configuration (P1)
1. Start local development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser.
3. Click **"New Habit"**.
4. Enter Title: `"Daily Exercise"`, select Skip Policy: `"Streak Freeze"`, and submit.
5. **Expected Result**: Habit card appears immediately with a `0 day` current streak.

### Scenario B: Daily Check-Off & Streak Calculation (P1)
1. On the `"Daily Exercise"` card, click the primary check-off button for today.
2. **Expected Result**: Button turns completed with instant perceived responsiveness (<100ms optimistic UI update), and current streak increments to `1 day`.

### Scenario C: Streak Freeze vs Streak Reset Policy Verification (P1)
1. Create a second habit: `"Cold Shower"`, select Skip Policy: `"Streak Reset"`.
2. Complete `"Daily Exercise"` and `"Cold Shower"` for 2 consecutive days in the past via calendar log.
3. Use the dedicated skip action to mark day 3 as **"Skipped"** for both habits.
4. Mark day 4 as **"Done"** for both habits.
5. **Expected Results**:
   - `"Daily Exercise"` (Freeze): Current streak displays `3 days` (skip preserved streak).
   - `"Cold Shower"` (Reset): Current streak displays `1 day` (skip reset streak on day 3).

### Scenario D: Retrospective Editing & History Matrix (P2)
1. Navigate back 2 days in the weekly/calendar matrix.
2. Toggle a previously completed day or mark an unlogged day as Done.
3. **Expected Result**: Current streak and longest streak metrics update immediately across the entire dashboard.
