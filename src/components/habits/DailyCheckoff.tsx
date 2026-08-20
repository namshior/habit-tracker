'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Check, Snowflake, MoreHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { toggleHabitDoneAction, setHabitSkippedAction, clearHabitStatusAction } from '@/actions/logs';
import { DayStatus, SkipPolicy } from '@/lib/domain/types';
import { useToast } from '@/components/ui/Toast';

export interface DailyCheckoffProps {
  habitId: string;
  date: string; // YYYY-MM-DD
  initialStatus: DayStatus;
  skipPolicy: SkipPolicy;
  onStatusChange?: (newStatus: DayStatus) => void;
}

export function DailyCheckoff({
  habitId,
  date,
  initialStatus,
  skipPolicy,
  onStatusChange,
}: DailyCheckoffProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<DayStatus>(initialStatus);
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);
  const [showMenu, setShowMenu] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Primary Checkbox Handler: toggles DONE <-> PENDING
  const handlePrimaryClick = () => {
    const nextStatus: DayStatus = status === 'DONE' ? 'PENDING' : 'DONE';
    const prevStatus = status;

    // Optimistic UI Update (<100ms perceived response)
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);

    startTransition(async () => {
      try {
        const res = await toggleHabitDoneAction({ habitId, date });
        if (!res.success) {
          // Rollback on server error
          setStatus(prevStatus);
          onStatusChange?.(prevStatus);
          toast('error', res.error.message, 'Failed to update status');
        }
      } catch (err) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
        toast('error', 'Network error. Please retry.');
      }
    });
  };

  // Dedicated Skip Action Handler
  const handleSkipClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const prevStatus = status;
    const nextStatus: DayStatus = 'SKIPPED';

    // Optimistic UI update
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);

    startTransition(async () => {
      try {
        const res = await setHabitSkippedAction({ habitId, date });
        if (!res.success) {
          setStatus(prevStatus);
          onStatusChange?.(prevStatus);
          toast('error', res.error.message, 'Failed to mark as skipped');
        } else {
          toast(
            'info',
            skipPolicy === 'FREEZE'
              ? 'Day marked as Skipped. Streak is safely frozen.'
              : 'Day marked as Skipped. (Streak resets under Strict Mode).'
          );
        }
      } catch (err) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
        toast('error', 'Network error. Please retry.');
      }
    });
  };

  // Clear / Reset Handler
  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    const prevStatus = status;
    const nextStatus: DayStatus = 'PENDING';

    setStatus(nextStatus);
    onStatusChange?.(nextStatus);

    startTransition(async () => {
      try {
        const res = await clearHabitStatusAction({ habitId, date });
        if (!res.success) {
          setStatus(prevStatus);
          onStatusChange?.(prevStatus);
          toast('error', res.error.message, 'Failed to clear status');
        }
      } catch (err) {
        setStatus(prevStatus);
        onStatusChange?.(prevStatus);
      }
    });
  };

  return (
    <div className="relative flex items-center gap-1.5 select-none">
      {/* Primary 1-Click Checkbox */}
      <button
        type="button"
        onClick={handlePrimaryClick}
        title={
          status === 'DONE'
            ? 'Mark as uncompleted'
            : status === 'SKIPPED'
              ? 'Mark as completed (Done)'
              : 'Check off for today (Done)'
        }
        className={`group relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:scale-95 ${status === 'DONE'
          ? 'bg-emerald-500 text-slate-950 shadow-glow-success ring-2 ring-emerald-400/80 scale-105'
          : status === 'SKIPPED'
            ? 'bg-sky-950/80 border border-sky-500/70 text-sky-400 hover:border-sky-400'
            : 'bg-surface hover:bg-surface-hover border-2 border-border hover:border-primary-500/70 text-transparent hover:text-slate-500'
          }`}
      >
        {status === 'DONE' ? (
          <Check className="h-6 w-6 stroke-[3] text-slate-950 animate-scale-in" />
        ) : status === 'SKIPPED' ? (
          <Snowflake className="h-5 w-5 text-sky-400 animate-scale-in" />
        ) : (
          <Check className="h-5 w-5 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </button>

      {/* Dedicated Skip / Quick-Menu Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          title="More options (Skip / Reset)"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface/80 transition-colors focus:outline-none"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {/* Dropdown Popover */}
        {showMenu ? (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl glass-panel shadow-2xl p-1 z-30 animate-scale-in border border-slate-700/80">
              <button
                type="button"
                onClick={handleSkipClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-sky-300 hover:bg-sky-950/60 rounded-lg transition-colors text-left"
              >
                <Snowflake className="h-3.5 w-3.5 text-sky-400" />
                Mark as Skipped
              </button>

              {status !== 'PENDING' ? (
                <button
                  type="button"
                  onClick={handleClearClick}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-surface-hover rounded-lg transition-colors text-left"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                  Clear / Reset
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
