import { describe, expect, it } from 'vitest';
import {
  CAPRITX_ID,
  CATEGORIES,
  CATEGORY_ICON_KEYS,
  DEFAULT_CATEGORIES,
  activeCategories,
  categoryInfo,
  lunchOptions,
  lunchWord,
  LUNCH_OPTIONS,
  ROTATION_CATEGORIES,
  WEEKLY_QUOTAS,
  isCategory,
  isRotationCategory,
} from './categories';

describe('categories', () => {
  it('defineix les 5 categories de rotació més el capritx', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual([
      'peix',
      'ou',
      'llegum',
      'carn',
      'vegetaria',
      'capritx',
    ]);
  });

  it('el capritx no forma part de la rotació', () => {
    expect(ROTATION_CATEGORIES).not.toContain('capritx');
    expect(isRotationCategory('capritx')).toBe(false);
    expect(isRotationCategory('peix')).toBe(true);
  });

  it('les quotes setmanals sumen exactament 7 sopars', () => {
    expect(WEEKLY_QUOTAS).toEqual({ peix: 2, ou: 2, llegum: 1, carn: 1, vegetaria: 1 });
    const total = Object.values(WEEKLY_QUOTAS).reduce((a, b) => a + b, 0);
    expect(total).toBe(7);
  });

  it('cada categoria té nom en català i color de la identitat', () => {
    const byId = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
    expect(byId.peix).toMatchObject({ label: 'Peix', color: '#6E93A8' });
    expect(byId.carn).toMatchObject({ label: 'Carn magra', color: '#BF8275' });
    expect(byId.ou).toMatchObject({ label: 'Ou', color: '#F2C166' });
    expect(byId.llegum).toMatchObject({ label: 'Llegum', color: '#6B6E3D' });
    expect(byId.vegetaria).toMatchObject({ label: 'Vegetarià pur', color: '#BCBF69' });
    expect(byId.capritx).toMatchObject({ label: 'Capritx per un dia', color: '#A8402E' });
  });

  it("les opcions de dinar són les 5 de rotació més 'altre'", () => {
    expect(LUNCH_OPTIONS).toEqual(['peix', 'carn', 'ou', 'llegum', 'vegetaria', 'altre']);
  });

  it('isCategory valida identificadors desconeguts', () => {
    expect(isCategory('peix')).toBe(true);
    expect(isCategory('capritx')).toBe(true);
    expect(isCategory('gust')).toBe(false);
    expect(isCategory(42)).toBe(false);
  });
});

describe('categories editables: model', () => {
  it('les categories recomanades tenen els ids, noms, icones, colors i vegades de sempre, en el mateix ordre', () => {
    expect(DEFAULT_CATEGORIES).toEqual([
      { id: 'peix', name: 'Peix', icon: 'fish', color: '#6E93A8', quota: 2 },
      { id: 'ou', name: 'Ou', icon: 'egg', color: '#F2C166', quota: 2 },
      { id: 'llegum', name: 'Llegum', icon: 'soup', color: '#6B6E3D', quota: 1 },
      { id: 'carn', name: 'Carn magra', icon: 'meat', color: '#BF8275', quota: 1 },
      { id: 'vegetaria', name: 'Vegetarià pur', icon: 'carrot', color: '#BCBF69', quota: 1 },
    ]);
  });

  it('ofereix 16 icones diferents, sense el barret del capritx', () => {
    expect(CATEGORY_ICON_KEYS).toHaveLength(16);
    expect(new Set(CATEGORY_ICON_KEYS).size).toBe(16);
    expect(CATEGORY_ICON_KEYS).not.toContain('chef-hat');
    DEFAULT_CATEGORIES.forEach((c) => expect(CATEGORY_ICON_KEYS).toContain(c.icon));
  });

  it('categoryInfo resol categories actives, arxivades, el capritx i ids desconeguts sense petar', () => {
    const list = [
      ...DEFAULT_CATEGORIES,
      { id: 'c-pasta', name: 'Pasta', icon: 'bread', color: '#D98F4E', quota: 0, archived: true },
    ] as const;
    expect(categoryInfo('peix', list)).toMatchObject({ label: 'Peix', color: '#6E93A8', icon: 'fish', capritx: false });
    expect(categoryInfo('c-pasta', list)).toMatchObject({ label: 'Pasta', color: '#D98F4E', archived: true });
    expect(categoryInfo(CAPRITX_ID, list)).toMatchObject({ label: 'Capritx per un dia', color: '#A8402E', capritx: true });
    expect(categoryInfo('no-existeix', list)).toMatchObject({ label: 'Categoria esborrada', color: '#5B6348' });
  });

  it('les opcions de dinar són les actives, en l’ordre de la llista, més "altre"', () => {
    const list = [
      ...DEFAULT_CATEGORIES.slice(0, 2),
      { id: 'x', name: 'X', icon: 'leaf', color: '#A395C2', quota: 1, archived: true },
    ];
    expect(activeCategories(list).map((c) => c.id)).toEqual(['peix', 'ou']);
    expect(lunchOptions(list)).toEqual(['peix', 'ou', 'altre']);
  });

  it('la paraula del dinar és el nom en minúscula', () => {
    expect(lunchWord('carn', DEFAULT_CATEGORIES)).toBe('carn magra');
  });
});
