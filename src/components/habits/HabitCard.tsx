'use client';

import React, { useState } from 'react';
import { HabitWithSummary, DayStatus } from '@/lib/domain/types';
import { StreakBadge } from './StreakBadge';
import { DailyCheckoff } from './DailyCheckoff';
import { HabitWeeklyMatrix } from './HabitWeeklyMatrix';
import { archiveHabitAction, deleteHabitAction, unarchiveHabitAction } from '@/actions/habits';
import { useToast } from '@/components/ui/Toast';
import { MoreVertical, Edit2, Archive, Trash2, RotateCcw } from 'lucide-react';

export interface HabitCardProps {
  habit: HabitWithSummary;
  referenceDate: string; // YYYY-MM-DD
  onEdit: (habit: HabitWithSummary) => void;
  onRefresh?: () => void;
}

export function HabitCard({
  habit,
  referenceDate,
  onEdit,
  onRefresh,
}: HabitCardProps) {
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialTodayStatus: DayStatus = habit.summary.isTodayCompleted
    ? 'DONE'
    : habit.summary.isTodaySkipped
    ? 'SKIPPED'
    : 'PENDING';

  const handleArchive = async () => {
    setShowMenu(false);
    try {
      const res = habit.isArchived
        ? await unarchiveHabitAction({ id: habit.id })
        : await archiveHabitAction({ id: habit.id });

      if (res.success) {
        toast('info', habit.isArchived ? 'Habit restored to active list' : 'Habit moved to archive');
        onRefresh?.();
      }
    } catch (err) {
      toast('error', 'Failed to archive habit');
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (!window.confirm(`Are you sure you want to permanently delete "${habit.title}" and all its history?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteHabitAction({ id: habit.id });
      if (res.success) {
        toast('success', `"${habit.title}" permanently deleted`);
        onRefresh?.();
      } else {
        toast('error', res.error.message, 'Failed to delete habit');
      }
    } catch (err) {
      toast('error', 'Error deleting habit');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-border/80 hover:border-slate-700 transition-all duration-200 shadow-lg relative group">
      {/* Top Header Row: Title, Skip Policy Badge, & Action Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-base font-semibold text-white tracking-tight truncate">
              {habit.title}
            </h3>
            {habit.isArchived ? (
              <span className="text-[10px] uppercase font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                Archived
              </span>
            ) : null}
          </div>

          {habit.description ? (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {habit.description}
            </p>
          ) : null}
        </div>

        {/* Action Menu (Edit, Archive, Delete) */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface/80 transition-colors"
            title="Habit actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu ? (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl glass-panel shadow-2xl p-1 z-30 animate-scale-in border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(habit);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-surface-hover rounded-lg transition-colors text-left"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Habit
                </button>
                <button
                  type="button"
                  onClick={handleArchive}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 hover:bg-surface-hover rounded-lg transition-colors text-left"
                >
                  {habit.isArchived ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore Habit
                    </>
                  ) : (
                    <>
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors text-left"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Middle Row: Streak Badge & 1-Click Checkoff for Today */}
      <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-border/40">
        <StreakBadge
          summary={habit.summary}
          skipPolicy={habit.skipPolicy}
        />

        <DailyCheckoff
          habitId={habit.id}
          date={referenceDate}
          initialStatus={initialTodayStatus}
          skipPolicy={habit.skipPolicy}
          onStatusChange={() => onRefresh?.()}
        />
      </div>

      {/* Bottom Row: 7-Day History Matrix & Retroactive Edit */}
      <HabitWeeklyMatrix
        habitId={habit.id}
        logs={habit.logs}
        skipPolicy={habit.skipPolicy}
        referenceDate={referenceDate}
        onLogUpdated={() => onRefresh?.()}
      />
    </div>
  );
}
