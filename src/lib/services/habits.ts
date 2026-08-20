import { prisma } from '@/lib/db/prisma';
import { calculateStreak } from '@/lib/domain/streak';
import {
  HabitEntity,
  HabitLogEntry,
  HabitWithSummary,
  SkipPolicy,
} from '@/lib/domain/types';

/**
 * Composite Query Service:
 * Retrieves active (unarchived) habits and their historical logs,
 * applies pure domain streak calculations for the given reference date,
 * and produces enriched HabitWithSummary view models.
 */
export async function getActiveHabitsWithSummaries(
  referenceDate: string
): Promise<HabitWithSummary[]> {
  try {
    const habits = await prisma.habit.findMany({
      where: {
        isArchived: false,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        logs: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    return habits.map((h) => {
      const logs: HabitLogEntry[] = h.logs.map((l) => ({
        id: l.id,
        habitId: l.habitId,
        date: l.date,
        status: l.status as 'DONE' | 'SKIPPED',
        loggedAt: l.loggedAt,
      }));

      const summary = calculateStreak(
        logs,
        h.skipPolicy as SkipPolicy,
        referenceDate
      );

      return {
        id: h.id,
        title: h.title,
        description: h.description,
        skipPolicy: h.skipPolicy as SkipPolicy,
        isArchived: h.isArchived,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
        logs,
        summary,
      };
    });
  } catch (error) {
    console.error('Error fetching habits with summaries:', error);
    return [];
  }
}

/**
 * Query habit log history within a specific date range (e.g. for weekly matrix).
 */
export async function getHabitHistory(
  habitId: string,
  startDate: string,
  endDate: string
): Promise<HabitLogEntry[]> {
  try {
    const logs = await prisma.habitLog.findMany({
      where: {
        habitId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return logs.map((l) => ({
      id: l.id,
      habitId: l.habitId,
      date: l.date,
      status: l.status as 'DONE' | 'SKIPPED',
      loggedAt: l.loggedAt,
    }));
  } catch (error) {
    console.error('Error fetching habit history:', error);
    return [];
  }
}
