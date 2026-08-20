import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createHabitAction,
  updateHabitAction,
  archiveHabitAction,
  deleteHabitAction,
} from '@/actions/habits';
import { prisma } from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    habit: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('Habit Server Actions (TDD & Boundary Validation)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createHabitAction', () => {
    it('creates a habit with valid inputs and default FREEZE policy', async () => {
      const mockCreated = {
        id: 'h1',
        title: 'Morning Yoga',
        description: '15 mins stretch',
        skipPolicy: 'FREEZE',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.habit.create as any).mockResolvedValue(mockCreated);

      const result = await createHabitAction({
        title: 'Morning Yoga',
        description: '15 mins stretch',
        skipPolicy: 'FREEZE',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Morning Yoga');
        expect(result.data.skipPolicy).toBe('FREEZE');
      }
    });

    it('rejects empty habit title with validation error', async () => {
      const result = await createHabitAction({
        title: '',
        description: 'empty title test',
        skipPolicy: 'FREEZE',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('supports RESET skip policy during creation', async () => {
      const mockCreated = {
        id: 'h2',
        title: 'Cold Shower',
        description: null,
        skipPolicy: 'RESET',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.habit.create as any).mockResolvedValue(mockCreated);

      const result = await createHabitAction({
        title: 'Cold Shower',
        skipPolicy: 'RESET',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skipPolicy).toBe('RESET');
      }
    });
  });

  describe('updateHabitAction', () => {
    it('updates habit title and skip policy', async () => {
      const mockUpdated = {
        id: 'h1',
        title: 'Power Yoga',
        description: '30 mins stretch',
        skipPolicy: 'RESET',
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.habit.update as any).mockResolvedValue(mockUpdated);

      const result = await updateHabitAction({
        id: 'h1',
        title: 'Power Yoga',
        description: '30 mins stretch',
        skipPolicy: 'RESET',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Power Yoga');
        expect(result.data.skipPolicy).toBe('RESET');
      }
    });
  });

  describe('archiveHabitAction', () => {
    it('sets isArchived flag to true', async () => {
      (prisma.habit.update as any).mockResolvedValue({
        id: 'h1',
        isArchived: true,
      });

      const result = await archiveHabitAction({ id: 'h1' });
      expect(result.success).toBe(true);
      expect(prisma.habit.update).toHaveBeenCalledWith({
        where: { id: 'h1' },
        data: { isArchived: true },
      });
    });
  });

  describe('deleteHabitAction', () => {
    it('permanently deletes habit by id', async () => {
      (prisma.habit.delete as any).mockResolvedValue({ id: 'h1' });

      const result = await deleteHabitAction({ id: 'h1' });
      expect(result.success).toBe(true);
      expect(prisma.habit.delete).toHaveBeenCalledWith({
        where: { id: 'h1' },
      });
    });
  });
});
