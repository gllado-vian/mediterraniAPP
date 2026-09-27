import { ROTATION_CATEGORIES, type RotationCategory } from './categories';
import { weekDates } from './dates';
import { weeklyProgress } from './planner';
import type { DayRecord, IsoDate } from './types';

export interface SummaryRow {
  category: RotationCategory;
  done: number;
  quota: number;
  complete: boolean;
}

export interface WeeklySummary {
  rows: SummaryRow[];
  /** Capritxos confirmats aquesta setmana (no computen a cap quota). */
  capritxos: number;
}

export function weeklySummary(today: IsoDate, days: DayRecord[]): WeeklySummary {
  const progress = weeklyProgress(today, days);
  const week = new Set(weekDates(today));
  return {
    rows: ROTATION_CATEGORIES.map((category) => {
      const { done, quota } = progress[category];
      return { category, done, quota, complete: done >= quota };
    }),
    capritxos: days.filter(
      (d) => week.has(d.date) && d.dinner?.status === 'confirmed' && d.dinner.category === 'capritx',
    ).length,
  };
}
