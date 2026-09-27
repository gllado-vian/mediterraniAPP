/** Identificador d'una categoria: els de les recomanades ('peix', 'ou'…) o 'c-<uuid>'. */
export type CategoryId = string;
/** Categoria de rotació (les que tenen vegades per setmana). */
export type RotationCategory = CategoryId;
/** Qualsevol categoria d'un plat: de rotació o el capritx. */
export type Category = CategoryId;
/** Opció del dinar: una categoria activa o 'altre'. */
export type LunchOption = CategoryId;

export const CAPRITX_ID = 'capritx';
export const LUNCH_OTHER = 'altre';
/** Ids que no pot tenir mai una categoria editable. */
export const RESERVED_IDS: readonly string[] = [CAPRITX_ID, LUNCH_OTHER];

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

/** Icones Tabler (outline) que pot tenir una categoria. El barret és del capritx. */
export const CATEGORY_ICON_KEYS = [
  'fish',
  'meat',
  'egg',
  'soup',
  'carrot',
  'salad',
  'leaf',
  'seedling',
  'bread',
  'cheese',
  'milk',
  'mushroom',
  'pepper',
  'avocado',
  'bowl-spoon',
  'egg-fried',
] as const;
export type CategoryIconKey = (typeof CATEGORY_ICON_KEYS)[number];

export interface CategoryDef {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  /** Vegades per setmana (0–7). Amb 0, no es proposa mai. */
  quota: number;
  /** Esborrada: no es proposa ni surt als selectors, però l'historial la continua mostrant. */
  archived?: boolean;
}

export const MAX_ACTIVE_CATEGORIES = CATEGORY_PALETTE.length;
export const WEEK_DINNERS = 7;

/**
 * Categories recomanades. L'ordre importa: el generador desempata seguint-lo
 * (és l'ordre de sempre, el dels tests d'acceptació).
 */
export const DEFAULT_CATEGORIES: readonly CategoryDef[] = [
  { id: 'peix', name: 'Peix', icon: 'fish', color: '#6E93A8', quota: 2 },
  { id: 'ou', name: 'Ou', icon: 'egg', color: '#F2C166', quota: 2 },
  { id: 'llegum', name: 'Llegum', icon: 'soup', color: '#6B6E3D', quota: 1 },
  { id: 'carn', name: 'Carn magra', icon: 'meat', color: '#BF8275', quota: 1 },
  { id: 'vegetaria', name: 'Vegetarià pur', icon: 'carrot', color: '#BCBF69', quota: 1 },
];

/** Com es pinta una categoria (també el capritx, les esborrades i les desconegudes). */
export interface CategoryView {
  id: CategoryId;
  label: string;
  color: string;
  icon: string;
  capritx: boolean;
  archived: boolean;
}

const CAPRITX_VIEW: CategoryView = {
  id: CAPRITX_ID,
  label: 'Capritx per un dia',
  color: '#A8402E',
  icon: 'chef-hat',
  capritx: true,
  archived: false,
};

export function activeCategories(categories: readonly CategoryDef[]): CategoryDef[] {
  return categories.filter((c) => !c.archived);
}

/** No peta mai: les esborrades es resolen amb les seves dades i les desconegudes, en neutre. */
export function categoryInfo(
  id: CategoryId,
  categories: readonly CategoryDef[] = DEFAULT_CATEGORIES,
): CategoryView {
  if (id === CAPRITX_ID) return CAPRITX_VIEW;
  const def = categories.find((c) => c.id === id);
  if (def) {
    return { id, label: def.name, color: def.color, icon: def.icon, capritx: false, archived: Boolean(def.archived) };
  }
  return { id, label: 'Categoria esborrada', color: '#5B6348', icon: 'bowl-spoon', capritx: false, archived: true };
}

/** Opcions del dinar: les categories actives en l'ordre de la llista, més "Una altra cosa". */
export function lunchOptions(categories: readonly CategoryDef[]): LunchOption[] {
  return [...activeCategories(categories).map((c) => c.id), LUNCH_OTHER];
}

/** "Canviat perquè has dinat carn magra". */
export function lunchWord(id: CategoryId, categories: readonly CategoryDef[]): string {
  return categoryInfo(id, categories).label.toLocaleLowerCase('ca');
}

// --- Només per a la còpia de seguretat v1 (es treu a la peça 3b) ---

const LEGACY_IDS: readonly string[] = [...DEFAULT_CATEGORIES.map((c) => c.id), CAPRITX_ID];

export function isCategory(value: unknown): value is Category {
  return LEGACY_IDS.includes(value as string);
}

export function isRotationCategory(value: unknown): value is RotationCategory {
  return value !== CAPRITX_ID && isCategory(value);
}
