import { describe, expect, it } from 'vitest';
import { DEFAULT_CATEGORIES, type CategoryDef } from './categories';
import {
  CategoryValidationError,
  canIncrement,
  freeColors,
  quotaTotal,
  validateCategoryInput,
  validateCategoryList,
} from './categoryRules';

const defaults = [...DEFAULT_CATEGORIES];
const input = { name: 'Pasta', icon: 'bread', color: '#D98F4E', quota: 0 };

function fieldOf(fn: () => unknown) {
  try {
    fn();
  } catch (e) {
    if (e instanceof CategoryValidationError) return { field: e.field, message: e.message };
    throw e;
  }
  return null;
}

describe('regles de les categories', () => {
  it('compta els sopars de les categories actives', () => {
    expect(quotaTotal(defaults)).toBe(7);
    expect(quotaTotal([...defaults, { ...input, id: 'x', quota: 3, archived: true }])).toBe(7);
  });

  it('els colors lliures són els de la paleta que no fa servir cap altra categoria activa', () => {
    expect(freeColors(defaults)).toEqual(['#A395C2', '#6FA89A', '#D98F4E', '#6B4A6E']);
    expect(freeColors(defaults, 'peix')).toContain('#6E93A8');
  });

  it('només es pot sumar si la categoria i la setmana tenen lloc', () => {
    expect(canIncrement(defaults, 'peix')).toBe(false); // setmana plena
    const lighter = defaults.map((c) => (c.id === 'ou' ? { ...c, quota: 1 } : c));
    expect(canIncrement(lighter, 'peix')).toBe(true);
    const full = [{ ...defaults[0], quota: 7 }];
    expect(canIncrement(full, 'peix')).toBe(false);
  });

  it('accepta una categoria nova vàlida i en neteja el nom', () => {
    expect(validateCategoryInput({ ...input, name: '  Pasta ' }, defaults)).toEqual(input);
  });

  it.each([
    [{ ...input, name: '  ' }, 'name', 'Posa-li un nom a la categoria.'],
    [{ ...input, name: 'Una categoria amb un nom llarguíssim' }, 'name', 'El nom pot tenir com a molt 20 lletres.'],
    [{ ...input, name: 'peix' }, 'name', 'Ja tens una categoria amb aquest nom.'],
    [{ ...input, name: 'Capritx per un dia' }, 'name', 'Aquest nom és el del capritx.'],
    [{ ...input, icon: 'pizza' }, 'icon', 'Tria una icona.'],
    [{ ...input, icon: 'chef-hat' }, 'icon', 'Tria una icona.'],
    [{ ...input, color: '#A8402E' }, 'color', 'Tria un color.'],
    [{ ...input, color: '#6E93A8' }, 'color', 'Aquest color ja el fa servir Peix.'],
    [{ ...input, quota: 8 }, 'quota', 'Les vegades han de ser entre 0 i 7.'],
    [{ ...input, quota: 1.5 }, 'quota', 'Les vegades han de ser entre 0 i 7.'],
    [{ ...input, quota: 1 }, 'quota', 'Com a molt, 7 sopars per setmana.'],
  ])('rebutja %o', (value, field, message) => {
    expect(fieldOf(() => validateCategoryInput(value, defaults))).toEqual({ field, message });
  });

  it('en editar, el nom i el color propis no compten com a repetits', () => {
    const peix = { name: 'Peix', icon: 'fish', color: '#6E93A8', quota: 2 };
    expect(validateCategoryInput(peix, defaults, 'peix')).toEqual(peix);
  });

  it('una categoria arxivada no bloqueja ni el nom ni el color', () => {
    const list: CategoryDef[] = [...defaults, { ...input, id: 'c-1', color: '#6FA89A', archived: true }];
    expect(validateCategoryInput({ ...input, color: '#6FA89A' }, list)).toEqual({ ...input, color: '#6FA89A' });
  });

  it('no deixa passar de 9 categories actives (una per color)', () => {
    const nine: CategoryDef[] = [
      ...defaults.map((c) => ({ ...c, quota: 0 })),
      { id: 'a', name: 'A', icon: 'leaf', color: '#A395C2', quota: 0 },
      { id: 'b', name: 'B', icon: 'salad', color: '#6FA89A', quota: 0 },
      { id: 'c', name: 'C', icon: 'bread', color: '#D98F4E', quota: 0 },
      { id: 'd', name: 'D', icon: 'cheese', color: '#6B4A6E', quota: 0 },
    ];
    expect(fieldOf(() => validateCategoryInput({ ...input, name: 'E' }, nine))).toEqual({
      field: 'general',
      message: 'Ja tens una categoria per cada color.',
    });
  });

  describe('la llista sencera', () => {
    it('accepta les recomanades', () => {
      expect(() => validateCategoryList(defaults)).not.toThrow();
    });

    it.each([
      ['cap categoria activa', defaults.map((c) => ({ ...c, archived: true }))],
      ['dos colors repetits', [...defaults, { ...input, id: 'x', color: '#6E93A8' }]],
      ['més de 7 sopars', [...defaults, { ...input, id: 'x', quota: 1 }]],
      ['un id reservat', [...defaults, { ...input, id: 'capritx' }]],
      ['ids repetits', [...defaults, { ...input, id: 'peix' }]],
      ['una icona desconeguda', [{ ...defaults[0], icon: 'pizza' }]],
    ])('rebutja una llista amb %s', (_, list) => {
      expect(() => validateCategoryList(list as CategoryDef[])).toThrow(CategoryValidationError);
    });
  });
});
