'use server';

import { getActiveHabitsWithSummaries as getHabits } from '@/lib/services/habits';

export async function getActiveHabitsWithSummaries(referenceDate: string) {
  return getHabits(referenceDate);
}

import { prisma } from '@/lib/db/prisma';
import {
  createHabitSchema,
  updateHabitSchema,
  habitIdSchema,
  CreateHabitInput,
  UpdateHabitInput,
} from '@/lib/schemas/habits';
import { ActionResult, HabitEntity } from '@/lib/domain/types';
import { revalidatePath } from 'next/cache';

export async function createHabitAction(
  rawInput: CreateHabitInput
): Promise<ActionResult<HabitEntity>> {
  try {
    const parseResult = createHabitSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit input parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
      };
    }

    const { title, description, skipPolicy } = parseResult.data;

    const created = await prisma.habit.create({
      data: {
        title,
        description: description || null,
        skipPolicy: skipPolicy as any,
        isArchived: false,
      },
    });

    try {
      revalidatePath('/');
    } catch (_) { }

    return {
      success: true,
      data: created as unknown as HabitEntity,
    };
  } catch (error) {
    console.error('Error creating habit:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create habit in database',
      },
    };
  }
}

export async function updateHabitAction(
  rawInput: UpdateHabitInput
): Promise<ActionResult<HabitEntity>> {
  try {
    const parseResult = updateHabitSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit update parameters',
          details: parseResult.error.flatten().fieldErrors,
        },
      };
    }

    const { id, title, description, skipPolicy } = parseResult.data;

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        title,
        description: description || null,
        skipPolicy: skipPolicy as any,
      },
    });

    try {
      revalidatePath('/');
    } catch (_) { }

    return {
      success: true,
      data: updated as unknown as HabitEntity,
    };
  } catch (error) {
    console.error('Error updating habit:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update habit',
      },
    };
  }
}

export async function archiveHabitAction(
  rawInput: { id: string }
): Promise<ActionResult<void>> {
  try {
    const parseResult = habitIdSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit ID',
        },
      };
    }

    await prisma.habit.update({
      where: { id: parseResult.data.id },
      data: { isArchived: true },
    });

    try {
      revalidatePath('/');
    } catch (_) { }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error archiving habit:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to archive habit',
      },
    };
  }
}

export async function unarchiveHabitAction(
  rawInput: { id: string }
): Promise<ActionResult<void>> {
  try {
    const parseResult = habitIdSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit ID',
        },
      };
    }

    await prisma.habit.update({
      where: { id: parseResult.data.id },
      data: { isArchived: false },
    });

    try {
      revalidatePath('/');
    } catch (_) { }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error unarchiving habit:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to restore habit',
      },
    };
  }
}

export async function deleteHabitAction(
  rawInput: { id: string }
): Promise<ActionResult<void>> {
  try {
    const parseResult = habitIdSchema.safeParse(rawInput);
    if (!parseResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid habit ID',
        },
      };
    }

    await prisma.habit.delete({
      where: { id: parseResult.data.id },
    });

    try {
      revalidatePath('/');
    } catch (_) { }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting habit:', error);
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete habit',
      },
    };
  }
}
