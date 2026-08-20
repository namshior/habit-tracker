import React from 'react';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-primary-500/30 selection:text-primary-200">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-slate-500">
        <p>Core Habit Tracker • Test-Driven, Resilient, & Pure Domain Engine</p>
      </footer>
    </div>
  );
}
