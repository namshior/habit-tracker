'use client';

import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Snowflake, Minus, RotateCcw } from 'lucide-react';
import { HabitLogEntry, SkipPolicy } from '@/lib/domain/types';
import { formatDate, parseDate } from '@/lib/domain/streak';
import { toggleHabitDoneAction, setHabitSkippedAction, clearHabitStatusAction } from '@/actions/logs';
import { useToast } from '@/components/ui/Toast';

export interface HabitWeeklyMatrixProps {
  habitId: string;
  logs: HabitLogEntry[];
  skipPolicy: SkipPolicy;
  referenceDate: string; // YYYY-MM-DD (today)
  onLogUpdated?: () => void;
}

export function HabitWeeklyMatrix({
  habitId,
  logs,
  skipPolicy,
  referenceDate,
  onLogUpdated,
}: HabitWeeklyMatrixProps) {
  const { toast } = useToast();
  const [activeDateMenu, setActiveDateMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [activeButton, setActiveButton] = useState<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    if (!activeButton) {
      setMenuPosition(null);
      return;
    }

    const rect = activeButton.getBoundingClientRect();

    setMenuPosition({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
    });
  }, [activeButton]);

  // Generate the last 7 days leading up to referenceDate
  const days: Array<{ dateStr: string; dayLabel: string; dayNumber: number; isToday: boolean }> = [];
  const refDate = parseDate(referenceDate);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate.getTime());
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    days.push({
      dateStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      isToday: i === 0,
    });
  }

  // Quick lookup map of logs
  const logMap = new Map<string, 'DONE' | 'SKIPPED'>();
  for (const log of logs) {
    logMap.set(log.date, log.status);
  }

  const handleRetroStatusChange = async (dateStr: string, action: 'DONE' | 'SKIPPED' | 'CLEAR') => {
    setActiveDateMenu(null);
    setActiveButton(null);
    setMenuPosition(null);
    try {
      if (action === 'DONE') {
        const res = await toggleHabitDoneAction({ habitId, date: dateStr });
        if (res.success) {
          toast('success', `Updated log for ${dateStr}`);
          onLogUpdated?.();
        }
      } else if (action === 'SKIPPED') {
        const res = await setHabitSkippedAction({ habitId, date: dateStr });
        if (res.success) {
          toast('info', `Marked ${dateStr} as Skipped`);
          onLogUpdated?.();
        }
      } else if (action === 'CLEAR') {
        const res = await clearHabitStatusAction({ habitId, date: dateStr });
        if (res.success) {
          toast('info', `Cleared log for ${dateStr}`);
          onLogUpdated?.();
        }
      }
    } catch (err) {
      toast('error', 'Failed to update historical log');
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Last 7 Days Activity
        </span>
        <span className="text-[11px] text-slate-500">Click past days to edit</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map(({ dateStr, dayLabel, dayNumber, isToday }) => {
          const status = logMap.get(dateStr);
          const isMissed = !status && !isToday;
          const isMenuOpen = activeDateMenu === dateStr;

          return (
            <div
              key={dateStr}
              className="relative flex flex-col items-center"
            >
              <div className="flex flex-col items-center mb-1 leading-none">
                <span className="text-[10px] font-semibold text-slate-400">
                  {dayLabel}
                </span>
                <span
                  className={`text-[10px] mt-0.5 ${isToday ? 'text-primary-400 font-bold' : 'text-slate-500'
                    }`}
                >
                  {dayNumber}
                </span>
              </div>

              <button
                type="button"
                data-habit-date={dateStr}
                onClick={(e) => {
                  if (isMenuOpen) {
                    setActiveDateMenu(null);
                    setActiveButton(null);
                    setMenuPosition(null);
                  } else {
                    setActiveDateMenu(dateStr);
                    setActiveButton(e.currentTarget);
                  }
                }}
                title={`${dateStr} - Status: ${status || (isToday ? 'Pending' : 'Missed')}`}
                className={`relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex flex-col items-center justify-center text-[11px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-primary-500 ${status === 'DONE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : status === 'SKIPPED'
                    ? 'bg-sky-950/60 text-sky-300 border border-sky-600/50'
                    : isToday
                      ? 'bg-surface border border-primary-500/40 text-slate-300'
                      : 'bg-surface/50 border border-border/60 text-slate-500 hover:border-slate-600'
                  }`}
              >
                {status === 'DONE' ? (
                  <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                ) : status === 'SKIPPED' ? (
                  <Snowflake className="h-3.5 w-3.5 text-sky-400" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-slate-600" />
                )}
              </button>

              {/* Retroactive Action Popover */}
              {isMenuOpen && menuPosition && typeof document !== 'undefined'
                ? createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[999]"
                      onClick={() => {
                        setActiveDateMenu(null);
                        setActiveButton(null);
                        setMenuPosition(null);
                      }}
                    />

                    <div
                      className="fixed z-[1000] w-36 rounded-xl glass-panel shadow-2xl p-1 border border-slate-700 text-left"
                      style={{
                        top: menuPosition.top,
                        left: menuPosition.left,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 border-b border-border mb-1">
                        {dateStr}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRetroStatusChange(dateStr, 'DONE')}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/50 rounded transition-colors"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Mark Done
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRetroStatusChange(dateStr, 'SKIPPED')}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-sky-300 hover:bg-sky-950/50 rounded transition-colors"
                      >
                        <Snowflake className="h-3.5 w-3.5 text-sky-400" />
                        Mark Skipped
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRetroStatusChange(dateStr, 'CLEAR')}
                        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-400 hover:bg-surface-hover rounded transition-colors"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Clear (Missed)
                      </button>
                    </div>
                  </>,
                  document.body
                )
                : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
