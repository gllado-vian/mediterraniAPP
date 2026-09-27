import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
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
