import { describe, expect, it } from 'vitest';
import { BASE_RECIPES } from './baseRecipes';
import type { Category } from './categories';
import { buildSwipeDeck } from './swipeDeck';
import type { DayRecord, Dish } from './types';

const MON = '2026-09-28';
const TUE = '2026-09-29';
const dishes = [...BASE_RECIPES];
const byId = (id: string) => dishes.find((d) => d.id === id)!;
const settings = { capritxMarginDays: 7 };

function ate(date: string, dish: Dish, lunch?: DayRecord['lunch']): DayRecord {
  return {
    date,
    ...(lunch ? { lunch } : {}),
    dinner: { status: 'confirmed', dishId: dish.id, dishName: dish.name, category: dish.category },
  };
}

function categoriesOf(deck: ReturnType<typeof buildSwipeDeck>) {
  return deck.map((c) => c.dish.category);
}

function firstIndexOf(deck: ReturnType<typeof buildSwipeDeck>, category: Category) {
  return categoriesOf(deck).indexOf(category);
}

describe('buildSwipeDeck', () => {
  it('no inclou el plat que ja proposa la pantalla Avui', () => {
    const deck = buildSwipeDeck({ date: MON, today: MON, days: [], dishes, settings });
    expect(deck.map((c) => c.dish.id)).not.toContain('base-sardines-forn');
  });

  it('amaga la categoria del dinar i la del sopar d’ahir', () => {
    const days = [ate('2026-09-27', byId('base-llenties-verdures')), { date: MON, lunch: 'peix' } as DayRecord];
    const deck = buildSwipeDeck({ date: MON, today: MON, days, dishes, settings });
    expect(categoriesOf(deck)).not.toContain('peix');
    expect(categoriesOf(deck)).not.toContain('llegum');
  });

  it('primer les categories pendents, començant per les que en falten més', () => {
    // Setmana amb carn i vegetarià ja fets: pendents peix 2, ou 2, llegum 1
    const days = [ate(MON, byId('base-pollastre-planxa')), ate(TUE, byId('base-crema-carbasso'))];
    const deck = buildSwipeDeck({ date: '2026-09-30', today: '2026-09-30', days, dishes, settings });
    const firstFive = categoriesOf(deck).slice(0, 5);
    expect(new Set(firstFive.slice(0, 2))).toEqual(new Set(['peix', 'ou']));
    expect(firstFive).toContain('llegum');
    expect(firstIndexOf(deck, 'carn')).toBeGreaterThan(firstIndexOf(deck, 'llegum'));
    expect(categoriesOf(deck)).not.toContain('vegetaria'); // sopar d'ahir
  });

  it('en cas d’empat, la categoria del plat rebutjat va després de les altres', () => {
    // Dilluns: la proposta és peix; peix i ou tenen 2 pendents cadascun
    const deck = buildSwipeDeck({ date: MON, today: MON, days: [], dishes, settings });
    expect(deck[0].dish.category).toBe('ou');
    expect(categoriesOf(deck)).toContain('peix');
  });

  it('alterna categories perquè no surtin tots els plats d’una categoria seguits', () => {
    const deck = buildSwipeDeck({ date: MON, today: MON, days: [], dishes, settings });
    const cats = categoriesOf(deck).filter((c) => c !== 'capritx');
    expect(cats[0]).not.toBe(cats[1]);
  });

  it('dins d’una categoria, els plats propis van primer', () => {
    const mine: Dish = {
      id: 'u1',
      name: 'Truita de carbassó',
      category: 'ou',
      ingredients: [],
      prepMinutes: 20,
      source: 'user',
    };
    const deck = buildSwipeDeck({ date: MON, today: MON, days: [], dishes: [...dishes, mine], settings });
    const ou = deck.filter((c) => c.dish.category === 'ou').map((c) => c.dish.id);
    expect(ou[0]).toBe('u1');
  });

  it('els capritxos van al final i es marquen com a no recomanats', () => {
    const deck = buildSwipeDeck({ date: MON, today: MON, days: [], dishes, settings });
    const capritxos = deck.filter((c) => c.capritx);
    expect(capritxos.map((c) => c.dish.name)).toEqual(['Pizza casolana', 'Croquetes casolanes', 'Fora de casa']);
    expect(deck.slice(-3)).toEqual(capritxos);
    deck.filter((c) => !c.capritx).forEach((c) => expect(c.dish.category).not.toBe('capritx'));
  });

  it('avisa si l’últim capritx és dins del marge', () => {
    const days = [ate('2026-09-24', byId('base-pizza-casolana'))];
    const deck = buildSwipeDeck({ date: MON, today: MON, days, dishes, settings });
    expect(deck.find((c) => c.capritx)?.capritxWarning).toEqual({ daysSince: 4, marginDays: 7 });
  });

  it('no avisa si l’últim capritx queda fora del marge', () => {
    const days = [ate('2026-09-20', byId('base-fora-de-casa'))];
    const deck = buildSwipeDeck({ date: MON, today: MON, days, dishes, settings });
    expect(deck.find((c) => c.capritx)?.capritxWarning).toBeNull();
  });

  it('per a ahir, usa el dinar d’ahir i el sopar d’abans-d’ahir', () => {
    const days: DayRecord[] = [
      ate('2026-09-26', byId('base-truita-patata')),
      { date: '2026-09-27', lunch: 'carn' },
    ];
    const deck = buildSwipeDeck({ date: '2026-09-27', today: MON, days, dishes, settings });
    expect(categoriesOf(deck)).not.toContain('ou');
    expect(categoriesOf(deck)).not.toContain('carn');
  });
});
