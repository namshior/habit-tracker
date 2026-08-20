import { HabitLogEntry, SkipPolicy, StreakSummary } from './types';

/**
 * Format a Date object to YYYY-MM-DD in UTC/isolated calendar format
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper to parse YYYY-MM-DD string to Date (local midnight)
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Helper to get previous date string (dateStr - 1 day)
 */
export function getPreviousDate(dateStr: string): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/**
 * Pure domain function to calculate streaks and statistics for a habit.
 * Fully isolated from database, UI, and framework dependencies.
 *
 * @param logs List of log entries for the habit
 * @param skipPolicy 'FREEZE' (freezes streak across skips) or 'RESET' (breaks streak on skip)
 * @param referenceDate ISO calendar date string (YYYY-MM-DD) representing today/query baseline
 */
export function calculateStreak(
  logs: HabitLogEntry[],
  skipPolicy: SkipPolicy,
  referenceDate: string
): StreakSummary {
  if (!logs || logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      totalSkips: 0,
      completionRate: 0,
      isTodayCompleted: false,
      isTodaySkipped: false,
    };
  }

  // Filter logs up to referenceDate to ignore any accidental future entries
  const validLogs = logs.filter((log) => log.date <= referenceDate);

  // Map of date -> status for instant lookup
  const logMap = new Map<string, 'DONE' | 'SKIPPED'>();
  let totalCompletions = 0;
  let totalSkips = 0;

  for (const log of validLogs) {
    logMap.set(log.date, log.status);
    if (log.status === 'DONE') {
      totalCompletions++;
    } else if (log.status === 'SKIPPED') {
      totalSkips++;
    }
  }

  const todayStatus = logMap.get(referenceDate);
  const isTodayCompleted = todayStatus === 'DONE';
  const isTodaySkipped = todayStatus === 'SKIPPED';

  // Find the earliest date in logs
  const sortedDates = Array.from(logMap.keys()).sort();
  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      totalSkips: 0,
      completionRate: 0,
      isTodayCompleted: false,
      isTodaySkipped: false,
    };
  }

  const startDateStr = sortedDates[0];
  const startDate = parseDate(startDateStr);
  const refDate = parseDate(referenceDate);

  let currentRunningStreak = 0;
  let longestStreak = 0;
  let streakAsOfYesterday = 0;

  const currentDate = new Date(startDate.getTime());

  // Iterate day by day from startDate to referenceDate
  while (currentDate <= refDate) {
    const dateStr = formatDate(currentDate);
    const isToday = dateStr === referenceDate;
    const status = logMap.get(dateStr);

    if (isToday && !status) {
      // Today is Pending (unmarked)
      // Do not break the streak for today; current streak is streakAsOfYesterday
      break;
    }

    if (status === 'DONE') {
      currentRunningStreak += 1;
      longestStreak = Math.max(longestStreak, currentRunningStreak);
    } else if (status === 'SKIPPED') {
      if (skipPolicy === 'FREEZE') {
        // Freeze streak: retains current running streak without incrementing or resetting
      } else {
        // Reset streak on skip
        currentRunningStreak = 0;
      }
    } else {
      // Unmarked past day: MISSED -> breaks streak
      currentRunningStreak = 0;
    }

    if (!isToday) {
      streakAsOfYesterday = currentRunningStreak;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const currentStreak = todayStatus ? currentRunningStreak : streakAsOfYesterday;

  // Calculate completion rate against total elapsed tracked days (or total logged days)
  const totalTrackedDays = Math.max(
    1,
    Math.round((refDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const completionRate =
    totalTrackedDays > 0
      ? Math.round((totalCompletions / totalTrackedDays) * 100)
      : 0;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    totalSkips,
    completionRate: Math.min(100, Math.max(0, completionRate)),
    isTodayCompleted,
    isTodaySkipped,
  };
}
