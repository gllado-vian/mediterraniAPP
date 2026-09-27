import { useRef, useState, type FormEvent } from 'react';
import { DishValidationError, type DishField } from '../db/repository';
import type { Category } from '../domain/categories';
import { useAppStore } from '../store/appStore';
import { CategoryPicker } from '../ui/CategoryPicker';
import { ScreenHeader } from '../ui/ScreenHeader';

const fieldClass =
  'rounded-(--radius-rajola) border-2 border-transparent bg-rajola px-3 py-2.5 text-base placeholder:text-tinta-suau/70 focus:border-tinta focus:outline-none aria-invalid:border-capritx-tinta';
const inputClass = `mt-1 block w-full ${fieldClass}`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-capritx-tinta">
      {message}
    </p>
  );
}

export function DishFormScreen({
  dishId,
  onDone,
  onBack,
}: {
  /** Plat propi a editar; sense id, és un plat nou. */
  dishId?: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const status = useAppStore((s) => s.status);
  const dish = useAppStore((s) => (dishId ? s.dishes.find((d) => d.id === dishId) : undefined));
  const addDish = useAppStore((s) => s.addDish);
  const updateDish = useAppStore((s) => s.updateDish);
  const deleteDish = useAppStore((s) => s.deleteDish);

  const [name, setName] = useState(dish?.name ?? '');
  const [category, setCategory] = useState<Category | null>(dish?.category ?? null);
  const [minutes, setMinutes] = useState(dish?.prepMinutes ? String(dish.prepMinutes) : '');
  const [ingredients, setIngredients] = useState(dish?.ingredients.join('\n') ?? '');
  const [error, setError] = useState<{ field: DishField; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const fields = {
    name: useRef<HTMLInputElement>(null),
    prepMinutes: useRef<HTMLInputElement>(null),
  };

  // Si el plat encara no és al store (càrrega inicial), omplim el formulari quan arriba.
  const [loadedId, setLoadedId] = useState(dish?.id);
  if (dish && loadedId !== dish.id) {
    setLoadedId(dish.id);
    setName(dish.name);
    setCategory(dish.category);
    setMinutes(dish.prepMinutes ? String(dish.prepMinutes) : '');
    setIngredients(dish.ingredients.join('\n'));
  }

  const errorOf = (field: DishField) => (error?.field === field ? error.message : undefined);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    const input = {
      name,
      category: category as Category,
      prepMinutes: minutes.trim() === '' ? null : Number(minutes),
      ingredients: ingredients.split('\n'),
    };
    setSaving(true);
    try {
      if (dishId) await updateDish(dishId, input);
      else await addDish(input);
      onDone();
    } catch (err) {
      if (!(err instanceof DishValidationError)) throw err;
      setError({ field: err.field, message: err.message });
      if (err.field !== 'category') fields[err.field].current?.focus();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!dishId || saving) return;
    setSaving(true);
    try {
      await deleteDish(dishId);
      onDone();
    } finally {
      setSaving(false);
    }
  }

  const editing = Boolean(dishId);
  const ready = status === 'ready' && (!editing || dish);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <ScreenHeader title={editing ? 'Editar plat' : 'Nou plat'} onBack={onBack} />

      {ready && (
        <form onSubmit={save} noValidate className="mt-1 flex flex-1 flex-col gap-4">
          <div>
            <label htmlFor="dish-name" className="text-sm font-medium">
              Nom
            </label>
            <input
              ref={fields.name}
              id="dish-name"
              type="text"
              autoComplete="off"
              enterKeyHint="next"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error?.field === 'name') setError(null);
              }}
              aria-invalid={errorOf('name') ? true : undefined}
              aria-describedby={errorOf('name') ? 'name-error' : undefined}
              className={inputClass}
            />
            <FieldError id="name-error" message={errorOf('name')} />
          </div>

          <CategoryPicker
            value={category}
            onChange={(c) => {
              setCategory(c);
              if (error?.field === 'category') setError(null);
            }}
            error={errorOf('category')}
          />

          <div>
            <div className="flex items-center gap-3">
              <label htmlFor="dish-minutes" className="text-sm font-medium">
                Temps (minuts)
              </label>
              <input
                ref={fields.prepMinutes}
                id="dish-minutes"
                type="number"
                inputMode="numeric"
                min={1}
                value={minutes}
                onChange={(e) => {
                  setMinutes(e.target.value);
                  if (error?.field === 'prepMinutes') setError(null);
                }}
                aria-invalid={errorOf('prepMinutes') ? true : undefined}
                aria-describedby={errorOf('prepMinutes') ? 'minutes-error' : undefined}
                className={`${fieldClass} w-24 tabular-nums`}
              />
            </div>
            <FieldError id="minutes-error" message={errorOf('prepMinutes')} />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <label htmlFor="dish-ingredients" className="text-sm font-medium">
                Ingredients
              </label>
              <span id="ingredients-hint" className="text-sm text-tinta-suau">
                un per línia
              </span>
            </div>
            <textarea
              id="dish-ingredients"
              rows={3}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              aria-describedby="ingredients-hint"
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </div>

          <div className="mt-auto grid gap-1">
            <button
              type="submit"
              disabled={saving}
              className="h-14 rounded-(--radius-rajola) bg-tinta text-lg font-semibold text-ciment transition-[transform,background-color] duration-150 hover:bg-tinta/90 active:scale-[0.98] disabled:opacity-70"
            >
              Desar
            </button>

            {editing &&
              (confirmDelete ? (
                <div className="flex min-h-11 flex-wrap items-center justify-center gap-x-2">
                  <p className="font-medium">Segur?</p>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={saving}
                    className="min-h-11 rounded-(--radius-rajola) px-3 font-semibold text-capritx-tinta underline decoration-capritx-tinta/40 underline-offset-4 hover:decoration-capritx-tinta"
                  >
                    Sí, esborra’l
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="min-h-11 rounded-(--radius-rajola) px-3 font-medium underline decoration-tinta/40 underline-offset-4 hover:decoration-tinta"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="min-h-11 justify-self-center rounded-(--radius-rajola) px-3 font-medium text-capritx-tinta underline decoration-capritx-tinta/40 underline-offset-4 hover:decoration-capritx-tinta"
                >
                  Esborrar el plat
                </button>
              ))}
          </div>
        </form>
      )}
    </main>
  );
}
