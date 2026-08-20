'use client';

import React from 'react';
import { Flame, Calendar, Plus, Sparkles, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/domain/streak';

export interface HeaderProps {
  currentDate: string;
  onNewHabit: () => void;
  totalActiveHabits: number;
  overallCompletionRate: number;
  longestActiveStreak: number;
}

export function Header({
  currentDate,
  onNewHabit,
  totalActiveHabits,
  overallCompletionRate,
  longestActiveStreak,
}: HeaderProps) {
  const formattedDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="border-b border-border/80 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Logo & Current Date */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-600 to-streak-flame flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Habit Tracker
                </h1>
                <span className="text-[10px] font-semibold bg-primary-950 text-primary-400 border border-primary-800/80 px-2 py-0.5 rounded-full">
                  Core
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formattedDateString}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar & New Habit Button */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Active streak highlight */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/80 border border-border text-xs">
              <Flame className="h-4 w-4 text-streak-flame fill-streak-flame" />
              <span className="text-slate-400">Best Streak:</span>
              <span className="font-semibold text-white">
                {longestActiveStreak} {longestActiveStreak === 1 ? 'day' : 'days'}
              </span>
            </div>

            {/* Completion rate highlight */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/80 border border-border text-xs">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-400">Rate:</span>
              <span className="font-semibold text-white">{overallCompletionRate}%</span>
            </div>

            <Button
              onClick={onNewHabit}
              className="font-medium shadow-glow"
              size="md"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Habit
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
