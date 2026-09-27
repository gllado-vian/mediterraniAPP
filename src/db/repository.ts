import { isCategory, type LunchOption } from '../domain/categories';
import type { DayRecord, Dish, House, IsoDate, NewDish, Settings } from '../domain/types';
import type { AppDb } from './db';

export class DishValidationError extends Error {}

const DEFAULT_SETTINGS: Settings = { capritxMarginDays: 7 };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertDate(date: IsoDate) {
  if (!ISO_DATE.test(date)) throw new Error(`Data invàlida: ${date}`);
}

function normalizeDish(input: NewDish): NewDish {
  const name = input.name.trim();
  if (!name) throw new DishValidationError('Posa-li un nom al plat.');
  if (!isCategory(input.category)) throw new DishValidationError('Tria una categoria.');
  const { prepMinutes } = input;
  if (prepMinutes !== null && !(Number.isInteger(prepMinutes) && prepMinutes > 0)) {
    throw new DishValidationError('El temps ha de ser un nombre de minuts més gran que 0.');
  }
  const ingredients = input.ingredients.map((i) => i.trim()).filter(Boolean);
  return { name, category: input.category, ingredients, prepMinutes };
}

export function createRepository(db: AppDb) {
  async function getUserDish(id: string): Promise<Dish> {
    const dish = await db.get('dishes', id);
    if (!dish) throw new Error('Aquest plat no existeix.');
    if (dish.source !== 'user') throw new Error('Els plats del recetari base no es poden modificar.');
    return dish;
  }

  async function updateDay(date: IsoDate, change: (day: DayRecord) => DayRecord) {
    assertDate(date);
    const tx = db.transaction('days', 'readwrite');
    const current = (await tx.store.get(date)) ?? { date };
    await tx.store.put(change(current));
    await tx.done;
  }

  return {
    async ensureHouse(createdAt = new Date()): Promise<House> {
      const existing = (await db.get('meta', 'house')) as House | undefined;
      if (existing) return existing;
      const house: House = { id: crypto.randomUUID(), createdAt: createdAt.toISOString() };
      await db.put('meta', house, 'house');
      return house;
    },

    async getSettings(): Promise<Settings> {
      const stored = (await db.get('meta', 'settings')) as Settings | undefined;
      return { ...DEFAULT_SETTINGS, ...stored };
    },

    async updateSettings(patch: Partial<Settings>): Promise<Settings> {
      const next = { ...(await this.getSettings()), ...patch };
      if (!Number.isInteger(next.capritxMarginDays) || next.capritxMarginDays < 0) {
        throw new Error('El marge ha de ser un nombre de dies enter.');
      }
      await db.put('meta', next, 'settings');
      return next;
    },

    listDishes(): Promise<Dish[]> {
      return db.getAll('dishes');
    },

    getDish(id: string): Promise<Dish | undefined> {
      return db.get('dishes', id);
    },

    async putBaseDishes(dishes: Dish[]): Promise<void> {
      const tx = db.transaction('dishes', 'readwrite');
      await Promise.all(dishes.map((d) => tx.store.put({ ...d, source: 'base' })));
      await tx.done;
    },

    async addUserDish(input: NewDish): Promise<Dish> {
      const dish: Dish = { ...normalizeDish(input), id: crypto.randomUUID(), source: 'user' };
      await db.add('dishes', dish);
      return dish;
    },

    async updateUserDish(id: string, patch: Partial<NewDish>): Promise<Dish> {
      const current = await getUserDish(id);
      const dish: Dish = { ...current, ...normalizeDish({ ...current, ...patch }) };
      await db.put('dishes', dish);
      return dish;
    },

    async deleteUserDish(id: string): Promise<void> {
      await getUserDish(id);
      await db.delete('dishes', id);
    },

    getDay(date: IsoDate): Promise<DayRecord | undefined> {
      return db.get('days', date);
    },

    async listDays(from: IsoDate, to: IsoDate): Promise<DayRecord[]> {
      assertDate(from);
      assertDate(to);
      return db.getAll('days', IDBKeyRange.bound(from, to));
    },

    listAllDays(): Promise<DayRecord[]> {
      return db.getAll('days');
    },

    setLunch(date: IsoDate, lunch: LunchOption | null): Promise<void> {
      return updateDay(date, ({ lunch: _old, ...day }) => (lunch ? { ...day, lunch } : day));
    },

    confirmDinner(date: IsoDate, dish: Dish): Promise<void> {
      return updateDay(date, (day) => ({
        ...day,
        dinner: {
          status: 'confirmed',
          dishId: dish.id,
          dishName: dish.name,
          category: dish.category,
        },
      }));
    },

    clearDinner(date: IsoDate): Promise<void> {
      return updateDay(date, ({ dinner: _old, ...day }) => day);
    },

    markDinnerUnknown(date: IsoDate): Promise<void> {
      return updateDay(date, (day) => ({ ...day, dinner: { status: 'unknown' } }));
    },
  };
}

export type Repository = ReturnType<typeof createRepository>;
