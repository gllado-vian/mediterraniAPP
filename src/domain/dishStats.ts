import { daysBetween } from './dates';
import type { DayRecord, IsoDate } from './types';

export interface DishStats {
  /** Dies des de l'últim sopar amb aquest plat; null si no s'ha fet mai. */
  daysSince: number | null;
  /** Cops que s'ha sopat en el mes natural de `date`. */
  timesThisMonth: number;
}

export function dishStats(dishId: string, date: IsoDate, days: DayRecord[]): DishStats {
  const eaten = days
    .filter((d) => d.date <= date && d.dinner?.status === 'confirmed' && d.dinner.dishId === dishId)
    .map((d) => d.date);
  const last = eaten.reduce<IsoDate | null>((max, d) => (max === null || d > max ? d : max), null);
  const month = date.slice(0, 7);
  return {
    daysSince: last === null ? null : daysBetween(last, date),
    timesThisMonth: eaten.filter((d) => d.startsWith(month)).length,
  };
}
