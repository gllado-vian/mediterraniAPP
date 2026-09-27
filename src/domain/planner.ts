import {
  ROTATION_CATEGORIES,
  WEEKLY_QUOTAS,
  isRotationCategory,
  type Category,
  type RotationCategory,
} from './categories';
import { addDays, weekDates } from './dates';
import type { DayRecord, Dish, IsoDate } from './types';

export interface PlannerInput {
  today: IsoDate;
  /** Historial de dies (pot incloure setmanes anteriors per saber l'últim cop de cada plat). */
  days: DayRecord[];
  dishes: Dish[];
}

export type WeekSlot =
  | { date: IsoDate; status: 'confirmed'; category: Category; dishId: string; dishName: string }
  | { date: IsoDate; status: 'unknown' | 'empty' }
  | { date: IsoDate; status: 'planned'; category: RotationCategory; dish: Dish };

export type WeeklyProgress = Record<RotationCategory, { done: number; quota: number }>;

/** Categories per als dies sobrants (quotes ja complertes): les més lleugeres primer. */
const EXTRA_ORDER: readonly RotationCategory[] = ['vegetaria', 'llegum', 'peix', 'ou', 'carn'];

type Pending = Record<RotationCategory, number>;

function confirmedCategory(day: DayRecord | undefined): Category | null {
  return day?.dinner?.status === 'confirmed' ? day.dinner.category : null;
}

export function weeklyProgress(today: IsoDate, days: DayRecord[]): WeeklyProgress {
  const week = new Set(weekDates(today));
  const progress = Object.fromEntries(
    ROTATION_CATEGORIES.map((c) => [c, { done: 0, quota: WEEKLY_QUOTAS[c] }]),
  ) as WeeklyProgress;
  days.forEach((day) => {
    const category = confirmedCategory(day);
    if (week.has(day.date) && isRotationCategory(category)) progress[category].done++;
  });
  return progress;
}

function candidateOrder(pending: Pending): RotationCategory[] {
  const open = ROTATION_CATEGORIES.filter((c) => pending[c] > 0).sort(
    (a, b) => pending[b] - pending[a],
  );
  return [...open, ...EXTRA_ORDER.filter((c) => pending[c] === 0)];
}

/**
 * Tria la seqüència de categories per als dies restants.
 * Prioritat: 1) no repetir el dinar d'avui, 2) no repetir el sopar d'ahir,
 * 3) omplir el màxim de quotes (planificant endavant).
 */
