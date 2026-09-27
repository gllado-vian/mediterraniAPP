import type { IsoDate } from './types';

const DAY_MS = 86_400_000;

function toUtcMs(date: IsoDate): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtcMs(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Data local del dispositiu en format AAAA-MM-DD. */
export function toIsoDate(date: Date): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

/** Dilluns de la setmana de `date`. */
export function weekStart(date: IsoDate): IsoDate {
  const weekday = new Date(toUtcMs(date)).getUTCDay(); // 0 = diumenge
  return addDays(date, -((weekday + 6) % 7));
}

/** Els 7 dies (dilluns → diumenge) de la setmana de `date`. */
export function weekDates(date: IsoDate): IsoDate[] {
  const monday = weekStart(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}
