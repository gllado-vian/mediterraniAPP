import { IconCheck, IconMinus, IconPlus } from '@tabler/icons-react';
import { useRef, useState, type FormEvent } from 'react';
import { activeCategories, CATEGORY_ICON_KEYS, CATEGORY_PALETTE, WEEK_DINNERS } from '../domain/categories';
import { CategoryValidationError, freeColors, quotaTotal, type CategoryField } from '../domain/categoryRules';
import { useAppStore } from '../store/appStore';
import { CategoryIcon, ICON_LABELS } from '../ui/CategoryIcon';
import { inUseMessage } from '../ui/categoryCopy';
import { inkOn } from '../ui/contrast';
import { ScreenHeader } from '../ui/ScreenHeader';

const fieldClass =
  'mt-1 block w-full rounded-(--radius-rajola) border-2 border-transparent bg-rajola px-3 py-2.5 text-base shadow-[inset_0_-1px_0_rgb(58_66_41/0.3)] focus:border-tinta focus:outline-none aria-invalid:border-capritx-tinta';

const stepClass =
  'grid h-11 place-items-center rounded-(--radius-rajola) bg-rajola transition-colors hover:bg-rajola/70 active:bg-rajola/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rajola';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm font-medium text-capritx-tinta">
      {message}
    </p>
  );
}

export function CategoryFormScreen({
  categoryId,
  onDone,
  onBack,
}: {
  /** Categoria a editar; sense id, és una categoria nova. */
  categoryId?: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const status = useAppStore((s) => s.status);
  const categories = useAppStore((s) => s.categories);
  const editing = categories.find((c) => c.id === categoryId && !c.archived);
  // El formulari es munta quan les dades ja hi són: els valors inicials en depenen.
  const ready = status === 'ready' && (!categoryId || Boolean(editing));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <ScreenHeader title={categoryId ? 'Editar categoria' : 'Nova categoria'} onBack={onBack} />
      {ready && <CategoryForm categoryId={categoryId} onDone={onDone} />}
    </main>
  );
}

