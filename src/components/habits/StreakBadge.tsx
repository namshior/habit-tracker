'use client';

import React from 'react';
import { Flame, Snowflake, Trophy, RotateCcw } from 'lucide-react';
import { SkipPolicy, StreakSummary } from '@/lib/domain/types';

export interface StreakBadgeProps {
  summary: StreakSummary;
  skipPolicy: SkipPolicy;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({
  summary,
  skipPolicy,
  size = 'md',
}: StreakBadgeProps) {
  const { currentStreak, longestStreak, isTodaySkipped } = summary;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Current Active Streak Badge */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
          currentStreak > 0
            ? isTodaySkipped && skipPolicy === 'FREEZE'
              ? 'bg-sky-950/80 border-sky-600/60 text-sky-300 shadow-glow-streak/20'
              : 'bg-orange-950/90 border-orange-600/70 text-orange-400 shadow-glow-streak'
            : 'bg-surface border-border text-slate-400'
        }`}
      >
        {isTodaySkipped && skipPolicy === 'FREEZE' ? (
          <Snowflake className="h-4 w-4 text-sky-400 animate-pulse" />
        ) : (
          <Flame
            className={`h-4 w-4 ${
              currentStreak > 0
                ? 'text-streak-flame fill-streak-flame animate-pulse-subtle'
                : 'text-slate-500'
            }`}
          />
        )}
        <span className="text-xs font-bold tracking-tight">
          {currentStreak} {currentStreak === 1 ? 'day' : 'days'} streak
        </span>
      </div>

      {/* Longest Milestone Streak Badge */}
      {longestStreak > 0 ? (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface/80 border border-border text-xs text-amber-300/90">
          <Trophy className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-medium text-slate-300">
            Best: <strong className="text-amber-300">{longestStreak}d</strong>
          </span>
        </div>
      ) : null}

      {/* Skip Policy Tag */}
      <div
        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
          skipPolicy === 'FREEZE'
            ? 'bg-sky-950/40 text-sky-400 border-sky-800/40'
            : 'bg-slate-900 text-slate-400 border-slate-800'
        }`}
        title={
          skipPolicy === 'FREEZE'
            ? 'Streak Freeze: Skipped days maintain your streak'
            : 'Streak Reset: Skipped days break your streak'
        }
      >
        {skipPolicy === 'FREEZE' ? (
          <Snowflake className="h-3 w-3" />
        ) : (
          <RotateCcw className="h-3 w-3" />
        )}
        <span>{skipPolicy === 'FREEZE' ? 'Freeze Policy' : 'Strict Mode'}</span>
      </div>
    </div>
  );
}
