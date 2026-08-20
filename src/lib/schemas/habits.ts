import { z } from 'zod';

export const createHabitSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  skipPolicy: z.enum(['FREEZE', 'RESET']).default('FREEZE'),
});

export const updateHabitSchema = z.object({
  id: z.string().min(1, 'Habit ID is required'),
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .or(z.literal('')),
  skipPolicy: z.enum(['FREEZE', 'RESET']),
});

export const habitIdSchema = z.object({
  id: z.string().min(1, 'Habit ID is required'),
});

export const habitDateSchema = z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must follow YYYY-MM-DD format'),
});

export const setHabitStatusSchema = z.object({
  habitId: z.string().min(1, 'Habit ID is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must follow YYYY-MM-DD format'),
  status: z.enum(['DONE', 'SKIPPED', 'PENDING']),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type SetHabitStatusInput = z.infer<typeof setHabitStatusSchema>;
