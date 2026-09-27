import { describe, expect, it } from 'vitest';
import { BASE_RECIPES } from './baseRecipes';
import { BackupError, backupFileName, buildBackup, parseBackup } from './backup';
import type { DayRecord, Dish } from './types';

const mine: Dish = {
  id: 'u1',
  name: 'Truita de carbassó',
  category: 'ou',
  ingredients: ['Ous', 'Carbassó'],
  prepMinutes: 20,
  source: 'user',
};
const days: DayRecord[] = [
  { date: '2026-09-27', lunch: 'peix', dinner: { status: 'confirmed', dishId: 'u1', dishName: 'Truita de carbassó', category: 'ou' } },
  { date: '2026-09-26', dinner: { status: 'unknown' } },
];
const data = {
  house: { id: 'casa-1', createdAt: '2026-09-01T10:00:00.000Z' },
  settings: { capritxMarginDays: 5 },
  dishes: [...BASE_RECIPES, mine],
  days,
};
const NOW = new Date('2026-09-27T20:00:00.000Z');

describe('buildBackup', () => {
  it('guarda la casa, els ajustos, els plats propis i tots els dies (no el recetari base)', () => {
    expect(buildBackup(data, NOW)).toEqual({
      app: 'que-sopem',
      version: 1,
      exportedAt: '2026-09-27T20:00:00.000Z',
      house: data.house,
      settings: data.settings,
      dishes: [mine],
      days,
    });
  });
});

describe('parseBackup', () => {
  const valid = () => JSON.parse(JSON.stringify(buildBackup(data, NOW)));
  const parse = (value: unknown) => parseBackup(JSON.stringify(value));

  it('llegeix una còpia bona', () => {
    expect(parse(valid())).toEqual(buildBackup(data, NOW));
  });

  it('una còpia sense plats ni dies també val', () => {
    expect(parse({ ...valid(), dishes: [], days: [] }).days).toEqual([]);
  });

  it.each([
    ['no és JSON', '{ això no és json'],
    ['és d’una altra app', JSON.stringify({ ...valid(), app: 'una-altra' })],
    ['té una versió desconeguda', JSON.stringify({ ...valid(), version: 99 })],
    ['no té casa', JSON.stringify({ ...valid(), house: undefined })],
    ['té un marge invàlid', JSON.stringify({ ...valid(), settings: { capritxMarginDays: -1 } })],
    ['té un plat sense nom', JSON.stringify({ ...valid(), dishes: [{ ...mine, name: ' ' }] })],
    ['té un plat amb categoria inventada', JSON.stringify({ ...valid(), dishes: [{ ...mine, category: 'postres' }] })],
    ['té un plat amb temps negatiu', JSON.stringify({ ...valid(), dishes: [{ ...mine, prepMinutes: -3 }] })],
    ['té un plat del recetari base', JSON.stringify({ ...valid(), dishes: [{ ...mine, source: 'base' }] })],
    ['té un dia amb data mal escrita', JSON.stringify({ ...valid(), days: [{ date: '27/09/2026' }] })],
    ['té un dinar inventat', JSON.stringify({ ...valid(), days: [{ date: '2026-09-27', lunch: 'pizza' }] })],
    ['té un sopar malmès', JSON.stringify({ ...valid(), days: [{ date: '2026-09-27', dinner: { status: 'confirmed' } }] })],
  ])('rebutja un fitxer que %s', (_, text) => {
    expect(() => parseBackup(text)).toThrow(BackupError);
    expect(() => parseBackup(text)).toThrow('Aquest fitxer no és una còpia de Què sopem.');
  });
});

describe('backupFileName', () => {
  it('porta la data i, si cal, un sufix', () => {
    expect(backupFileName('2026-09-27')).toBe('que-sopem-2026-09-27.json');
    expect(backupFileName('2026-09-27', 'abans-d-importar')).toBe('que-sopem-2026-09-27-abans-d-importar.json');
  });
});
