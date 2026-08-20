import { describe, it, expect } from 'vitest';
import { calculateStreak } from '@/lib/domain/streak';
import { HabitLogEntry } from '@/lib/domain/types';

describe('Habit Lifecycle & Multi-Day Streak Integration Flow (TDD)', () => {
  it('Scenario 1: Freeze Policy preserves streak across skips and resumes upon next completion', () => {
    // 5-day history: Done, Done, Skipped, Skipped, Done
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-15', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-16', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-17', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-18', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
    ];

    const summary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(3);
    expect(summary.longestStreak).toBe(3);
    expect(summary.totalCompletions).toBe(3);
    expect(summary.totalSkips).toBe(2);
  });

  it('Scenario 2: Reset Policy breaks streak on skipped days', () => {
    // 5-day history: Done, Done, Skipped, Done, Done
    const logs: HabitLogEntry[] = [
      { habitId: 'h2', date: '2026-08-15', status: 'DONE' },
      { habitId: 'h2', date: '2026-08-16', status: 'DONE' },
      { habitId: 'h2', date: '2026-08-17', status: 'SKIPPED' },
      { habitId: 'h2', date: '2026-08-18', status: 'DONE' },
      { habitId: 'h2', date: '2026-08-19', status: 'DONE' },
    ];

    const summary = calculateStreak(logs, 'RESET', '2026-08-19');
    expect(summary.currentStreak).toBe(2); // Restarted after skip on 17th
    expect(summary.longestStreak).toBe(2);
  });

  it('Scenario 3: Retroactive editing repairs broken streak dynamically', () => {
    // Initial logs: Done, Done, Missed (gap on 17th), Done
    const initialLogs: HabitLogEntry[] = [
      { habitId: 'h3', date: '2026-08-15', status: 'DONE' },
      { habitId: 'h3', date: '2026-08-16', status: 'DONE' },
      // 2026-08-17 was unlogged / missed
      { habitId: 'h3', date: '2026-08-18', status: 'DONE' },
      { habitId: 'h3', date: '2026-08-19', status: 'DONE' },
    ];

    const brokenSummary = calculateStreak(initialLogs, 'FREEZE', '2026-08-19');
    expect(brokenSummary.currentStreak).toBe(2); // 18th and 19th only

    // User retroactively marks 2026-08-17 as DONE
    const repairedLogs: HabitLogEntry[] = [
      ...initialLogs,
      { habitId: 'h3', date: '2026-08-17', status: 'DONE' },
    ];

    const repairedSummary = calculateStreak(repairedLogs, 'FREEZE', '2026-08-19');
    expect(repairedSummary.currentStreak).toBe(5); // 15, 16, 17, 18, 19
    expect(repairedSummary.longestStreak).toBe(5);
  });

  it('Scenario 4: Retroactive modification of skip policy recalculates historical streaks accurately', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h4', date: '2026-08-15', status: 'DONE' },
      { habitId: 'h4', date: '2026-08-16', status: 'DONE' },
      { habitId: 'h4', date: '2026-08-17', status: 'SKIPPED' },
      { habitId: 'h4', date: '2026-08-18', status: 'DONE' },
      { habitId: 'h4', date: '2026-08-19', status: 'DONE' },
    ];

    // Under RESET policy
    const resetSummary = calculateStreak(logs, 'RESET', '2026-08-19');
    expect(resetSummary.currentStreak).toBe(2);

    // User switches policy to FREEZE
    const freezeSummary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(freezeSummary.currentStreak).toBe(4);
  });
});
