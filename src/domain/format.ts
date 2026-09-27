import type { IsoDate } from './types';

const WEEKDAY_LONG = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
const MONTHS = [
  'gener', 'febrer', 'març', 'abril', 'maig', 'juny',
  'juliol', 'agost', 'setembre', 'octubre', 'novembre', 'desembre',
];

/** Abreviatures de dilluns a diumenge. */
export const WEEKDAY_SHORT = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'] as const;
export const WEEKDAY_LONG_FROM_MONDAY = [...WEEKDAY_LONG.slice(1), WEEKDAY_LONG[0]];

/** "Dijous, 1 d’octubre" */
export function formatLongDate(date: IsoDate): string {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAY_LONG[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const month = MONTHS[m - 1];
  const of = /^[aeiou]/.test(month) ? 'd’' : 'de ';
  return `${weekday}, ${d} ${of}${month}`;
}

export function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '';
  const h = Math.floor(minutes / 60);
  const min = minutes % 60;
  if (h === 0) return `${min} min`;
  return min === 0 ? `${h} h` : `${h} h ${min} min`;
}
