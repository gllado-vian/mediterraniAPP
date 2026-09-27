import { describe, expect, it } from 'vitest';
import { BASE_RECIPES } from './baseRecipes';
import { BackupError, backupFileName, buildBackup, parseBackup } from './backup';
import { DEFAULT_CATEGORIES, type CategoryDef } from './categories';
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
const categories: CategoryDef[] = [
  ...DEFAULT_CATEGORIES,
  { id: 'c-arros', name: 'Arròs', icon: 'bowl-spoon', color: '#A395C2', quota: 0 },
  { id: 'c-vella', name: 'Vella', icon: 'leaf', color: '#6FA89A', quota: 0, archived: true },
];
const data = {
  house: { id: 'casa-1', createdAt: '2026-09-01T10:00:00.000Z' },
  settings: { capritxMarginDays: 5 },
  dishes: [...BASE_RECIPES, mine],
  days,
  categories,
};
const NOW = new Date('2026-09-27T20:00:00.000Z');

describe('buildBackup', () => {
  it('guarda la casa, els ajustos, els plats propis i tots els dies (no el recetari base)', () => {
    expect(buildBackup(data, NOW)).toEqual({
      app: 'que-sopem',
      version: 2,
      exportedAt: '2026-09-27T20:00:00.000Z',
      house: data.house,
      settings: data.settings,
      dishes: [mine],
      days,
      categories,
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
    expect(() => parseBackup(text)).toThrow('Aquest fitxer no és una còpia de Què sopem. Tria el que vas baixar des d’aquí (que-sopem-….json).');
  });
});

describe('parseBackup i les categories (v2)', () => {
  const valid = () => JSON.parse(JSON.stringify(buildBackup(data, NOW)));
  const parse = (value: unknown) => parseBackup(JSON.stringify(value));
  const own: Dish = { ...mine, id: 'u2', category: 'c-arros' };

  it('una còpia v1 (sense categories) porta les recomanades', () => {
    const { categories: _c, ...v1 } = { ...valid(), version: 1 };
    expect(parse(v1).categories).toEqual(DEFAULT_CATEGORIES);
  });

  it('accepta plats de categories pròpies i sopars de categories esborrades', () => {
    const backup = parse({
      ...valid(),
      dishes: [mine, own],
      days: [
        ...days,
        { date: '2026-09-20', lunch: 'c-vella', dinner: { status: 'confirmed', dishId: 'x', dishName: 'X', category: 'c-vella' } },
      ],
    });
    expect(backup.dishes).toHaveLength(2);
  });

  it.each([
    ['un plat d’una categoria esborrada', (v: ReturnType<typeof valid>) => ({ ...v, dishes: [{ ...own, category: 'c-vella' }] })],
    ['un plat d’una categoria que no hi és', (v: ReturnType<typeof valid>) => ({ ...v, dishes: [{ ...own, category: 'postres' }] })],
    ['un dia d’una categoria que no hi és', (v: ReturnType<typeof valid>) => ({ ...v, days: [{ date: '2026-09-20', lunch: 'postres' }] })],
    ['dues categories amb el mateix color', (v: ReturnType<typeof valid>) => ({ ...v, categories: [...DEFAULT_CATEGORIES, { ...categories[5], color: '#6E93A8' }] })],
    ['més de 7 sopars', (v: ReturnType<typeof valid>) => ({ ...v, categories: [...DEFAULT_CATEGORIES, { ...categories[5], quota: 1 }] })],
    ['una categoria amb un id reservat', (v: ReturnType<typeof valid>) => ({ ...v, categories: [...DEFAULT_CATEGORIES, { ...categories[5], id: 'capritx' }] })],
    ['una versió 3', (v: ReturnType<typeof valid>) => ({ ...v, version: 3 })],
  ])('rebutja %s', (_, change) => {
    expect(() => parse(change(valid()))).toThrow(BackupError);
  });
});

describe('backupFileName', () => {
  it('porta la data i, si cal, un sufix', () => {
    expect(backupFileName('2026-09-27')).toBe('que-sopem-2026-09-27.json');
    expect(backupFileName('2026-09-27', 'abans-d-importar')).toBe('que-sopem-2026-09-27-abans-d-importar.json');
  });
});
