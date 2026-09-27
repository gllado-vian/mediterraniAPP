import { isCategory, isRotationCategory } from './categories';
import type { DayRecord, Dish, House, IsoDate, Settings } from './types';

export const BACKUP_APP = 'que-sopem';
export const BACKUP_VERSION = 1;

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
}

export class BackupError extends Error {
  constructor() {
    super('Aquest fitxer no és una còpia de Què sopem.');
  }
}

export function buildBackup(
  data: { house: House; settings: Settings; dishes: Dish[]; days: DayRecord[] },
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

function isUserDish(v: unknown): v is Dish {
  if (!isObject(v)) return false;
  const { prepMinutes } = v;
  return (
    isText(v.id) &&
    isText(v.name) &&
    isCategory(v.category) &&
    Array.isArray(v.ingredients) &&
    v.ingredients.every((i) => typeof i === 'string') &&
    (prepMinutes === null || (Number.isInteger(prepMinutes) && (prepMinutes as number) > 0)) &&
    v.source === 'user'
  );
}

function isDinner(v: unknown): boolean {
  if (!isObject(v)) return false;
  if (v.status === 'unknown') return true;
  return v.status === 'confirmed' && isText(v.dishId) && isText(v.dishName) && isCategory(v.category);
}

function isDay(v: unknown): v is DayRecord {
  return (
    isObject(v) &&
    isIsoDate(v.date) &&
    (v.lunch === undefined || v.lunch === 'altre' || isRotationCategory(v.lunch)) &&
    (v.dinner === undefined || isDinner(v.dinner))
  );
}

/** Llegeix i valida una còpia; si hi ha res estrany, no se'n fa servir res. */
export function parseBackup(text: string): Backup {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError();
  }
  if (
    !isObject(data) ||
    data.app !== BACKUP_APP ||
    data.version !== BACKUP_VERSION ||
    !isText(data.exportedAt) ||
    !isHouse(data.house) ||
    !isSettings(data.settings) ||
    !Array.isArray(data.dishes) ||
    !data.dishes.every(isUserDish) ||
    !Array.isArray(data.days) ||
    !data.days.every(isDay)
  ) {
    throw new BackupError();
  }
  return data as unknown as Backup;
}
