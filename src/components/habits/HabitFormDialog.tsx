'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HabitEntity, SkipPolicy } from '@/lib/domain/types';
import { createHabitAction, updateHabitAction } from '@/actions/habits';
import { useToast } from '@/components/ui/Toast';
import { Snowflake, RotateCcw, Sparkles } from 'lucide-react';

export interface HabitFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  habitToEdit?: HabitEntity | null;
  onSuccess?: () => void;
}

export function HabitFormDialog({
  isOpen,
  onClose,
  habitToEdit,
  onSuccess,
}: HabitFormDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skipPolicy, setSkipPolicy] = useState<SkipPolicy>('FREEZE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!habitToEdit;

  useEffect(() => {
    if (habitToEdit) {
      setTitle(habitToEdit.title);
      setDescription(habitToEdit.description || '');
      setSkipPolicy(habitToEdit.skipPolicy);
    } else {
      setTitle('');
      setDescription('');
      setSkipPolicy('FREEZE');
    }
    setErrors({});
  }, [habitToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Please enter a habit title' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      if (isEditing && habitToEdit) {
        const res = await updateHabitAction({
          id: habitToEdit.id,
          title: title.trim(),
          description: description.trim() || undefined,
          skipPolicy,
        });

        if (!res.success) {
          toast('error', res.error.message, 'Failed to update habit');
          return;
        }

        toast('success', `"${title.trim()}" updated successfully`);
      } else {
        const res = await createHabitAction({
          title: title.trim(),
          description: description.trim() || undefined,
          skipPolicy,
        });

        if (!res.success) {
          toast('error', res.error.message, 'Failed to create habit');
          return;
        }

        toast('success', `"${title.trim()}" created! Ready to track.`);
      }

      onClose();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast('error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      description={
        isEditing
          ? 'Modify habit settings and skipped-day policy'
          : 'Define your habit goal and choose how skipped days affect your streak.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        {/* Habit Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Habit Title <span className="text-primary-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({});
            }}
            placeholder="e.g., Morning Meditation, Read 20 Pages"
            maxLength={100}
            error={errors.title}
            autoFocus
          />
        </div>

        {/* Habit Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description <span className="text-slate-500 lowercase">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this habit important to you?"
            maxLength={500}
            rows={2}
            className="w-full bg-surface border border-border rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none"
          />
        </div>

        {/* Skipped-Day Policy Picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Skipped-Day Behavior Policy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Freeze Policy */}
            <div
              onClick={() => setSkipPolicy('FREEZE')}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                skipPolicy === 'FREEZE'
                  ? 'bg-sky-950/50 border-sky-500/80 ring-1 ring-sky-500/50'
                  : 'bg-surface border-border hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    skipPolicy === 'FREEZE'
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Snowflake className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Streak Freeze
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A skipped day pauses your streak without breaking it. Ideal for rest days or travel.
              </p>
            </div>

            {/* Reset Policy */}
            <div
              onClick={() => setSkipPolicy('RESET')}
              className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                skipPolicy === 'RESET'
                  ? 'bg-amber-950/50 border-amber-500/80 ring-1 ring-amber-500/50'
                  : 'bg-surface border-border hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    skipPolicy === 'RESET'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Streak Reset
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A skipped day resets your streak to zero. Strict mode for non-negotiable daily goals.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
