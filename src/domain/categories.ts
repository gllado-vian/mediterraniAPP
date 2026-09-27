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
