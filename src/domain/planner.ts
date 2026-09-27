import {
  activeCategories,
  DEFAULT_CATEGORIES,
  LUNCH_OTHER,
  type Category,
  type CategoryDef,
  type CategoryId,
  type RotationCategory,
} from './categories';
import { addDays, weekDates } from './dates';
import type { DayRecord, Dish, IsoDate } from './types';

export interface PlannerInput {
  today: IsoDate;
  /** Historial de dies (pot incloure setmanes anteriors per saber l'últim cop de cada plat). */
  days: DayRecord[];
  dishes: Dish[];
  /** Categories de la casa (per defecte, les recomanades). */
  categories?: readonly CategoryDef[];
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

/** Sopars fets i vegades de cada categoria activa, en l'ordre de la llista. */
export function weeklyProgress(
  today: IsoDate,
  days: DayRecord[],
  categories: readonly CategoryDef[] = DEFAULT_CATEGORIES,
): WeeklyProgress {
  const week = new Set(weekDates(today));
  const progress: WeeklyProgress = Object.fromEntries(
    activeCategories(categories).map((c) => [c.id, { done: 0, quota: c.quota }]),
  );
  days.forEach((day) => {
    const category = confirmedCategory(day);
    if (category && week.has(day.date) && progress[category]) progress[category].done++;
  });
  return progress;
}

/**
 * Categories que es poden planificar: actives, amb vegades i amb almenys un plat.
 * (Una categoria sense plats no es pot proposar; amb 0 vegades, no es vol.)
 */
function plannableIds(categories: readonly CategoryDef[], dishes: Dish[]): CategoryId[] {
  return activeCategories(categories)
    .filter((c) => c.quota > 0 && dishes.some((d) => d.category === c.id))
    .map((c) => c.id);
}

/**
 * Tria la seqüència de categories per als dies restants.
 * Prioritat: 1) no repetir el dinar d'avui, 2) no repetir el sopar d'ahir,
 * 3) omplir el màxim de quotes (planificant endavant). Si cap categoria compleix
 * les regles (p. ex. amb una sola categoria), es relaxa primer la 2 i després la 1.
 */
function planCategories(
  slotCount: number,
  ids: readonly CategoryId[],
  pending: Pending,
  lunchForbidden: ReadonlySet<Category>,
  yesterdayCategory: Category | null,
): RotationCategory[] {
  const memo = new Map<string, number>();
  const extraOrder = [...EXTRA_ORDER.filter((c) => ids.includes(c)), ...ids.filter((c) => !EXTRA_ORDER.includes(c))];

  function options(i: number, prev: Category | null): CategoryId[] {
    const strict = ids.filter(
      (c) => c !== prev && (i > 0 || (!lunchForbidden.has(c) && c !== yesterdayCategory)),
    );
    if (strict.length > 0) return strict;
    const withoutRepeatRule = ids.filter((c) => i > 0 || !lunchForbidden.has(c));
    return withoutRepeatRule.length > 0 ? withoutRepeatRule : [...ids];
  }

  function candidateOrder(p: Pending): RotationCategory[] {
    const open = ids.filter((c) => p[c] > 0).sort((a, b) => p[b] - p[a]);
    return [...open, ...extraOrder.filter((c) => p[c] === 0)];
  }

  function maxFill(i: number, prev: Category | null, p: Pending): number {
    if (i === slotCount) return 0;
    const key = `${i}|${prev}|${ids.map((c) => p[c]).join(',')}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;
    let best = 0;
    for (const c of options(i, prev)) {
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
    const allowed = options(i, prev);
    const choice =
      candidateOrder(p).find((c) => {
        if (!allowed.includes(c)) return false;
        const gain = p[c] > 0 ? 1 : 0;
        return gain + maxFill(i + 1, c, { ...p, [c]: p[c] - gain }) === target;
      }) ?? allowed[0];
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

export function planWeek({ today, days, dishes, categories = DEFAULT_CATEGORIES }: PlannerInput): WeekSlot[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const dates = weekDates(today);
  const ids = plannableIds(categories, dishes);
  const progress = weeklyProgress(today, days, categories);
  const pending: Pending = Object.fromEntries(
    ids.map((c) => [c, Math.max(0, progress[c].quota - progress[c].done)]),
  );

  const todayRecord = byDate.get(today);
  // Sense cap categoria planificable no hi ha res a proposar: els dies oberts queden en blanc.
  const openDates =
    ids.length === 0
      ? []
      : dates.filter((date) => (date === today ? !confirmedCategory(todayRecord) : date > today));

  const lunchForbidden = new Set<Category>();
  if (openDates[0] === today) {
    const lunch = todayRecord?.lunch;
    if (lunch && lunch !== LUNCH_OTHER) lunchForbidden.add(lunch);
  }
  const dayBeforeFirst = openDates.length > 0 ? addDays(openDates[0], -1) : null;
  const yesterdayCategory = dayBeforeFirst ? confirmedCategory(byDate.get(dayBeforeFirst)) : null;

  const plannedCategories = planCategories(openDates.length, ids, pending, lunchForbidden, yesterdayCategory);

  const lastUse = lastEatenById(days);
  const usedThisWeek = new Set(
    dates
      .map((date) => byDate.get(date)?.dinner)
      .flatMap((dinner) => (dinner?.status === 'confirmed' ? [dinner.dishId] : [])),
  );
  const planned = new Map<IsoDate, { category: RotationCategory; dish: Dish }>();
  openDates.forEach((date, i) => {
    const dish = pickDish(plannedCategories[i], dishes, lastUse, usedThisWeek);
    usedThisWeek.add(dish.id);
    lastUse.set(dish.id, date);
    planned.set(date, { category: plannedCategories[i], dish });
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
  if (lunch && lunch !== LUNCH_OTHER) {
    const withoutLunch = input.days.map((d) =>
      d.date === input.today ? { ...d, lunch: undefined } : d,
    );
    const original = planWeek({ ...input, days: withoutLunch }).find((s) => s.date === input.today);
    if (original?.status === 'planned' && original.category === lunch) replacedForLunch = lunch;
  }
  return { dish: slot.dish, category: slot.category, replacedForLunch };
}
