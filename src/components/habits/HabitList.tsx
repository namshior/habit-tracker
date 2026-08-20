'use client';

import React, { useState } from 'react';
import { HabitWithSummary } from '@/lib/domain/types';
import { HabitCard } from './HabitCard';
import { Button } from '@/components/ui/Button';
import { Plus, Sparkles, Filter, Search, CheckCircle2 } from 'lucide-react';

export interface HabitListProps {
  habits: HabitWithSummary[];
  referenceDate: string;
  onNewHabit: () => void;
  onEditHabit: (habit: HabitWithSummary) => void;
  onRefresh: () => void;
}

export function HabitList({
  habits,
  referenceDate,
  onNewHabit,
  onEditHabit,
  onRefresh,
}: HabitListProps) {
  const [filter, setFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [openHistoryHabitId, setOpenHistoryHabitId] = useState<string | null>(null);

  const filteredHabits = habits.filter((h) => {
    // Filter by archive status
    if (filter === 'ACTIVE' && h.isArchived) return false;
    if (filter === 'ARCHIVED' && !h.isArchived) return false;

    // Filter by search text
    if (
      searchQuery.trim() &&
      !h.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(h.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const activeCount = habits.filter((h) => !h.isArchived).length;
  const archivedCount = habits.filter((h) => h.isArchived).length;

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filters, Search, and New Habit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border self-start">
          <button
            type="button"
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === 'ACTIVE'
              ? 'bg-primary-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            Active ({activeCount})
          </button>
          {archivedCount > 0 ? (
            <button
              type="button"
              onClick={() => setFilter('ARCHIVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === 'ARCHIVED'
                ? 'bg-primary-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              Archived ({archivedCount})
            </button>
          ) : null}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search habits..."
            className="w-full bg-surface border border-border rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>
      </div>

      {/* Habit Cards Grid / Empty State */}
      {filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              referenceDate={referenceDate}
              onEdit={onEditHabit}
              onRefresh={onRefresh}
              isHistoryOpen={openHistoryHabitId === habit.id}
              onHistoryOpen={() => setOpenHistoryHabitId(habit.id)}
              onHistoryClose={() => setOpenHistoryHabitId(null)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center border border-border flex flex-col items-center justify-center max-w-md mx-auto my-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600/20 to-streak-flame/20 border border-primary-500/30 flex items-center justify-center mb-4 shadow-glow">
            <Sparkles className="h-7 w-7 text-primary-400" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            {searchQuery
              ? 'No matching habits found'
              : filter === 'ARCHIVED'
                ? 'No archived habits'
                : 'No habits tracked yet'}
          </h3>

          <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
            {searchQuery
              ? 'Try adjusting your search keywords.'
              : filter === 'ARCHIVED'
                ? 'Habits you archive will appear here.'
                : 'Create your first daily habit to start building streaks and momentum.'}
          </p>

          {!searchQuery && filter === 'ACTIVE' ? (
            <Button onClick={onNewHabit} size="md">
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Habit
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
