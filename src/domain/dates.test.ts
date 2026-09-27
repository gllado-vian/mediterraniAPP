import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, toIsoDate, weekDates, weekStart } from './dates';

describe('dates', () => {
  it('toIsoDate usa la data local', () => {
    expect(toIsoDate(new Date(2026, 8, 7, 23, 30))).toBe('2026-09-07');
  });

  it('addDays travessa canvis de mes i d’any', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31');
  });

  it('addDays no es veu afectat pel canvi d’horari', () => {
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDays('2026-10-25', 1)).toBe('2026-10-26');
    expect(addDays('2027-03-28', 1)).toBe('2027-03-29');
  });

  it('la setmana comença en dilluns', () => {
    expect(weekStart('2026-09-28')).toBe('2026-09-28'); // dilluns
    expect(weekStart('2026-10-04')).toBe('2026-09-28'); // diumenge
    expect(weekStart('2026-10-01')).toBe('2026-09-28'); // dijous
  });

  it('weekDates retorna de dilluns a diumenge', () => {
    expect(weekDates('2026-10-01')).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
  });

  it('daysBetween compta dies naturals', () => {
    expect(daysBetween('2026-09-28', '2026-10-05')).toBe(7);
    expect(daysBetween('2026-10-05', '2026-09-28')).toBe(-7);
  });
});
