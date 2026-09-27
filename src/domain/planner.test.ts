import { describe, expect, it } from 'vitest';
import { BASE_RECIPES } from './baseRecipes';
import { DEFAULT_CATEGORIES, type Category, type CategoryDef, type LunchOption, type RotationCategory } from './categories';
import { planWeek, proposeTonight, weeklyProgress, type WeekSlot } from './planner';
import { addDays } from './dates';
import type { DayRecord, Dish } from './types';

// Setmana de proves: dilluns 28/09/2026 → diumenge 04/10/2026
const MON = '2026-09-28';
const TUE = '2026-09-29';
const WED = '2026-09-30';
const THU = '2026-10-01';
const FRI = '2026-10-02';
const SAT = '2026-10-03';
const SUN = '2026-10-04';

const dishes = [...BASE_RECIPES];
const byId = (id: string) => dishes.find((d) => d.id === id)!;
const firstOf = (cat: Category) => dishes.find((d) => d.category === cat)!;

function ate(date: string, dish: Dish, lunch?: LunchOption): DayRecord {
  return {
    date,
    ...(lunch ? { lunch } : {}),
    dinner: { status: 'confirmed', dishId: dish.id, dishName: dish.name, category: dish.category },
  };
}

function plannedCategories(slots: WeekSlot[]) {
  return slots.filter((s) => s.status === 'planned').map((s) => s.category);
}

function allCategories(slots: WeekSlot[]) {
  return slots.map((s) => ('category' in s ? s.category : null));
}

function countOf(list: (Category | null)[]) {
  const out: Partial<Record<Category, number>> = {};
  list.forEach((c) => c && (out[c] = (out[c] ?? 0) + 1));
  return out;
}

function expectNoConsecutiveRepeats(list: (Category | null)[]) {
  list.forEach((c, i) => {
    if (i > 0 && c) expect(c, `dia ${i}`).not.toBe(list[i - 1]);
  });
}

describe('planWeek', () => {
  it('amb l’historial buit cobreix exactament les quotes de la setmana', () => {
    const slots = planWeek({ today: MON, days: [], dishes });
    expect(slots.map((s) => s.date)).toEqual([MON, TUE, WED, THU, FRI, SAT, SUN]);
    expect(countOf(plannedCategories(slots))).toEqual({ peix: 2, ou: 2, llegum: 1, carn: 1, vegetaria: 1 });
    expectNoConsecutiveRepeats(plannedCategories(slots));
  });

  it('mai proposa capritxos', () => {
    const slots = planWeek({ today: MON, days: [], dishes });
    expect(plannedCategories(slots)).not.toContain('capritx');
  });

  it('els sopars confirmats redueixen les quotes pendents', () => {
    const days = [ate(MON, firstOf('peix')), ate(TUE, firstOf('llegum'))];
    const slots = planWeek({ today: WED, days, dishes });
    expect(slots[0]).toMatchObject({ status: 'confirmed', category: 'peix' });
    expect(slots[1]).toMatchObject({ status: 'confirmed', category: 'llegum' });
    expect(countOf(plannedCategories(slots))).toEqual({ peix: 1, ou: 2, carn: 1, vegetaria: 1 });
    expectNoConsecutiveRepeats(allCategories(slots));
  });

  it('els capritxos i els dies no recordats no computen', () => {
    const days: DayRecord[] = [
      ate(MON, byId('base-pizza-casolana')),
      { date: TUE, dinner: { status: 'unknown' } },
    ];
    const slots = planWeek({ today: WED, days, dishes });
    expect(slots[0]).toMatchObject({ status: 'confirmed', category: 'capritx' });
    expect(slots[1]).toMatchObject({ status: 'unknown' });
    // 5 dies per a 7 quotes: s'omplen 5 sense repetir seguides
    expect(plannedCategories(slots)).toHaveLength(5);
    expectNoConsecutiveRepeats(plannedCategories(slots));
  });

  it('un dia passat sense res queda buit', () => {
    const slots = planWeek({ today: WED, days: [], dishes });
    expect(slots[0]).toEqual({ date: MON, status: 'empty' });
  });

  it('no repeteix la categoria del sopar d’ahir, encara que sigui de la setmana anterior', () => {
    const slots = planWeek({ today: MON, days: [ate('2026-09-27', firstOf('peix'))], dishes });
    expect(slots[0]).toMatchObject({ status: 'planned' });
    expect((slots[0] as { category: RotationCategory }).category).not.toBe('peix');
  });

  it('no repeteix la categoria del dinar d’avui', () => {
    const slots = planWeek({ today: MON, days: [{ date: MON, lunch: 'peix' }], dishes });
    expect((slots[0] as { category: RotationCategory }).category).not.toBe('peix');
    expect(countOf(plannedCategories(slots))).toEqual({ peix: 2, ou: 2, llegum: 1, carn: 1, vegetaria: 1 });
  });

  it('planifica endavant per evitar atzucacs (2 ous i 1 peix en 3 dies)', () => {
    const days = [
      ate(MON, byId('base-sardines-forn')),
      ate(TUE, byId('base-llenties-verdures')),
      ate(WED, byId('base-pollastre-planxa')),
      ate(THU, byId('base-crema-carbasso')),
    ];
    const slots = planWeek({ today: FRI, days, dishes });
    expect(plannedCategories(slots)).toEqual(['ou', 'peix', 'ou']);
  });

  it('si queden més quotes que dies, n’omple tantes com pot sense repetir seguides', () => {
    const days = [
      ate(MON, byId('base-llenties-verdures')),
      ate(TUE, byId('base-pollastre-planxa')),
      ate(WED, byId('base-crema-carbasso')),
      { date: THU, dinner: { status: 'unknown' } } as DayRecord,
      ate(FRI, byId('base-pizza-casolana')),
    ];
    const slots = planWeek({ today: SAT, days, dishes });
    const planned = plannedCategories(slots);
    expect(planned).toHaveLength(2);
    planned.forEach((c) => expect(['peix', 'ou']).toContain(c));
    expectNoConsecutiveRepeats(planned);
  });

  it('si cap categoria pendent és vàlida avui, proposa una categoria sobrant vàlida', () => {
    const days: DayRecord[] = [
      ate(MON, byId('base-sardines-forn')),
      ate(TUE, byId('base-truita-patata')),
      ate(WED, byId('base-llenties-verdures')),
      ate(THU, byId('base-revuelto-verdures')),
      ate(FRI, byId('base-pollastre-planxa')),
      ate(SAT, byId('base-crema-carbasso')),
      { date: SUN, lunch: 'peix' },
    ];
    const slots = planWeek({ today: SUN, days, dishes });
    const today = slots[6] as { category: RotationCategory };
    expect(today.category).not.toBe('peix');
    expect(today.category).not.toBe('vegetaria'); // sopar d'ahir
  });

  it('un sopar ja confirmat avui no es replanifica', () => {
    const slots = planWeek({ today: MON, days: [ate(MON, firstOf('ou'))], dishes });
    expect(slots[0]).toMatchObject({ status: 'confirmed', category: 'ou' });
    expect(countOf(plannedCategories(slots))).toEqual({ peix: 2, ou: 1, llegum: 1, carn: 1, vegetaria: 1 });
  });
});

