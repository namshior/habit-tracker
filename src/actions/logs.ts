'use server';

import { prisma } from '@/lib/db/prisma';
import {
  habitDateSchema,
  setHabitStatusSchema,
  SetHabitStatusInput,
} from '@/lib/schemas/habits';
import { ActionResult, HabitLogEntry } from '@/lib/domain/types';
import { revalidatePath } from 'next/cache';

/**
 * Primary Checkbox Interaction:
 * Toggles between DONE and PENDING for a given habit and date.
 * If currently DONE -> deletes log (reverts to PENDING).
 * If currently PENDING or SKIPPED -> sets status to DONE.
 */
export async function toggleHabitDoneAction(rawInput: {
  habitId: string;
  date: string;
}): Promise<ActionResult<{ status: 'DONE' | 'PENDING' }>> {
  try {
    const parseResult = habitDateSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit ID or date format (YYYY-MM-DD)',
        },
      };
    }

    const { habitId, date } = parseResult.data;

    const existing = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
    });

    if (existing && existing.status === 'DONE') {
      // Revert to PENDING by deleting log record
      await prisma.habitLog.deleteMany({
        where: { habitId, date },
      });

      try {
        revalidatePath('/');
      } catch (_) {}

      return { success: true, data: { status: 'PENDING' } };
    } else {
      // Set to DONE (upsert ensures idempotency)
      await prisma.habitLog.upsert({
        where: {
          habitId_date: { habitId, date },
        },
        create: {
          habitId,
          date,
          status: 'DONE',
        },
        update: {
          status: 'DONE',
        },
      });

      try {
        revalidatePath('/');
      } catch (_) {}

      return { success: true, data: { status: 'DONE' } };
    }
  } catch (error) {
    console.error('Error toggling habit done status:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update habit status',
      },
    };
  }
}

/**
 * Dedicated Skip Action:
 * Marks a habit as SKIPPED for a given date.
 */
export async function setHabitSkippedAction(rawInput: {
  habitId: string;
  date: string;
}): Promise<ActionResult<{ status: 'SKIPPED' }>> {
  try {
    const parseResult = habitDateSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit ID or date format (YYYY-MM-DD)',
        },
      };
    }

    const { habitId, date } = parseResult.data;

    await prisma.habitLog.upsert({
      where: {
        habitId_date: { habitId, date },
      },
      create: {
        habitId,
        date,
        status: 'SKIPPED',
      },
      update: {
        status: 'SKIPPED',
      },
    });

    try {
      revalidatePath('/');
    } catch (_) {}

    return { success: true, data: { status: 'SKIPPED' } };
  } catch (error) {
    console.error('Error setting habit skipped status:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to mark habit as skipped',
      },
    };
  }
}

/**
 * Clear Action:
 * Removes log record for a given date (reverting status to PENDING).
 */
export async function clearHabitStatusAction(rawInput: {
  habitId: string;
  date: string;
}): Promise<ActionResult<{ status: 'PENDING' }>> {
  try {
    const parseResult = habitDateSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit ID or date format (YYYY-MM-DD)',
        },
      };
    }

    const { habitId, date } = parseResult.data;

    await prisma.habitLog.deleteMany({
      where: { habitId, date },
    });

    try {
      revalidatePath('/');
    } catch (_) {}

    return { success: true, data: { status: 'PENDING' } };
  } catch (error) {
    console.error('Error clearing habit status:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to clear habit status',
      },
    };
  }
}

/**
 * Parameterized generic status setter.
 */
export async function setHabitStatusAction(
  rawInput: SetHabitStatusInput
): Promise<ActionResult<void>> {
  try {
    const parseResult = setHabitStatusSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status update parameters',
        },
      };
    }

    const { habitId, date, status } = parseResult.data;

    if (status === 'PENDING') {
      await prisma.habitLog.deleteMany({
        where: { habitId, date },
      });
    } else {
      await prisma.habitLog.upsert({
        where: {
          habitId_date: { habitId, date },
        },
        create: {
          habitId,
          date,
          status,
        },
        update: {
          status,
        },
      });
    }

    try {
      revalidatePath('/');
    } catch (_) {}

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error setting habit status:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to set habit status',
      },
    };
  }
}
