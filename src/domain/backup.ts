import {
  activeCategories,
  CAPRITX_ID,
  DEFAULT_CATEGORIES,
  LUNCH_OTHER,
  type CategoryDef,
} from './categories';
import { validateCategoryList } from './categoryRules';
import type { DayRecord, Dish, House, IsoDate, Settings } from './types';

export const BACKUP_APP = 'que-sopem';
/** v2 porta les categories; les còpies v1 es llegeixen amb les recomanades. */
export const BACKUP_VERSION = 2;

/** Còpia de seguretat de la casa: tot menys el recetari base (que ja és a l'app). */
export interface Backup {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  house: House;
  settings: Settings;
  /** Només plats propis. */
  dishes: Dish[];
  days: DayRecord[];
  /** Categories de la casa, també les esborrades (per a l'historial). */
  categories: CategoryDef[];
}

export class BackupError extends Error {
  constructor() {
    super('Aquest fitxer no és una còpia de Què sopem. Tria el que vas baixar des d’aquí (que-sopem-….json).');
  }
}

export function buildBackup(
  data: { house: House; settings: Settings; dishes: Dish[]; days: DayRecord[]; categories: CategoryDef[] },
  now: Date,
): Backup {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    house: data.house,
    settings: data.settings,
    dishes: data.dishes.filter((d) => d.source === 'user'),
    days: data.days,
    categories: data.categories,
  };
}

export function backupFileName(date: IsoDate, suffix?: string): string {
  return `que-sopem-${date}${suffix ? `-${suffix}` : ''}.json`;
}

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const isIsoDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

function isHouse(v: unknown): v is House {
  return isObject(v) && isText(v.id) && isText(v.createdAt) && !Number.isNaN(Date.parse(v.createdAt));
}

function isSettings(v: unknown): v is Settings {
  return isObject(v) && Number.isInteger(v.capritxMarginDays) && (v.capritxMarginDays as number) >= 0;
}

function isUserDish(v: unknown, categories: readonly CategoryDef[]): v is Dish {
  if (!isObject(v)) return false;
  const { prepMinutes } = v;
  const dishCategory = v.category === CAPRITX_ID || activeCategories(categories).some((c) => c.id === v.category);
  return (
    isText(v.id) &&
    isText(v.name) &&
    dishCategory &&
    Array.isArray(v.ingredients) &&
    v.ingredients.every((i) => typeof i === 'string') &&
    (prepMinutes === null || (Number.isInteger(prepMinutes) && (prepMinutes as number) > 0)) &&
    v.source === 'user'
  );
}

/** A l'historial hi pot haver qualsevol categoria del fitxer (també esborrades) o el capritx. */
function isKnown(id: unknown, categories: readonly CategoryDef[]): boolean {
  return id === CAPRITX_ID || categories.some((c) => c.id === id);
}

function isDinner(v: unknown, categories: readonly CategoryDef[]): boolean {
  if (!isObject(v)) return false;
  if (v.status === 'unknown') return true;
  return v.status === 'confirmed' && isText(v.dishId) && isText(v.dishName) && isKnown(v.category, categories);
}

function isDay(v: unknown, categories: readonly CategoryDef[]): v is DayRecord {
  return (
    isObject(v) &&
    isIsoDate(v.date) &&
    (v.lunch === undefined || v.lunch === LUNCH_OTHER || (v.lunch !== CAPRITX_ID && isKnown(v.lunch, categories))) &&
    (v.dinner === undefined || isDinner(v.dinner, categories))
  );
}

function isCategoryList(v: unknown): v is CategoryDef[] {
  if (!Array.isArray(v) || !v.every(isObject)) return false;
  try {
    validateCategoryList(v as unknown as CategoryDef[]);
    return true;
  } catch {
    return false;
  }
}

/** Llegeix i valida una còpia (v1 o v2); si hi ha res estrany, no se'n fa servir res. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError();
  }
  if (!isObject(data) || data.app !== BACKUP_APP || (data.version !== 1 && data.version !== 2)) {
    throw new BackupError();
  }
  const categories = data.version === 1 ? [...DEFAULT_CATEGORIES] : data.categories;
  if (
    !isCategoryList(categories) ||
    !isText(data.exportedAt) ||
    !isHouse(data.house) ||
    !isSettings(data.settings) ||
    !Array.isArray(data.dishes) ||
    !data.dishes.every((d) => isUserDish(d, categories)) ||
    !Array.isArray(data.days) ||
    !data.days.every((d) => isDay(d, categories))
  ) {
    throw new BackupError();
  }
  return { ...(data as unknown as Backup), version: BACKUP_VERSION, categories };
}