function planCategories(
  slotCount: number,
  pending: Pending,
  firstDayForbidden: Set<Category>,
): RotationCategory[] {
  const memo = new Map<string, number>();

  const allowed = (i: number, prev: Category | null, c: RotationCategory) =>
    c !== prev && (i > 0 || !firstDayForbidden.has(c));

  function maxFill(i: number, prev: Category | null, p: Pending): number {
    if (i === slotCount) return 0;
    const key = `${i}|${prev}|${ROTATION_CATEGORIES.map((c) => p[c]).join(',')}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let best = 0;
    for (const c of ROTATION_CATEGORIES) {
      if (!allowed(i, prev, c)) continue;
      const gain = p[c] > 0 ? 1 : 0;
      best = Math.max(best, gain + maxFill(i + 1, c, { ...p, [c]: p[c] - gain }));
    }
    memo.set(key, best);
    return best;
  }

  const sequence: RotationCategory[] = [];
  let prev: Category | null = null;
  let p = { ...pending };
  for (let i = 0; i < slotCount; i++) {
    const target = maxFill(i, prev, p);
    const choice = candidateOrder(p).find((c) => {
      if (!allowed(i, prev, c)) return false;
      const gain = p[c] > 0 ? 1 : 0;
      return gain + maxFill(i + 1, c, { ...p, [c]: p[c] - gain }) === target;
    })!;
    if (p[choice] > 0) p = { ...p, [choice]: p[choice] - 1 };
    sequence.push(choice);
    prev = choice;
  }
  return sequence;
}

function lastEatenById(days: DayRecord[]): Map<string, IsoDate> {
  const last = new Map<string, IsoDate>();
  days.forEach((day) => {
    if (day.dinner?.status !== 'confirmed') return;
    const prev = last.get(day.dinner.dishId);
    if (!prev || prev < day.date) last.set(day.dinner.dishId, day.date);
  });
  return last;
}

/**
 * Plats propis primer, després el recetari base; dins de cada grup, el que fa
 * més temps que no es menja. Evita repetir plat dins la setmana si hi ha alternativa.
 */
function pickDish(
  category: RotationCategory,
  dishes: Dish[],
  lastUse: Map<string, IsoDate>,
  usedThisWeek: Set<string>,
): Dish {
  const ofCategory = dishes.filter((d) => d.category === category);
  const fresh = ofCategory.filter((d) => !usedThisWeek.has(d.id));
  const pool = fresh.length > 0 ? fresh : ofCategory;
  const rank = (d: Dish) => (d.source === 'user' ? 0 : 1);
  return [...pool].sort(
    (a, b) => rank(a) - rank(b) || (lastUse.get(a.id) ?? '').localeCompare(lastUse.get(b.id) ?? ''),
  )[0];
}

export function planWeek({ today, days, dishes }: PlannerInput): WeekSlot[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const dates = weekDates(today);
  const progress = weeklyProgress(today, days);
  const pending = Object.fromEntries(
    ROTATION_CATEGORIES.map((c) => [c, Math.max(0, progress[c].quota - progress[c].done)]),
  ) as Pending;

  const todayRecord = byDate.get(today);
  const openDates = dates.filter((date) =>
    date === today ? !confirmedCategory(todayRecord) : date > today,
  );

  const firstDayForbidden = new Set<Category>();
  if (openDates[0] === today) {
    const lunch = todayRecord?.lunch;
    if (isRotationCategory(lunch)) firstDayForbidden.add(lunch);
  }
  const dayBeforeFirst = openDates.length > 0 ? addDays(openDates[0], -1) : null;
  const yesterdayCategory = dayBeforeFirst ? confirmedCategory(byDate.get(dayBeforeFirst)) : null;
  if (yesterdayCategory) firstDayForbidden.add(yesterdayCategory);

  const categories = planCategories(openDates.length, pending, firstDayForbidden);

  const lastUse = lastEatenById(days);
  const usedThisWeek = new Set(
    dates
      .map((date) => byDate.get(date)?.dinner)
      .flatMap((dinner) => (dinner?.status === 'confirmed' ? [dinner.dishId] : [])),
  );
  const planned = new Map<IsoDate, { category: RotationCategory; dish: Dish }>();
  openDates.forEach((date, i) => {
    const dish = pickDish(categories[i], dishes, lastUse, usedThisWeek);
    usedThisWeek.add(dish.id);
    lastUse.set(dish.id, date);
    planned.set(date, { category: categories[i], dish });
  });

  return dates.map((date): WeekSlot => {
    const plan = planned.get(date);
    if (plan) return { date, status: 'planned', ...plan };
    const dinner = byDate.get(date)?.dinner;
    if (dinner?.status === 'confirmed') {
      const { dishId, dishName, category } = dinner;
      return { date, status: 'confirmed', category, dishId, dishName };
    }
    return { date, status: dinner?.status === 'unknown' ? 'unknown' : 'empty' };
  });
}

export interface TonightProposal {
  dish: Dish;
  category: RotationCategory;
  /** Categoria del dinar que ha obligat a canviar la proposta inicial, si n'hi ha. */
  replacedForLunch: RotationCategory | null;
}

export function proposeTonight(input: PlannerInput): TonightProposal | null {
  const slot = planWeek(input).find((s) => s.date === input.today);
  if (slot?.status !== 'planned') return null;

  const lunch = input.days.find((d) => d.date === input.today)?.lunch;
  let replacedForLunch: RotationCategory | null = null;
  if (isRotationCategory(lunch)) {
    const withoutLunch = input.days.map((d) =>
      d.date === input.today ? { ...d, lunch: undefined } : d,
    );
    const original = planWeek({ ...input, days: withoutLunch }).find((s) => s.date === input.today);
    if (original?.status === 'planned' && original.category === lunch) replacedForLunch = lunch;
  }
  return { dish: slot.dish, category: slot.category, replacedForLunch };
}
