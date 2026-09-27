import { activeCategories, CAPRITX_ID, DEFAULT_CATEGORIES, type CategoryDef, type RotationCategory } from './categories';
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

/** Una fila per categoria activa amb vegades (les de 0 no es volen), més els capritxos a part. */
export function weeklySummary(
  today: IsoDate,
  days: DayRecord[],
  categories: readonly CategoryDef[] = DEFAULT_CATEGORIES,
): WeeklySummary {
  const progress = weeklyProgress(today, days, categories);
  const week = new Set(weekDates(today));
  return {
    rows: activeCategories(categories)
      .filter((c) => c.quota > 0)
      .map(({ id: category }) => {
        const { done, quota } = progress[category];
        return { category, done, quota, complete: done >= quota };
      }),
    capritxos: days.filter(
      (d) => week.has(d.date) && d.dinner?.status === 'confirmed' && d.dinner.category === CAPRITX_ID,
    ).length,
  };
}