describe('selecció de plat', () => {
  it('prioritza els plats propis de la casa sobre el recetari base', () => {
    const mine: Dish = {
      id: 'u1',
      name: 'Truita de carbassó',
      category: 'ou',
      ingredients: ['Ous'],
      prepMinutes: 20,
      source: 'user',
    };
    const slots = planWeek({ today: MON, days: [], dishes: [...dishes, mine] });
    const ouDishes = slots.filter((s) => s.status === 'planned' && s.category === 'ou');
    expect(ouDishes.map((s) => (s as { dish: Dish }).dish.id)).toContain('u1');
    expect((ouDishes[0] as { dish: Dish }).dish.id).toBe('u1');
  });

  it('dins del recetari base, primer els plats que fa més temps que no es mengen', () => {
    const days = [
      ate('2026-09-10', byId('base-sardines-forn')),
      ate('2026-09-12', byId('base-menestra-tonyina')),
      ate('2026-09-14', byId('base-salmo-forn')),
      // lluç mai menjat → primer; després sardines (fa més temps)
    ];
    const slots = planWeek({ today: MON, days, dishes });
    const peix = slots
      .filter((s) => s.status === 'planned' && s.category === 'peix')
      .map((s) => (s as { dish: Dish }).dish.id);
    expect(peix).toEqual(['base-lluc-espinacs', 'base-sardines-forn']);
  });

  it('no repeteix el mateix plat dins la setmana si hi ha alternativa', () => {
    const slots = planWeek({ today: MON, days: [], dishes });
    const ids = slots.filter((s) => s.status === 'planned').map((s) => (s as { dish: Dish }).dish.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('repeteix plat quan no hi ha alternativa a la categoria', () => {
    const onlyOneOu = dishes.filter((d) => d.id !== 'base-truita-patata');
    const slots = planWeek({ today: MON, days: [], dishes: onlyOneOu });
    const ou = slots.filter((s) => s.status === 'planned' && s.category === 'ou');
    expect(ou).toHaveLength(2);
    ou.forEach((s) => expect((s as { dish: Dish }).dish.id).toBe('base-revuelto-verdures'));
  });
});

describe('proposeTonight', () => {
  it('retorna el plat del dia planificat', () => {
    const result = proposeTonight({ today: MON, days: [], dishes });
    const slots = planWeek({ today: MON, days: [], dishes });
    expect(result).toMatchObject({ dish: (slots[0] as { dish: Dish }).dish, replacedForLunch: null });
  });

  it('indica quan s’ha substituït per culpa del dinar', () => {
    const base = proposeTonight({ today: MON, days: [], dishes })!;
    const result = proposeTonight({
      today: MON,
      days: [{ date: MON, lunch: base.category as LunchOption }],
      dishes,
    })!;
    expect(result.category).not.toBe(base.category);
    expect(result.replacedForLunch).toBe(base.category);
  });

  it('retorna null si el sopar d’avui ja està confirmat', () => {
    expect(proposeTonight({ today: MON, days: [ate(MON, firstOf('ou'))], dishes })).toBeNull();
  });
});

describe('weeklyProgress', () => {
  it('compta els sopars confirmats de la setmana per categoria', () => {
    const days = [
      ate('2026-09-27', firstOf('peix')), // setmana anterior: no compta
      ate(MON, firstOf('peix')),
      ate(TUE, byId('base-pizza-casolana')),
      ate(WED, firstOf('ou')),
    ];
    expect(weeklyProgress(THU, days)).toEqual({
      peix: { done: 1, quota: 2 },
      ou: { done: 1, quota: 2 },
      llegum: { done: 0, quota: 1 },
      carn: { done: 0, quota: 1 },
      vegetaria: { done: 0, quota: 1 },
    });
  });
});

describe('acceptació: 4 setmanes confirmant sempre la proposta', () => {
  it('compleix totes les quotes cada setmana sense repetir categoria seguida', () => {
    const history: DayRecord[] = [];
    let date = MON;
    for (let i = 0; i < 28; i++) {
      const proposal = proposeTonight({ today: date, days: history, dishes })!;
      history.push(ate(date, proposal.dish));
      date = addDays(date, 1);
    }
    for (let week = 0; week < 4; week++) {
      const sunday = addDays(MON, week * 7 + 6);
      Object.values(weeklyProgress(sunday, history)).forEach(({ done, quota }) =>
        expect(done).toBe(quota),
      );
    }
    expectNoConsecutiveRepeats(history.map((d) => (d.dinner as { category: Category }).category));
    expect(history.some((d) => (d.dinner as { category: Category }).category === 'capritx')).toBe(false);
  });
});

describe('categories variables', () => {
  const cats = (over: Partial<Record<string, number>>, extra: CategoryDef[] = []): CategoryDef[] => [
    ...DEFAULT_CATEGORIES.map((c) => ({ ...c, quota: over[c.id] ?? c.quota })),
    ...extra,
  ];
  const userDish = (id: string, category: string): Dish => ({
    id, name: id, category, ingredients: [], prepMinutes: 10, source: 'user',
  });

  it('amb les categories per defecte, el resultat és idèntic al d’abans', () => {
    const scenarios = [
      { today: MON, days: [] as DayRecord[] },
      { today: WED, days: [ate(MON, firstOf('peix')), ate(TUE, firstOf('llegum'), 'ou')] },
      { today: THU, days: [{ date: THU, lunch: 'peix' as LunchOption }] },
    ];
    scenarios.forEach(({ today, days }) => {
      expect(planWeek({ today, days, dishes, categories: DEFAULT_CATEGORIES })).toEqual(
        planWeek({ today, days, dishes }),
      );
    });
  });

  it('una categoria amb 0 vegades no es proposa mai', () => {
    const slots = planWeek({ today: MON, days: [], dishes, categories: cats({ carn: 0 }) });
    expect(plannedCategories(slots)).toHaveLength(7);
    expect(plannedCategories(slots)).not.toContain('carn');
  });

  it('si la suma és menor que 7, els dies que sobren són de categories amb vegades', () => {
    const slots = planWeek({
      today: MON, days: [], dishes, categories: cats({ llegum: 0, carn: 0, vegetaria: 0 }),
    });
    const planned = plannedCategories(slots);
    expect(planned).toHaveLength(7);
    expect(new Set(planned)).toEqual(new Set(['peix', 'ou']));
    expectNoConsecutiveRepeats(planned);
  });

  it('proposa una categoria pròpia tantes vegades com se li demana', () => {
    const pasta: CategoryDef = { id: 'c-pasta', name: 'Pasta', icon: 'bread', color: '#D98F4E', quota: 2 };
    const slots = planWeek({
      today: MON, days: [], dishes: [...dishes, userDish('macarrons', 'c-pasta')],
      categories: cats({ peix: 1, ou: 1 }, [pasta]),
    });
    expect(countOf(plannedCategories(slots))['c-pasta']).toBe(2);
  });

  it('una categoria sense cap plat no es proposa (i no peta)', () => {
    const buida: CategoryDef = { id: 'c-buida', name: 'Buida', icon: 'leaf', color: '#A395C2', quota: 1 };
    const slots = planWeek({ today: MON, days: [], dishes, categories: cats({ peix: 1 }, [buida]) });
    expect(plannedCategories(slots)).not.toContain('c-buida');
    expect(plannedCategories(slots)).toHaveLength(7);
  });

  it('amb una sola categoria, la repeteix cada dia', () => {
    const only = [{ ...DEFAULT_CATEGORIES[0], quota: 7 }];
    const slots = planWeek({ today: MON, days: [], dishes, categories: only });
    expect(plannedCategories(slots)).toEqual(Array(7).fill('peix'));
  });

  it('amb una sola categoria, la proposa encara que sigui la del dinar', () => {
    const only = [{ ...DEFAULT_CATEGORIES[0], quota: 7 }];
    const proposal = proposeTonight({ today: MON, days: [{ date: MON, lunch: 'peix' }], dishes, categories: only });
    expect(proposal?.category).toBe('peix');
  });

  it('si no hi ha res per proposar, no hi ha proposta', () => {
    const none = cats({ peix: 0, ou: 0, llegum: 0, carn: 0, vegetaria: 0 });
    expect(proposeTonight({ today: MON, days: [], dishes, categories: none })).toBeNull();
    expect(planWeek({ today: MON, days: [], dishes, categories: none }).every((s) => s.status === 'empty')).toBe(true);
  });

  it('un sopar d’una categoria esborrada a l’historial no compta ni peta', () => {
    const days: DayRecord[] = [
      { date: MON, dinner: { status: 'confirmed', dishId: 'x', dishName: 'Vell', category: 'c-vella' } },
    ];
    expect(() => planWeek({ today: TUE, days, dishes })).not.toThrow();
    expect(weeklyProgress(TUE, days)).not.toHaveProperty('c-vella');
  });

  it('acceptació: 4 setmanes amb 3 categories pròpies compleixen les vegades', () => {
    const own: CategoryDef[] = [
      { id: 'a', name: 'A', icon: 'leaf', color: '#A395C2', quota: 3 },
      { id: 'b', name: 'B', icon: 'salad', color: '#6FA89A', quota: 2 },
      { id: 'c', name: 'C', icon: 'bread', color: '#D98F4E', quota: 2 },
    ];
    const ownDishes = ['a', 'b', 'c'].flatMap((c) => [userDish(`${c}1`, c), userDish(`${c}2`, c)]);
    const history: DayRecord[] = [];
    let date = MON;
    for (let i = 0; i < 28; i++) {
      const proposal = proposeTonight({ today: date, days: history, dishes: ownDishes, categories: own })!;
      history.push(ate(date, proposal.dish));
      date = addDays(date, 1);
    }
    for (let week = 0; week < 4; week++) {
      const progress = weeklyProgress(addDays(MON, week * 7 + 6), history, own);
      Object.values(progress).forEach(({ done, quota }) => expect(done).toBe(quota));
    }
    expectNoConsecutiveRepeats(history.map((d) => (d.dinner as { category: Category }).category));
  });

  it('amb 200 configuracions a l’atzar mai peta i sempre proposa una categoria vàlida', () => {
    let seed = 7;
    const rnd = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed % n;
    };
    const palette = ['#6E93A8', '#F2C166', '#6B6E3D', '#BF8275', '#BCBF69', '#A395C2', '#6FA89A', '#D98F4E', '#6B4A6E'];
    for (let run = 0; run < 200; run++) {
      const n = 1 + rnd(9);
      let left = 7;
      const list: CategoryDef[] = Array.from({ length: n }, (_, i) => {
        const quota = rnd(Math.min(left, 3) + 1);
        left -= quota;
        return { id: `k${i}`, name: `K${i}`, icon: 'leaf', color: palette[i], quota };
      });
      const pool = list.filter(() => rnd(4) > 0).map((c, i) => userDish(`d${i}`, c.id));
      const today = addDays(MON, rnd(7));
      const days: DayRecord[] = [];
      if (pool.length && rnd(2)) days.push(ate(addDays(today, -1), pool[rnd(pool.length)]));
      if (rnd(2)) days.push({ date: today, lunch: list[rnd(n)].id });
      const proposal = proposeTonight({ today, days, dishes: pool, categories: list });
      const plannable = list.filter((c) => c.quota > 0 && pool.some((d) => d.category === c.id)).map((c) => c.id);
      if (plannable.length === 0) expect(proposal).toBeNull();
      else expect(plannable).toContain(proposal?.category);
    }
  });
});

