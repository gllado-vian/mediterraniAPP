import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import type { Repository } from '../db/repository';
import { BASE_RECIPES, seedBaseRecipes } from '../domain/baseRecipes';
import type { LunchOption } from '../domain/categories';
import { toIsoDate } from '../domain/dates';
import type { DayRecord, Dish, IsoDate, Settings } from '../domain/types';

export interface AppState {
  status: 'loading' | 'ready';
  today: IsoDate;
  days: DayRecord[];
  dishes: Dish[];
  settings: Settings;
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

    return {
      status: 'loading',
      today: toIsoDate(now()),
      days: [],
      dishes: [],
      settings: { capritxMarginDays: 7 },
      houseSince: null,

      async load() {
        const house = await repo.ensureHouse(now());
        await seedBaseRecipes(repo);
        const [dishes, days, settings] = await Promise.all([
          repo.listDishes(),
          repo.listAllDays(),
          repo.getSettings(),
        ]);
        set({
          status: 'ready',
          today: toIsoDate(now()),
          houseSince: toIsoDate(new Date(house.createdAt)),
          dishes: inRecipeOrder(dishes),
          days,
          settings,
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
