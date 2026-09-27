import type { Category, LunchOption } from './categories';

/** Data local en format AAAA-MM-DD. */
export type IsoDate = string;

export interface Dish {
  id: string;
  name: string;
  category: Category;
  ingredients: string[];
  /** Minuts de preparació; null quan no aplica (p. ex. "Fora de casa"). */
  prepMinutes: number | null;
  /** 'base' = recetari de l'app (immutable) · 'user' = plat propi de la casa. */
  source: 'base' | 'user';
}

export type NewDish = Pick<Dish, 'name' | 'category' | 'ingredients' | 'prepMinutes'>;

export type DinnerRecord =
  | {
      status: 'confirmed';
      dishId: string;
      /** Còpies per conservar l'historial encara que el plat s'editi o s'esborri. */
      dishName: string;
      category: Category;
    }
  | { status: 'unknown' };

export interface DayRecord {
  date: IsoDate;
  lunch?: LunchOption;
  dinner?: DinnerRecord;
}

export interface Settings {
  /** Dies mínims entre dos capritxos. */
  capritxMarginDays: number;
}

export interface House {
  id: string;
  createdAt: string;
}
