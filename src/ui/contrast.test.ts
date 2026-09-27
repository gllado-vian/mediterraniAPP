import { describe, expect, it } from 'vitest';
import { CATEGORIES } from '../domain/categories';
import { contrastRatio, inkOn, INK_DARK, INK_DEEP, INK_LIGHT, textInkOn } from './contrast';

describe('contrast', () => {
  it('calcula la ràtio de contrast WCAG', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
    expect(contrastRatio('#3A4229', '#3A4229')).toBeCloseTo(1, 5);
  });

  it('tria la tinta fosca sobre colors clars i la clara sobre colors foscos', () => {
    expect(inkOn('#F2C166')).toBe(INK_DARK);
    expect(inkOn('#6B6E3D')).toBe(INK_LIGHT);
    expect(inkOn('#A8402E')).toBe(INK_LIGHT);
  });

  it('les icones de totes les categories tenen almenys 3:1 de contrast', () => {
    CATEGORIES.forEach((c) => {
      expect(contrastRatio(inkOn(c.color), c.color), c.label).toBeGreaterThanOrEqual(3);
    });
  });

  it('el text sobre totes les categories arriba a 4,5:1', () => {
    CATEGORIES.forEach((c) => {
      expect(contrastRatio(textInkOn(c.color), c.color), c.label).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('per al text, sobre Peix i Carn fa servir la tinta més fosca', () => {
    expect(textInkOn('#6E93A8')).toBe(INK_DEEP);
    expect(textInkOn('#BF8275')).toBe(INK_DEEP);
    expect(textInkOn('#F2C166')).toBe(INK_DARK);
    expect(textInkOn('#A8402E')).toBe(INK_LIGHT);
  });
});
