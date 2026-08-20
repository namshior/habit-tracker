import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  toggleHabitDoneAction,
  setHabitSkippedAction,
  clearHabitStatusAction,
  setHabitStatusAction,
} from '@/actions/logs';
import { prisma } from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    habitLog: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('Daily Status Log Server Actions (TDD & Idempotency)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toggleHabitDoneAction (Primary Checkbox)', () => {
    it('sets status to DONE when currently pending/no log', async () => {
      (prisma.habitLog.findUnique as any).mockResolvedValue(null);
      (prisma.habitLog.upsert as any).mockResolvedValue({
        id: 'l1',
        habitId: 'h1',
        date: '2026-08-19',
        status: 'DONE',
      });

      const result = await toggleHabitDoneAction({
        habitId: 'h1',
        date: '2026-08-19',
      });

      expect(result.success).toBe(true);
      expect(prisma.habitLog.upsert).toHaveBeenCalledWith({
        where: { habitId_date: { habitId: 'h1', date: '2026-08-19' } },
        create: { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
        update: { status: 'DONE' },
      });
    });

    it('reverts status to PENDING (deletes log) when currently DONE', async () => {
      (prisma.habitLog.findUnique as any).mockResolvedValue({
        id: 'l1',
        habitId: 'h1',
        date: '2026-08-19',
        status: 'DONE',
      });

      const result = await toggleHabitDoneAction({
        habitId: 'h1',
        date: '2026-08-19',
      });

      expect(result.success).toBe(true);
      expect(prisma.habitLog.deleteMany).toHaveBeenCalledWith({
        where: { habitId: 'h1', date: '2026-08-19' },
      });
    });
  });

  describe('setHabitSkippedAction (Dedicated Skip Action)', () => {
    it('explicitly marks habit as SKIPPED for a date', async () => {
      (prisma.habitLog.upsert as any).mockResolvedValue({
        id: 'l2',
        habitId: 'h1',
        date: '2026-08-19',
        status: 'SKIPPED',
      });

      const result = await setHabitSkippedAction({
        habitId: 'h1',
        date: '2026-08-19',
      });

      expect(result.success).toBe(true);
      expect(prisma.habitLog.upsert).toHaveBeenCalledWith({
        where: { habitId_date: { habitId: 'h1', date: '2026-08-19' } },
        create: { habitId: 'h1', date: '2026-08-19', status: 'SKIPPED' },
        update: { status: 'SKIPPED' },
      });
    });
  });

  describe('clearHabitStatusAction', () => {
    it('clears log record for habit date back to pending', async () => {
      const result = await clearHabitStatusAction({
        habitId: 'h1',
        date: '2026-08-19',
      });

      expect(result.success).toBe(true);
      expect(prisma.habitLog.deleteMany).toHaveBeenCalledWith({
        where: { habitId: 'h1', date: '2026-08-19' },
      });
    });
  });

  describe('setHabitStatusAction (Generic Setter)', () => {
    it('handles explicit DONE, SKIPPED, and PENDING transitions', async () => {
      await setHabitStatusAction({
        habitId: 'h1',
        date: '2026-08-19',
        status: 'DONE',
      });
      expect(prisma.habitLog.upsert).toHaveBeenCalledWith({
        where: { habitId_date: { habitId: 'h1', date: '2026-08-19' } },
        create: { habitId: 'h1', date: '2026-08-19', status: 'DONE' },
        update: { status: 'DONE' },
      });

      await setHabitStatusAction({
        habitId: 'h1',
        date: '2026-08-19',
        status: 'PENDING',
      });
      expect(prisma.habitLog.deleteMany).toHaveBeenCalledWith({
        where: { habitId: 'h1', date: '2026-08-19' },
      });
    });

    it('rejects invalid date format', async () => {
      const result = await setHabitStatusAction({
        habitId: 'h1',
        date: 'invalid-date',
        status: 'DONE',
      });
      expect(result.success).toBe(false);
    });
  });
});