function CategoryForm({ categoryId, onDone }: { categoryId?: string; onDone: () => void }) {
  const categories = useAppStore((s) => s.categories);
  const dishes = useAppStore((s) => s.dishes);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const archiveCategory = useAppStore((s) => s.archiveCategory);

  const editing = categories.find((c) => c.id === categoryId && !c.archived);
  // Sopars lliures de la setmana per a aquesta categoria.
  const room = WEEK_DINNERS - quotaTotal(categories) + (editing?.quota ?? 0);

  const [name, setName] = useState(editing?.name ?? '');
  const [icon, setIcon] = useState(editing?.icon ?? '');
  const [color, setColor] = useState(editing?.color ?? freeColors(categories)[0] ?? '');
  const [quota, setQuota] = useState(editing?.quota ?? (room > 0 ? 1 : 0));
  const [error, setError] = useState<{ field: CategoryField; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const nameField = useRef<HTMLInputElement>(null);

  const errorOf = (field: CategoryField) => (error?.field === field ? error.message : undefined);
  const others = activeCategories(categories).filter((c) => c.id !== editing?.id);
  const ownDishes = editing ? dishes.filter((d) => d.source === 'user' && d.category === editing.id).length : 0;

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const input = { name, icon, color, quota };
      if (editing) await updateCategory(editing.id, input);
      else await addCategory(input);
      onDone();
    } catch (err) {
      if (!(err instanceof CategoryValidationError)) throw err;
      setError({ field: err.field, message: err.message });
      if (err.field === 'name') nameField.current?.focus();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!editing || saving) return;
    setSaving(true);
    try {
      await archiveCategory(editing.id);
      onDone();
    } catch (err) {
      setConfirmDelete(false);
      setError({ field: 'general', message: err instanceof Error ? err.message : 'No s’ha pogut esborrar.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} noValidate className="mt-1 flex flex-1 flex-col gap-4">
      <div>
        <label htmlFor="category-name" className="text-sm font-medium">
          Nom
        </label>
        <input
          ref={nameField}
          id="category-name"
          type="text"
          autoComplete="off"
          maxLength={20}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error?.field === 'name') setError(null);
          }}
          aria-invalid={errorOf('name') ? true : undefined}
          aria-describedby={errorOf('name') ? 'category-name-error' : undefined}
          className={fieldClass}
        />
        <FieldError id="category-name-error" message={errorOf('name')} />
      </div>

      <fieldset aria-describedby={errorOf('icon') ? 'category-icon-error' : undefined}>
        <legend className="mb-1 text-sm font-medium">Icona</legend>
        <div className="grid grid-cols-8 gap-0.5">
          {CATEGORY_ICON_KEYS.map((key) => {
            const checked = icon === key;
            return (
              <label
                key={key}
                className="grid h-11 cursor-pointer place-items-center rounded-(--radius-rajola) transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-tinta"
                style={{ backgroundColor: checked && color ? color : 'var(--color-rajola)' }}
              >
                <input
                  type="radio"
                  name="category-icon"
                  value={key}
                  checked={checked}
                  onChange={() => {
                    setIcon(key);
                    if (error?.field === 'icon') setError(null);
                  }}
                  aria-label={ICON_LABELS[key]}
                  className="sr-only"
                />
                <CategoryIcon
                  icon={key}
                  size={22}
                  stroke={1.5}
                  color={checked && color ? inkOn(color) : 'var(--color-tinta)'}
                />
              </label>
            );
          })}
        </div>
        <FieldError id="category-icon-error" message={errorOf('icon')} />
      </fieldset>

      <fieldset aria-describedby={errorOf('color') ? 'category-color-error' : undefined}>
        <legend className="mb-1 text-sm font-medium">Color</legend>
        <div className="grid grid-cols-9 gap-0.5">
          {CATEGORY_PALETTE.map(({ hex, name: colorName }) => {
            const owner = others.find((c) => c.color === hex);
            const checked = color === hex;
            return (
              <label
                key={hex}
                className={[
                  'relative grid h-11 place-items-center rounded-(--radius-rajola) has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-tinta',
                  owner ? 'cursor-not-allowed' : 'cursor-pointer',
                  checked ? 'ring-2 ring-tinta ring-offset-2 ring-offset-ciment' : '',
                ].join(' ')}
                style={{
                  backgroundColor: hex,
                  // Ratllat = ja el fa servir una altra categoria (no disponible).
                  backgroundImage: owner
                    ? 'repeating-linear-gradient(135deg, transparent 0 5px, rgb(242 242 242 / 0.75) 5px 8px)'
                    : undefined,
                }}
              >
                <input
                  type="radio"
                  name="category-color"
                  value={hex}
                  checked={checked}
                  disabled={Boolean(owner)}
                  onChange={() => {
                    setColor(hex);
                    if (error?.field === 'color') setError(null);
                  }}
                  aria-label={owner ? `${colorName} (el fa servir ${owner.name})` : colorName}
                  className="sr-only"
                />
                {checked && <IconCheck size={20} stroke={2.25} color={inkOn(hex)} aria-hidden="true" />}
              </label>
            );
          })}
        </div>
        <FieldError id="category-color-error" message={errorOf('color')} />
      </fieldset>

      <fieldset aria-describedby={errorOf('quota') ? 'category-quota-error' : undefined}>
        <legend className="mb-1 text-sm font-medium">Vegades per setmana</legend>
        <div className="grid grid-cols-[3.5rem_1fr_3.5rem] gap-0.5">
          <button
            type="button"
            aria-label="Una vegada menys"
            disabled={quota <= 0}
            onClick={() => setQuota(quota - 1)}
            className={stepClass}
          >
            <IconMinus size={20} stroke={2} aria-hidden="true" />
          </button>
          <output
            aria-live="polite"
            className="grid h-11 place-items-center rounded-(--radius-rajola) bg-rajola font-semibold tabular-nums"
          >
            {quota === 1 ? '1 vegada' : `${quota} vegades`}
          </output>
          <button
            type="button"
            aria-label="Una vegada més"
            disabled={quota >= room || quota >= WEEK_DINNERS}
            onClick={() => setQuota(quota + 1)}
            className={stepClass}
          >
            <IconPlus size={20} stroke={2} aria-hidden="true" />
          </button>
        </div>
        <FieldError id="category-quota-error" message={errorOf('quota')} />
      </fieldset>

      {errorOf('general') && <p className="text-sm font-medium text-capritx-tinta">{errorOf('general')}</p>}

      <div className="mt-auto grid gap-1 sm:mt-4">
        {confirmDelete && editing ? (
          <div className="grid gap-2">
            {ownDishes > 0 ? (
              <>
                <p className="text-center text-sm font-medium text-balance text-capritx-tinta">
                  {inUseMessage(ownDishes)}
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="h-12 rounded-(--radius-rajola) border-2 border-tinta/25 font-medium transition-colors hover:border-tinta/50"
                >
                  D’acord
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-sm font-medium text-balance">
                  Deixarem de proposar-la. Els sopars que ja has fet es queden a la setmana.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="h-12 rounded-(--radius-rajola) border-2 border-tinta/25 font-medium transition-colors hover:border-tinta/50"
                  >
                    No, deixa-la
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={saving}
                    className="h-12 rounded-(--radius-rajola) bg-capritx-tinta font-semibold text-ciment transition-colors hover:bg-capritx-tinta/90 disabled:opacity-70"
                  >
                    Esborrar
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <button
              type="submit"
              disabled={saving}
              className="h-14 rounded-(--radius-rajola) bg-tinta text-lg font-semibold text-ciment transition-[transform,background-color] duration-150 hover:bg-tinta/90 active:scale-[0.98] disabled:opacity-70"
            >
              Desar
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="min-h-11 justify-self-center rounded-(--radius-rajola) px-3 font-medium text-capritx-tinta underline decoration-capritx-tinta/40 underline-offset-4 hover:decoration-capritx-tinta"
              >
                Esborrar la categoria
              </button>
            )}
          </>
        )}
      </div>
    </form>
  );
}
