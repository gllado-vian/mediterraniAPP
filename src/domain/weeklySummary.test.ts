import { describe, expect, it } from 'vitest';
import { BASE_RECIPES } from './baseRecipes';
import type { Category } from './categories';
import type { DayRecord, Dish } from './types';
import { weeklySummary } from './weeklySummary';

// Setmana de proves: dilluns 28/09/2026 → diumenge 04/10/2026
const THU = '2026-10-01';

const firstOf = (cat: Category) => BASE_RECIPES.find((d) => d.category === cat)!;

function ate(date: string, dish: Dish): DayRecord {
  return {
    date,
    dinner: { status: 'confirmed', dishId: dish.id, dishName: dish.name, category: dish.category },
  };
}

describe('weeklySummary', () => {
  it('dona una fila per categoria, en l’ordre de l’especificació', () => {
    const { rows } = weeklySummary(THU, []);
    expect(rows.map((r) => r.category)).toEqual(['peix', 'ou', 'llegum', 'carn', 'vegetaria']);
    expect(rows[0]).toEqual({ category: 'peix', done: 0, quota: 2, complete: false });
  });

  it('marca complerta la categoria que arriba (o passa) de la quota', () => {
    const days = [
      ate('2026-09-28', firstOf('llegum')),
      ate('2026-09-29', firstOf('peix')),
      ate('2026-09-30', firstOf('peix')),
      ate('2026-10-01', firstOf('peix')),
    ];
    const byCat = Object.fromEntries(weeklySummary(THU, days).rows.map((r) => [r.category, r]));
    expect(byCat.llegum).toMatchObject({ done: 1, complete: true });
    expect(byCat.peix).toMatchObject({ done: 3, quota: 2, complete: true });
    expect(byCat.ou).toMatchObject({ done: 0, complete: false });
  });

  it('compta els capritxos de la setmana a part', () => {
    const days = [
      ate('2026-09-27', firstOf('capritx')), // setmana anterior: no compta
      ate('2026-09-28', firstOf('capritx')),
      ate('2026-09-30', firstOf('capritx')),
      { date: '2026-09-29', dinner: { status: 'unknown' } } as DayRecord,
    ];
    expect(weeklySummary(THU, days).capritxos).toBe(2);
  });
});
