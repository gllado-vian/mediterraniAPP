import { describe, expect, it } from 'vitest';
import type { DayRecord } from './types';
import { dishStats } from './dishStats';

function ate(date: string, dishId: string): DayRecord {
  return { date, dinner: { status: 'confirmed', dishId, dishName: dishId, category: 'peix' } };
}

describe('dishStats', () => {
  it('un plat que no s’ha fet mai', () => {
    expect(dishStats('sardines', '2026-10-15', [])).toEqual({ daysSince: null, timesThisMonth: 0 });
  });

  it('compta els dies des de l’últim cop i els cops del mes natural', () => {
    const days = [
      ate('2026-09-28', 'sardines'), // mes anterior
      ate('2026-10-03', 'sardines'),
      ate('2026-10-10', 'sardines'),
      ate('2026-10-12', 'truita'),
      { date: '2026-10-13', dinner: { status: 'unknown' } } as DayRecord,
    ];
    expect(dishStats('sardines', '2026-10-15', days)).toEqual({ daysSince: 5, timesThisMonth: 2 });
  });

  it('no té en compte els dies posteriors a la data', () => {
    const days = [ate('2026-10-10', 'sardines'), ate('2026-10-20', 'sardines')];
    expect(dishStats('sardines', '2026-10-15', days)).toEqual({ daysSince: 5, timesThisMonth: 1 });
  });

  it('si s’ha sopat el mateix dia, fa 0 dies', () => {
    expect(dishStats('sardines', '2026-10-15', [ate('2026-10-15', 'sardines')]).daysSince).toBe(0);
  });
});
