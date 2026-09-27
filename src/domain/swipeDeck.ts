import { ROTATION_CATEGORIES, isRotationCategory, type Category, type RotationCategory } from './categories';
import { addDays, daysBetween } from './dates';
import { proposeTonight, weeklyProgress } from './planner';
import type { DayRecord, Dish, IsoDate, Settings } from './types';

export interface SwipeDeckInput {
  /** Dia per al qual es tria el sopar (avui, o ahir des de l'avís). */
  date: IsoDate;
  today: IsoDate;
  days: DayRecord[];
  dishes: Dish[];
  settings: Settings;
}

export interface SwipeCard {
  dish: Dish;
  capritx: boolean;
  /** Només als capritxos: avís si encara no s'ha complert el marge entre capritxos. */
  capritxWarning: { daysSince: number; marginDays: number } | null;
}

function confirmedDinner(day: DayRecord | undefined) {
  return day?.dinner?.status === 'confirmed' ? day.dinner : null;
}

function lastEatenById(days: DayRecord[], before: IsoDate): Map<string, IsoDate> {
  const last = new Map<string, IsoDate>();
  days.forEach((day) => {
    const dinner = confirmedDinner(day);
    if (!dinner || day.date >= before) return;
    const prev = last.get(dinner.dishId);
    if (!prev || prev < day.date) last.set(dinner.dishId, day.date);
  });
  return last;
}

/** Plats propis primer; dins de cada grup, el que fa més temps que no es menja. */
function sortWithinCategory(dishes: Dish[], lastEaten: Map<string, IsoDate>): Dish[] {
  const rank = (d: Dish) => (d.source === 'user' ? 0 : 1);
  return [...dishes].sort(
    (a, b) =>
      rank(a) - rank(b) ||
      (lastEaten.get(a.id) ?? '').localeCompare(lastEaten.get(b.id) ?? ''),
  );
}

/** Alterna categories: 1r plat de cada una, després el 2n de cada una… */
function roundRobin(groups: Dish[][]): Dish[] {
  const out: Dish[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < longest; i++) groups.forEach((g) => g[i] && out.push(g[i]));
  return out;
}

function capritxWarning(
  days: DayRecord[],
  date: IsoDate,
  marginDays: number,
): SwipeCard['capritxWarning'] {
  const last = days
    .filter((d) => d.date < date && confirmedDinner(d)?.category === 'capritx')
    .map((d) => d.date)
    .sort()
    .at(-1);
  if (!last) return null;
  const daysSince = daysBetween(last, date);
  return daysSince < marginDays ? { daysSince, marginDays } : null;
}

/**
 * Baralla del swipe: categories pendents (les que en falten més primer) →
 * categories ja complertes → capritxos al final. Les categories vetades
 * (dinar del dia i sopar del dia anterior) no hi surten.
 */
export function buildSwipeDeck({ date, days, dishes, settings }: SwipeDeckInput): SwipeCard[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const vetoed = new Set<Category>();
  const lunch = byDate.get(date)?.lunch;
  if (isRotationCategory(lunch)) vetoed.add(lunch);
  const dayBefore = confirmedDinner(byDate.get(addDays(date, -1)));
  if (dayBefore) vetoed.add(dayBefore.category);

  const proposal = proposeTonight({ today: date, days, dishes });
  const candidates = dishes.filter((d) => d.id !== proposal?.dish.id);
  const rejected = (c: Category) => (c === proposal?.category ? 1 : 0);
  const lastEaten = lastEatenById(days, date);

  const progress = weeklyProgress(date, days);
  const pending = (c: RotationCategory) => progress[c].quota - progress[c].done;
  const valid = ROTATION_CATEGORIES.filter((c) => !vetoed.has(c));
  // Les que en falten més primer; en cas d'empat, la del plat rebutjat va després.
  const open = valid
    .filter((c) => pending(c) > 0)
    .sort((a, b) => pending(b) - pending(a) || rejected(a) - rejected(b));
  const done = valid.filter((c) => pending(c) <= 0);

  const group = (c: Category) =>
    sortWithinCategory(candidates.filter((d) => d.category === c), lastEaten);

  const recommended = [...roundRobin(open.map(group)), ...roundRobin(done.map(group))].map(
    (dish): SwipeCard => ({ dish, capritx: false, capritxWarning: null }),
  );

  const warning = capritxWarning(days, date, settings.capritxMarginDays);
  const capritxos = candidates
    .filter((d) => d.category === 'capritx')
    .sort((a, b) => (a.source === 'user' ? 0 : 1) - (b.source === 'user' ? 0 : 1))
    .map((dish): SwipeCard => ({ dish, capritx: true, capritxWarning: warning }));

  return [...recommended, ...capritxos];
}
