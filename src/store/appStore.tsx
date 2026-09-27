import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import type { Repository } from '../db/repository';
import { buildBackup, type Backup } from '../domain/backup';
import { BASE_RECIPES, seedBaseRecipes } from '../domain/baseRecipes';
import { DEFAULT_CATEGORIES, type CategoryDef, type CategoryId, type LunchOption } from '../domain/categories';
import type { CategoryInput } from '../domain/categoryRules';
import { toIsoDate } from '../domain/dates';
import type { DayRecord, Dish, IsoDate, NewDish, Settings } from '../domain/types';

export interface AppState {
  status: 'loading' | 'ready';
  today: IsoDate;
  days: DayRecord[];
  dishes: Dish[];
  settings: Settings;
  /** Categories de la casa (també les esborrades, per a l'historial). */
  categories: CategoryDef[];
  /** Dia que es va crear la casa (instal·lació de l'app). */
  houseSince: IsoDate | null;
  load(): Promise<void>;
  /** Actualitza "avui" si ha canviat el dia (app oberta de nit). */
  syncToday(): void;
  confirmDinner(dish: Dish, date?: IsoDate): Promise<void>;
  undoDinner(date?: IsoDate): Promise<void>;
  setLunch(lunch: LunchOption | null): Promise<void>;
  markDinnerUnknown(date: IsoDate): Promise<void>;
  updateSettings(patch: Partial<Settings>): Promise<void>;
  addDish(input: NewDish): Promise<void>;
  updateDish(id: string, input: NewDish): Promise<void>;
  deleteDish(id: string): Promise<void>;
  addCategory(input: CategoryInput): Promise<void>;
  updateCategory(id: CategoryId, patch: Partial<CategoryInput>): Promise<void>;
  archiveCategory(id: CategoryId): Promise<void>;
  resetCategories(): Promise<void>;
  /** Còpia de seguretat de tota la casa. */
  exportBackup(): Promise<Backup>;
  /** Substitueix totes les dades per les d'una còpia (ja validada) i les torna a carregar. */
  importBackup(backup: Backup): Promise<void>;
}

export interface AppStoreDeps {
  repo: Repository;
  now?: () => Date;
}

export type AppStore = StoreApi<AppState>;

const BASE_ORDER = new Map(BASE_RECIPES.map((d, i) => [d.id, i]));

/** IndexedDB retorna per id; el generador desempata per l'ordre del recetari. */
function inRecipeOrder(dishes: Dish[]): Dish[] {
  const rank = (d: Dish) => BASE_ORDER.get(d.id) ?? Number.MAX_SAFE_INTEGER;
  return [...dishes].sort((a, b) => rank(a) - rank(b));
}

export function createAppStore({ repo, now = () => new Date() }: AppStoreDeps): AppStore {
  return createStore<AppState>((set, get) => {
    async function refreshDays() {
      set({ days: await repo.listAllDays() });
    }

    async function refreshCategories() {
      set({ categories: await repo.getCategories() });
    }

    async function refreshDishes() {
      set({ dishes: inRecipeOrder(await repo.listDishes()) });
    }

    return {
      status: 'loading',
      today: toIsoDate(now()),
      days: [],
      dishes: [],
      settings: { capritxMarginDays: 7 },
      categories: [...DEFAULT_CATEGORIES],
      houseSince: null,

      async load() {
        const house = await repo.ensureHouse(now());
        await seedBaseRecipes(repo);
        const [dishes, days, settings, categories] = await Promise.all([
          repo.listDishes(),
          repo.listAllDays(),
          repo.getSettings(),
          repo.getCategories(),
        ]);
        set({
          status: 'ready',
          today: toIsoDate(now()),
          houseSince: toIsoDate(new Date(house.createdAt)),
          dishes: inRecipeOrder(dishes),
          days,
          settings,
          categories,
        });
      },

      syncToday() {
        const today = toIsoDate(now());
        if (today !== get().today) set({ today });
      },

      async confirmDinner(dish, date = get().today) {
        await repo.confirmDinner(date, dish);
        await refreshDays();
      },

      async undoDinner(date = get().today) {
        await repo.clearDinner(date);
        await refreshDays();
      },

      async setLunch(lunch) {
        await repo.setLunch(get().today, lunch);
        await refreshDays();
      },

      async markDinnerUnknown(date) {
        await repo.markDinnerUnknown(date);
        await refreshDays();
      },

      async updateSettings(patch) {
        set({ settings: await repo.updateSettings(patch) });
      },

      async addDish(input) {
        await repo.addUserDish(input);
        await refreshDishes();
      },

      async updateDish(id, input) {
        await repo.updateUserDish(id, input);
        await refreshDishes();
      },

      async deleteDish(id) {
        await repo.deleteUserDish(id);
        await refreshDishes();
      },

      async addCategory(input) {
        await repo.addCategory(input);
        await refreshCategories();
      },

      async updateCategory(id, patch) {
        await repo.updateCategory(id, patch);
        await refreshCategories();
      },

      async archiveCategory(id) {
        await repo.archiveCategory(id);
        await refreshCategories();
      },

      async resetCategories() {
        await repo.resetCategories();
        await refreshCategories();
      },

      async exportBackup() {
        return buildBackup(await repo.exportAll(), now());
      },

      async importBackup(backup) {
        // Fins a la còpia v2, una còpia sense categories porta les recomanades.
        await repo.replaceAll({ ...backup, categories: [...DEFAULT_CATEGORIES] });
        await get().load();
      },
    };
  });
}

const AppStoreContext = createContext<AppStore | null>(null);

export function AppStoreProvider({ store, children }: { store: AppStore; children: ReactNode }) {
  useEffect(() => {
    if (store.getState().status === 'loading') void store.getState().load();
    const onVisible = () => {
      if (document.visibilityState === 'visible') store.getState().syncToday();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [store]);
  return <AppStoreContext.Provider value={store}>{children}</AppStoreContext.Provider>;
}

export function useAppStore<T>(selector: (state: AppState) => T): T {
  const store = useContext(AppStoreContext);
  if (!store) throw new Error('Falta AppStoreProvider');
  return useStore(store, selector);
}
