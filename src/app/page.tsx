'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { HabitList } from '@/components/habits/HabitList';
import { HabitFormDialog } from '@/components/habits/HabitFormDialog';
import { HabitWithSummary } from '@/lib/domain/types';
import { formatDate } from '@/lib/domain/streak';
import { getActiveHabitsAction } from '@/actions/dashboard';

export default function DashboardPage() {
  const [habits, setHabits] = useState<HabitWithSummary[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<HabitWithSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local date reference string YYYY-MM-DD
  const [todayDate] = useState(() => formatDate(new Date()));

  const loadHabits = async () => {
    try {
      const { getActiveHabitsWithSummaries } = await import(
        '@/actions/habits'
      );

      const data = await getActiveHabitsWithSummaries(todayDate);
      setHabits(data);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHabits();
  }, [todayDate]);

  // Aggregate statistics for header
  const activeHabits = habits.filter((h) => !h.isArchived);
  const totalActive = activeHabits.length;

  const longestActiveStreak = activeHabits.reduce(
    (max, h) => Math.max(max, h.summary.currentStreak),
    0
  );

  const overallCompletionRate =
    totalActive > 0
      ? Math.round(
        activeHabits.reduce((acc, h) => acc + h.summary.completionRate, 0) /
        totalActive
      )
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        currentDate={todayDate}
        onNewHabit={() => {
          setHabitToEdit(null);
          setIsFormOpen(true);
        }}
        totalActiveHabits={totalActive}
        overallCompletionRate={overallCompletionRate}
        longestActiveStreak={longestActiveStreak}
      />

      <DashboardShell>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400">Loading your habits...</p>
          </div>
        ) : (
          <HabitList
            habits={habits}
            referenceDate={todayDate}
            onNewHabit={() => {
              setHabitToEdit(null);
              setIsFormOpen(true);
            }}
            onEditHabit={(h) => {
              setHabitToEdit(h);
              setIsFormOpen(true);
            }}
            onRefresh={loadHabits}
          />
        )}

        <HabitFormDialog
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setHabitToEdit(null);
          }}
          habitToEdit={habitToEdit}
          onSuccess={loadHabits}
        />
      </DashboardShell>
    </div>
  );
}
