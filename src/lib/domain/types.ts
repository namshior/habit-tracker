export type SkipPolicy = 'FREEZE' | 'RESET';
export type LogStatus = 'DONE' | 'SKIPPED';
export type DayStatus = 'DONE' | 'SKIPPED' | 'PENDING';

export interface HabitEntity {
  id: string;
  title: string;
  description?: string | null;
  skipPolicy: SkipPolicy;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HabitLogEntry {
  id?: string;
  habitId: string;
  date: string; // ISO format YYYY-MM-DD
  status: LogStatus;
  loggedAt?: Date;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  totalSkips: number;
  completionRate: number; // 0 to 100 percentage
  isTodayCompleted: boolean;
  isTodaySkipped: boolean;
}

export interface HabitWithSummary extends HabitEntity {
  logs: HabitLogEntry[];
  summary: StreakSummary;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
      };
    };
