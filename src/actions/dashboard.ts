'use server';

import { getActiveHabitsWithSummaries } from '@/lib/services/habits';

export async function getActiveHabitsAction(referenceDate: string) {
    return getActiveHabitsWithSummaries(referenceDate);
}