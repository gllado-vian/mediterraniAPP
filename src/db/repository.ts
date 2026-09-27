import {
  activeCategories,
  CAPRITX_ID,
  DEFAULT_CATEGORIES,
  type CategoryDef,
  type CategoryId,
  type LunchOption,
} from '../domain/categories';
import { validateCategoryInput, validateCategoryList, type CategoryInput } from '../domain/categoryRules';
import type { DayRecord, Dish, House, IsoDate, NewDish, Settings } from '../domain/types';
import type { AppDb } from './db';

export type DishField = 'name' | 'category' | 'prepMinutes';

export class DishValidationError extends Error {
  constructor(
    message: string,
    /** Camp del formulari on cal ensenyar l'error. */
    readonly field: DishField,
  ) {
    super(message);
  }
}

/** No es pot esborrar una categoria (o tornar a les recomanades) mentre hi hagi plats propis. */
export class CategoryInUseError extends Error {
  constructor(readonly count: number) {
    super(count === 1 ? 'Hi tens 1 plat propi.' : `Hi tens ${count} plats propis.`);
  }
}

const DEFAULT_SETTINGS: Settings = { capritxMarginDays: 7 };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertDate(date: IsoDate) {
  if (!ISO_DATE.test(date)) throw new Error(`Data invàlida: ${date}`);
}

/** Un plat propi pot anar a una categoria activa o al capritx. */
function isDishCategory(id: unknown, categories: readonly CategoryDef[]): boolean {
  return id === CAPRITX_ID || activeCategories(categories).some((c) => c.id === id);
}

function normalizeDish(input: NewDish, categories: readonly CategoryDef[]): NewDish {
  const name = input.name.trim();
  if (!name) throw new DishValidationError('Posa-li un nom al plat.', 'name');
  if (!isDishCategory(input.category, categories)) throw new DishValidationError('Tria una categoria.', 'category');
  const { prepMinutes } = input;
  if (prepMinutes !== null && !(Number.isInteger(prepMinutes) && prepMinutes > 0)) {
    throw new DishValidationError('El temps ha de ser un nombre de minuts més gran que 0.', 'prepMinutes');
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

  async function getCategories(): Promise<CategoryDef[]> {
    const stored = (await db.get('meta', 'categories')) as CategoryDef[] | undefined;
    return stored ? stored : [...DEFAULT_CATEGORIES];
  }

  async function saveCategories(list: CategoryDef[]): Promise<void> {
    validateCategoryList(list);
    await db.put('meta', list, 'categories');
  }

  async function userDishCount(ids: CategoryId[]): Promise<number> {
    const dishes = await db.getAll('dishes');
    return dishes.filter((d) => d.source === 'user' && ids.includes(d.category)).length;
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
      const dish: Dish = { ...normalizeDish(input, await getCategories()), id: crypto.randomUUID(), source: 'user' };
      await db.add('dishes', dish);
      return dish;
    },

    async updateUserDish(id: string, patch: Partial<NewDish>): Promise<Dish> {
      const current = await getUserDish(id);
      const dish: Dish = { ...current, ...normalizeDish({ ...current, ...patch }, await getCategories()) };
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

    getCategories,

    /** Crea una categoria; si n'hi ha una d'esborrada amb el mateix nom, la recupera (mateix id). */
    async addCategory(input: CategoryInput): Promise<CategoryDef> {
      const list = await getCategories();
      const name = input.name.trim().toLocaleLowerCase('ca');
      const archived = list.find((c) => c.archived && c.name.trim().toLocaleLowerCase('ca') === name);
      if (archived) {
        // Recuperar-la també suma una categoria activa: comprovem que hi càpiga.
        validateCategoryInput(input, list);
        const back: CategoryDef = { id: archived.id, ...validateCategoryInput(input, list, archived.id) };
        await saveCategories(list.map((c) => (c.id === archived.id ? back : c)));
        return back;
      }
      const created: CategoryDef = { id: `c-${crypto.randomUUID()}`, ...validateCategoryInput(input, list) };
      await saveCategories([...list, created]);
      return created;
    },

    async updateCategory(id: CategoryId, patch: Partial<CategoryInput>): Promise<CategoryDef> {
      const list = await getCategories();
      const current = list.find((c) => c.id === id && !c.archived);
      if (!current) throw new Error('Aquesta categoria no existeix.');
      const { archived: _archived, id: _id, ...fields } = current;
      const updated: CategoryDef = { id, ...validateCategoryInput({ ...fields, ...patch }, list, id) };
      await saveCategories(list.map((c) => (c.id === id ? updated : c)));
      return updated;
    },

    /** Esborra (arxiva) una categoria: en conserva nom, icona i color per a l'historial. */
    async archiveCategory(id: CategoryId): Promise<void> {
      if (id === CAPRITX_ID) throw new Error('El capritx no es pot esborrar.');
      const list = await getCategories();
      if (!list.some((c) => c.id === id && !c.archived)) throw new Error('Aquesta categoria no existeix.');
      const count = await userDishCount([id]);
      if (count > 0) throw new CategoryInUseError(count);
      await saveCategories(list.map((c) => (c.id === id ? { ...c, archived: true } : c)));
    },

    /** Torna a les recomanades; les pròpies queden esborrades (si no tenen plats). */
    async resetCategories(): Promise<void> {
      const list = await getCategories();
      const defaultIds = DEFAULT_CATEGORIES.map((c) => c.id);
      const own = list.filter((c) => !defaultIds.includes(c.id));
      const count = await userDishCount(own.filter((c) => !c.archived).map((c) => c.id));
      if (count > 0) throw new CategoryInUseError(count);
      await saveCategories([...DEFAULT_CATEGORIES, ...own.map((c) => ({ ...c, archived: true }))]);
    },

    /** Totes les dades de la casa (per fer-ne una còpia de seguretat). */
    async exportAll(): Promise<HouseData> {
      const [house, settings, dishes, days, categories] = await Promise.all([
        this.ensureHouse(),
        this.getSettings(),
        db.getAll('dishes'),
        db.getAll('days'),
        getCategories(),
      ]);
      return { house, settings, dishes, days, categories };
    },

    /**
     * Substitueix les dades de la casa per les d'una còpia, en una sola transacció:
     * si res falla, no es canvia res. El recetari base es conserva.
     */
    async replaceAll(data: HouseData): Promise<void> {
      const tx = db.transaction(['dishes', 'days', 'meta'], 'readwrite');
      const dishes = tx.objectStore('dishes');
      const days = tx.objectStore('days');
      const meta = tx.objectStore('meta');
      try {
        const current = await dishes.getAll();
        for (const dish of current) if (dish.source === 'user') await dishes.delete(dish.id);
        for (const dish of data.dishes) if (dish.source === 'user') await dishes.put(dish);
        await days.clear();
        for (const day of data.days) await days.put(day);
        await meta.put(data.house, 'house');
        await meta.put(data.settings, 'settings');
        await meta.put(data.categories, 'categories');
      } catch (error) {
        tx.abort();
        await tx.done.catch(() => {});
        throw error;
      }
      await tx.done;
    },
  };
}

export type Repository = ReturnType<typeof createRepository>;

export interface HouseData {
  house: House;
  settings: Settings;
  dishes: Dish[];
  days: DayRecord[];
  categories: CategoryDef[];
}
