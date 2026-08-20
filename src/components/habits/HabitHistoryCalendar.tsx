'use client';

import React, {
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Check,
    Snowflake,
    Minus,
    RotateCcw,
} from 'lucide-react';
import { HabitLogEntry, SkipPolicy } from '@/lib/domain/types';
import { formatDate } from '@/lib/domain/streak';
import {
    toggleHabitDoneAction,
    setHabitSkippedAction,
    clearHabitStatusAction,
} from '@/actions/logs';
import { useToast } from '@/components/ui/Toast';

export interface HabitHistoryCalendarProps {
    isOpen: boolean;
    onClose: () => void;
    habitId: string;
    habitTitle: string;
    logs: HabitLogEntry[];
    skipPolicy: SkipPolicy;
    onLogUpdated?: () => void;
}

export function HabitHistoryCalendar({
    isOpen,
    onClose,
    habitId,
    habitTitle,
    logs,
    skipPolicy,
    onLogUpdated,
}: HabitHistoryCalendarProps) {
    const { toast } = useToast();

    // Start on the current month.
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();

        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const [activeDate, setActiveDate] = useState<string | null>(null);

    // Position of the popup menu.
    const [menuPosition, setMenuPosition] = useState<{
        top: number;
        left: number;
        placement: 'top' | 'bottom';
    } | null>(null);

    const logMap = useMemo(() => {
        const map = new Map<string, 'DONE' | 'SKIPPED'>();

        for (const log of logs) {
            map.set(log.date, log.status);
        }

        return map;
    }, [logs]);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const monthName = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const today = formatDate(new Date());

    const days = useMemo(() => {
        const firstDay = new Date(year, month, 1);

        // Convert Sunday=0 to Monday=0.
        const firstDayOffset = (firstDay.getDay() + 6) % 7;

        const daysInMonth = new Date(
            year,
            month + 1,
            0
        ).getDate();

        const cells: Array<{
            date: string | null;
            dayNumber: number | null;
        }> = [];

        // Empty cells before the first day.
        for (let i = 0; i < firstDayOffset; i++) {
            cells.push({
                date: null,
                dayNumber: null,
            });
        }

        // Actual days.
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);

            cells.push({
                date: formatDate(date),
                dayNumber: day,
            });
        }

        return cells;
    }, [year, month]);

    /*
     * Position the action popup relative to the clicked date.
     *
     * The popup is rendered through a portal, so it is NOT trapped
     * inside the calendar's overflow/scroll container.
     */
    useLayoutEffect(() => {
        if (!activeDate) {
            setMenuPosition(null);
            return;
        }

        const updateMenuPosition = () => {
            const button = document.querySelector(
                `[data-history-date="${activeDate}"]`
            ) as HTMLElement | null;

            if (!button) {
                setMenuPosition(null);
                return;
            }

            const rect = button.getBoundingClientRect();

            const menuWidth = 144;
            const menuHeight = 128;
            const gap = 6;
            const viewportPadding = 8;

            /*
             * Horizontal positioning:
             * Keep the entire popup inside the viewport.
             */
            let left = rect.left + rect.width / 2 - menuWidth / 2;

            left = Math.max(
                viewportPadding,
                Math.min(
                    left,
                    window.innerWidth - menuWidth - viewportPadding
                )
            );

            /*
             * Vertical positioning:
             * Normally open below the date.
             * If there isn't enough space below, open above it.
             */
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            let top: number;
            let placement: 'top' | 'bottom';

            if (
                spaceBelow >= menuHeight + gap ||
                spaceBelow >= spaceAbove
            ) {
                top = rect.bottom + gap;
                placement = 'bottom';
            } else {
                top = rect.top - menuHeight - gap;
                placement = 'top';
            }

            /*
             * Final safety clamp.
             */
            top = Math.max(
                viewportPadding,
                Math.min(
                    top,
                    window.innerHeight - menuHeight - viewportPadding
                )
            );

            setMenuPosition({
                top,
                left,
                placement,
            });
        };

        // Position immediately.
        updateMenuPosition();

        /*
         * Recalculate while scrolling/resizing.
         * This keeps the popup attached to the selected date.
         */
        window.addEventListener('resize', updateMenuPosition);
        window.addEventListener('scroll', updateMenuPosition, true);

        return () => {
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition, true);
        };
    }, [activeDate]);

    if (!isOpen) {
        return null;
    }

    const goToPreviousMonth = () => {
        setActiveDate(null);
        setMenuPosition(null);

        setCurrentMonth(
            new Date(year, month - 1, 1)
        );
    };

    const goToNextMonth = () => {
        setActiveDate(null);
        setMenuPosition(null);

        setCurrentMonth(
            new Date(year, month + 1, 1)
        );
    };

    const handleStatusChange = async (
        date: string,
        action: 'DONE' | 'SKIPPED' | 'CLEAR'
    ) => {
        setActiveDate(null);
        setMenuPosition(null);

        try {
            if (action === 'DONE') {
                const res = await toggleHabitDoneAction({
                    habitId,
                    date,
                });

                if (res.success) {
                    toast(
                        'success',
                        `Marked ${date} as Done`
                    );
                    onLogUpdated?.();
                } else {
                    toast('error', res.error.message);
                }
            }

            if (action === 'SKIPPED') {
                const res = await setHabitSkippedAction({
                    habitId,
                    date,
                });

                if (res.success) {
                    toast(
                        'info',
                        skipPolicy === 'FREEZE'
                            ? `Marked ${date} as Skipped. Streak is frozen.`
                            : `Marked ${date} as Skipped. Streak resets under Strict Mode.`
                    );

                    onLogUpdated?.();
                } else {
                    toast('error', res.error.message);
                }
            }

            if (action === 'CLEAR') {
                const res = await clearHabitStatusAction({
                    habitId,
                    date,
                });

                if (res.success) {
                    toast(
                        'info',
                        `Cleared ${date}`
                    );
                    onLogUpdated?.();
                } else {
                    toast('error', res.error.message);
                }
            }
        } catch {
            toast(
                'error',
                'Failed to update historical status'
            );
        }
    };

    return (
        <div className="absolute inset-0 z-[100] rounded-2xl overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Calendar Card */}
            <div className="absolute inset-0 z-10 flex min-h-0 flex-col rounded-2xl bg-surface border border-border/80 shadow-xl overflow-hidden">

                {/* Header - FIXED */}
                <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border/60">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold text-white truncate">
                            {habitTitle}
                        </h2>

                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Habit History
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
                        title="Close history"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Month Navigation - FIXED */}
                <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-border/40">
                    <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
                        title="Previous month"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <h3 className="text-sm font-semibold text-white">
                        {monthName}
                    </h3>

                    <button
                        type="button"
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
                        title="Next month"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Calendar Area */}
                <div className="flex min-h-0 flex-1 flex-col px-4 pb-3">

                    {/* Weekday Labels - FIXED */}
                    <div className="shrink-0 grid grid-cols-7 gap-2 mb-1">
                        {[
                            'Mon',
                            'Tue',
                            'Wed',
                            'Thu',
                            'Fri',
                            'Sat',
                            'Sun',
                        ].map((day) => (
                            <div
                                key={day}
                                className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 py-2"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days - ONLY THIS PART SCROLLS */}
                    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin">
                        <div className="grid grid-cols-7 gap-2 pb-2">

                            {days.map((cell, index) => {
                                if (!cell.date) {
                                    return (
                                        <div
                                            key={`empty-${index}`}
                                            className="min-h-12 sm:min-h-14"
                                        />
                                    );
                                }

                                const date = cell.date;
                                const status = logMap.get(date);
                                const isToday = date === today;
                                const isFuture = date > today;
                                const isActive = activeDate === date;

                                return (
                                    <div
                                        key={date}
                                        className="relative min-h-12 sm:min-h-14"
                                    >
                                        <button
                                            type="button"
                                            disabled={isFuture}
                                            data-history-date={date}
                                            onClick={() => {
                                                if (isActive) {
                                                    setActiveDate(null);
                                                    setMenuPosition(null);
                                                } else {
                                                    setActiveDate(date);
                                                }
                                            }}
                                            className={`
                                                w-full h-full min-h-12 sm:min-h-14
                                                rounded-lg
                                                border
                                                p-1.5
                                                flex flex-col
                                                items-center
                                                justify-center
                                                transition-all

                                                ${status === 'DONE'
                                                    ? 'bg-emerald-500/15 border-emerald-500/50 hover:bg-emerald-500/20'
                                                    : status === 'SKIPPED'
                                                        ? 'bg-sky-950/50 border-sky-600/50 hover:bg-sky-950/70'
                                                        : isToday
                                                            ? 'bg-surface border-primary-500/50'
                                                            : isFuture
                                                                ? 'bg-surface/30 border-border/40 opacity-40 cursor-not-allowed'
                                                                : 'bg-surface/50 border-border/60 hover:border-slate-600'
                                                }

                                                ${isActive
                                                    ? 'ring-2 ring-primary-500/60'
                                                    : ''
                                                }
                                            `}
                                            title={
                                                isFuture
                                                    ? `${date} - Future`
                                                    : `${date} - ${status ||
                                                    (isToday
                                                        ? 'Pending'
                                                        : 'Missed')
                                                    }`
                                            }
                                        >
                                            {/* Date Number */}
                                            <span
                                                className={`
                                                    text-[10px] font-semibold
                                                    ${isToday
                                                        ? 'text-primary-400'
                                                        : 'text-slate-400'
                                                    }
                                                `}
                                            >
                                                {cell.dayNumber}
                                            </span>

                                            {/* Status Icon */}
                                            {status === 'DONE' ? (
                                                <Check className="h-4 w-4 text-emerald-400 stroke-[2.5]" />
                                            ) : status === 'SKIPPED' ? (
                                                <Snowflake className="h-3.5 w-3.5 text-sky-400" />
                                            ) : isFuture ? (
                                                <span className="text-[8px] text-slate-700">
                                                    —
                                                </span>
                                            ) : (
                                                <Minus className="h-3.5 w-3.5 text-slate-600" />
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Action Menu - rendered outside the calendar overflow */}
            {activeDate &&
                menuPosition &&
                typeof document !== 'undefined'
                ? createPortal(
                    <div
                        className="fixed z-[9999] w-36 rounded-xl bg-surface border border-slate-700 shadow-2xl p-1 text-left"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 border-b border-border mb-1">
                            {activeDate}
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                handleStatusChange(
                                    activeDate,
                                    'DONE'
                                )
                            }
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/50 rounded transition-colors"
                        >
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            Mark Done
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleStatusChange(
                                    activeDate,
                                    'SKIPPED'
                                )
                            }
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-sky-300 hover:bg-sky-950/50 rounded transition-colors"
                        >
                            <Snowflake className="h-3.5 w-3.5 text-sky-400" />
                            Mark Skipped
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleStatusChange(
                                    activeDate,
                                    'CLEAR'
                                )
                            }
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-400 hover:bg-surface-hover rounded transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Clear (Missed)
                        </button>
                    </div>,
                    document.body
                )
                : null}
        </div>
    );
}