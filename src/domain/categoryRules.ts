import {
  activeCategories,
  CAPRITX_ID,
  CATEGORY_ICON_KEYS,
  CATEGORY_PALETTE,
  categoryInfo,
  MAX_ACTIVE_CATEGORIES,
  RESERVED_IDS,
  WEEK_DINNERS,
  type CategoryDef,
  type CategoryId,
} from './categories';

export type CategoryField = 'name' | 'icon' | 'color' | 'quota' | 'general';

export class CategoryValidationError extends Error {
  constructor(
    message: string,
    /** Camp del formulari on cal ensenyar l'error. */
    readonly field: CategoryField,
  ) {
    super(message);
  }
}

export type CategoryInput = Pick<CategoryDef, 'name' | 'icon' | 'color' | 'quota'>;

const NAME_MAX = 20;
const PALETTE_HEX: readonly string[] = CATEGORY_PALETTE.map((c) => c.hex);
const sameName = (a: string, b: string) => a.trim().toLocaleLowerCase('ca') === b.trim().toLocaleLowerCase('ca');

/** Sopars per setmana que sumen les categories actives. */
export function quotaTotal(categories: readonly CategoryDef[]): number {
  return activeCategories(categories).reduce((sum, c) => sum + c.quota, 0);
}

/** Colors de la paleta que no fa servir cap altra categoria activa. */
export function freeColors(categories: readonly CategoryDef[], exceptId?: CategoryId): string[] {
  const used = new Set(activeCategories(categories).filter((c) => c.id !== exceptId).map((c) => c.color));
  return PALETTE_HEX.filter((hex) => !used.has(hex));
}

/** Es pot sumar una vegada si la categoria no és a 7 i la setmana té lloc. */
export function canIncrement(categories: readonly CategoryDef[], id: CategoryId): boolean {
  const category = categories.find((c) => c.id === id);
  return Boolean(category) && category!.quota < WEEK_DINNERS && quotaTotal(categories) < WEEK_DINNERS;
}

/**
 * Valida una categoria nova (`editingId` buit) o editada contra la llista actual.
 * Retorna les dades netes (nom retallat) o llança CategoryValidationError.
 */
export function validateCategoryInput(
  input: CategoryInput,
  categories: readonly CategoryDef[],
  editingId?: CategoryId,
): CategoryInput {
  const name = input.name.trim();
  const others = activeCategories(categories).filter((c) => c.id !== editingId);

  if (!editingId && others.length >= MAX_ACTIVE_CATEGORIES) {
    throw new CategoryValidationError('Ja tens una categoria per cada color.', 'general');
  }
  if (!name) throw new CategoryValidationError('Posa-li un nom a la categoria.', 'name');
  if (name.length > NAME_MAX) throw new CategoryValidationError('El nom pot tenir com a molt 20 lletres.', 'name');
  if (sameName(name, categoryInfo(CAPRITX_ID).label)) {
    throw new CategoryValidationError('Aquest nom és el del capritx.', 'name');
  }
  if (others.some((c) => sameName(c.name, name))) {
    throw new CategoryValidationError('Ja tens una categoria amb aquest nom.', 'name');
  }
  if (!(CATEGORY_ICON_KEYS as readonly string[]).includes(input.icon)) {
    throw new CategoryValidationError('Tria una icona.', 'icon');
  }
  if (!PALETTE_HEX.includes(input.color)) throw new CategoryValidationError('Tria un color.', 'color');
  const owner = others.find((c) => c.color === input.color);
  if (owner) throw new CategoryValidationError(`Aquest color ja el fa servir ${owner.name}.`, 'color');
  if (!Number.isInteger(input.quota) || input.quota < 0 || input.quota > WEEK_DINNERS) {
    throw new CategoryValidationError('Les vegades han de ser entre 0 i 7.', 'quota');
  }
  if (quotaTotal(others) + input.quota > WEEK_DINNERS) {
    throw new CategoryValidationError('Com a molt, 7 sopars per setmana.', 'quota');
  }
  return { name, icon: input.icon, color: input.color, quota: input.quota };
}

/** Valida la llista sencera (en desar i en importar una còpia). */
export function validateCategoryList(categories: readonly CategoryDef[]): void {
  const fail = (message: string): never => {
    throw new CategoryValidationError(message, 'general');
  };
  const ids = categories.map((c) => c.id);
  if (new Set(ids).size !== ids.length) fail('Hi ha categories repetides.');
  if (ids.some((id) => !id || RESERVED_IDS.includes(id))) fail('Hi ha una categoria amb un identificador reservat.');

  const active = activeCategories(categories);
  if (active.length === 0) fail('Ha de quedar almenys una categoria.');
  if (active.length > MAX_ACTIVE_CATEGORIES) fail('Hi ha més categories que colors.');
  categories.forEach((c) => {
    if (!c.name?.trim() || c.name.trim().length > NAME_MAX) fail('Hi ha una categoria sense nom vàlid.');
    if (!(CATEGORY_ICON_KEYS as readonly string[]).includes(c.icon)) fail('Hi ha una categoria amb una icona desconeguda.');
    if (!PALETTE_HEX.includes(c.color)) fail('Hi ha una categoria amb un color fora de la paleta.');
    if (!Number.isInteger(c.quota) || c.quota < 0 || c.quota > WEEK_DINNERS) fail('Hi ha vegades fora de 0–7.');
  });
  if (new Set(active.map((c) => c.color)).size !== active.length) fail('Dues categories tenen el mateix color.');
  if (new Set(active.map((c) => c.name.trim().toLocaleLowerCase('ca'))).size !== active.length) {
    fail('Dues categories tenen el mateix nom.');
  }
  if (quotaTotal(categories) > WEEK_DINNERS) fail('Com a molt, 7 sopars per setmana.');
}
