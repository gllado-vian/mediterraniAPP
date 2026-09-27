export type RotationCategory = 'peix' | 'ou' | 'llegum' | 'carn' | 'vegetaria';
export type Category = RotationCategory | 'capritx';
export type LunchOption = RotationCategory | 'altre';

export interface CategoryInfo {
  id: Category;
  label: string;
  color: string;
}

export const CATEGORIES: readonly CategoryInfo[] = [
  { id: 'peix', label: 'Peix', color: '#6E93A8' },
  { id: 'ou', label: 'Ou', color: '#F2C166' },
  { id: 'llegum', label: 'Llegum', color: '#6B6E3D' },
  { id: 'carn', label: 'Carn magra', color: '#BF8275' },
  { id: 'vegetaria', label: 'Vegetarià pur', color: '#BCBF69' },
  { id: 'capritx', label: 'Capritx per un dia', color: '#A8402E' },
];

/**
 * Colors que pot tenir una categoria (un per categoria). Els 5 primers són els de
 * les categories recomanades; els 4 últims els va proposar Impeccable (colorize) i
 * els va aprovar l'Olga. El granat del capritx en queda fora: és reservat.
 */
export const CATEGORY_PALETTE = [
  { hex: '#6E93A8', name: 'Blau de mar' },
  { hex: '#F2C166', name: 'Groc de rovell' },
  { hex: '#6B6E3D', name: 'Oliva fosca' },
  { hex: '#BF8275', name: 'Terracota rosada' },
  { hex: '#BCBF69', name: 'Verd d’olivó' },
  { hex: '#A395C2', name: 'Lavanda' },
  { hex: '#6FA89A', name: 'Aigua de cala' },
  { hex: '#D98F4E', name: 'Safrà' },
  { hex: '#6B4A6E', name: 'Albergínia' },
] as const;

export const ROTATION_CATEGORIES: readonly RotationCategory[] = [
  'peix',
  'ou',
  'llegum',
  'carn',
  'vegetaria',
];

/** Sopars per setmana (dilluns → diumenge). Sumen 7. */
export const WEEKLY_QUOTAS: Readonly<Record<RotationCategory, number>> = {
  peix: 2,
  ou: 2,
  llegum: 1,
  carn: 1,
  vegetaria: 1,
};

export const LUNCH_OPTIONS: readonly LunchOption[] = [
  'peix',
  'carn',
  'ou',
  'llegum',
  'vegetaria',
  'altre',
];

export function isCategory(value: unknown): value is Category {
  return CATEGORIES.some((c) => c.id === value);
}

export function isRotationCategory(value: unknown): value is RotationCategory {
  return ROTATION_CATEGORIES.includes(value as RotationCategory);
}

export function categoryInfo(id: Category): CategoryInfo {
  return CATEGORIES.find((c) => c.id === id)!;
}
