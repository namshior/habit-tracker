import { describe, it, expect } from 'vitest';
import { calculateStreak } from '@/lib/domain/streak';
import { HabitLogEntry } from '@/lib/domain/types';

describe('calculateStreak Domain Engine (TDD)', () => {
  it('returns zero streaks when there are no logs', () => {
    const summary = calculateStreak([], 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(0);
    expect(summary.longestStreak).toBe(0);
    expect(summary.totalCompletions).toBe(0);
    expect(summary.totalSkips).toBe(0);
    expect(summary.completionRate).toBe(0);
    expect(summary.isTodayCompleted).toBe(false);
    expect(summary.isTodaySkipped).toBe(false);
  });

  it('calculates current streak for consecutive completed days ending today', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-17', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-18', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
    ];
    const summary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(3);
    expect(summary.longestStreak).toBe(3);
    expect(summary.totalCompletions).toBe(3);
    expect(summary.isTodayCompleted).toBe(true);
    expect(summary.isTodaySkipped).toBe(false);
  });

  it('preserves active streak when today is still pending and yesterday was completed', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-17', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-18', status: 'DONE' },
    ];
    const summary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(2);
    expect(summary.longestStreak).toBe(2);
    expect(summary.isTodayCompleted).toBe(false);
  });

  it('FREEZE policy: preserves streak across single skipped day without incrementing', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-16', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-17', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-18', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
    ];
    const summary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(3); // 2 + 0 + 1 = 3
    expect(summary.longestStreak).toBe(3);
    expect(summary.totalCompletions).toBe(3);
    expect(summary.totalSkips).toBe(1);
  });

  it('FREEZE policy: preserves streak across multiple consecutive skipped days', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-14', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-15', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-16', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-17', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-18', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
    ];
    const summary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(3);
    expect(summary.longestStreak).toBe(3);
  });

  it('FREEZE policy: leading skipped days before any completion do not break or produce negative streaks', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-17', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-18', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
    ];
    const summary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(1);
    expect(summary.longestStreak).toBe(1);
  });

  it('RESET policy: a skipped day resets the active streak', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-16', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-17', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-18', status: 'SKIPPED' },
      { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
    ];
    const summary = calculateStreak(logs, 'RESET', '2026-08-19');
    expect(summary.currentStreak).toBe(1); // Reset on 18th, restarted on 19th
    expect(summary.longestStreak).toBe(2); // Preserves previous high of 2
  });

  it('Missed past days break streak under both FREEZE and RESET policies', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-15', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-16', status: 'DONE' },
      // 2026-08-17 is MISSED (no log)
      // 2026-08-18 is MISSED (no log)
      { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
    ];
    const summaryFreeze = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summaryFreeze.currentStreak).toBe(1);
    expect(summaryFreeze.longestStreak).toBe(2);

    const summaryReset = calculateStreak(logs, 'RESET', '2026-08-19');
    expect(summaryReset.currentStreak).toBe(1);
    expect(summaryReset.longestStreak).toBe(2);
  });

  it('preserves historical longest streak even after current streak resets to 0', () => {
    const logs: HabitLogEntry[] = [
      { habitId: 'h1', date: '2026-08-10', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-11', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-12', status: 'DONE' },
      { habitId: 'h1', date: '2026-08-13', status: 'DONE' },
      // 2026-08-14 to 2026-08-18 missed
      // 2026-08-19 is pending
    ];
    const summary = calculateStreak(logs, 'FREEZE', '2026-08-19');
    expect(summary.currentStreak).toBe(0);
    expect(summary.longestStreak).toBe(4);
  });
});
