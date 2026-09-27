import { IconChevronRight, IconMinus, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import {
  activeCategories,
  DEFAULT_CATEGORIES,
  MAX_ACTIVE_CATEGORIES,
  WEEK_DINNERS,
  type CategoryDef,
} from '../domain/categories';
import { CategoryInUseError } from '../db/repository';
import { canIncrement, quotaTotal } from '../domain/categoryRules';
import { useAppStore } from '../store/appStore';
import type { MainScreen } from '../ui/AppMenu';
import { CategoryIcon } from '../ui/CategoryIcon';
import { inkOn } from '../ui/contrast';
import { inUseMessage, resetInUseMessage } from '../ui/categoryCopy';
import { ScreenHeader } from '../ui/ScreenHeader';

const stepClass =
  'grid size-11 place-items-center rounded-(--radius-rajola) bg-ciment transition-colors hover:bg-ciment/70 active:bg-ciment/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ciment';

const textButton =
  'min-h-11 rounded-(--radius-rajola) px-2 text-sm font-semibold underline underline-offset-4 transition-colors';

function CategoryRow({
  category,
  categories,
  ownDishes,
  hasDishes,
  onEdit,
}: {
  category: CategoryDef;
  categories: readonly CategoryDef[];
  /** Plats propis d'aquesta categoria (impedeixen esborrar-la). */
  ownDishes: number;
  hasDishes: boolean;
  onEdit: (id: string) => void;
}) {
  const updateCategory = useAppStore((s) => s.updateCategory);
  const archiveCategory = useAppStore((s) => s.archiveCategory);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id, name, icon, color, quota } = category;

  const setQuota = (value: number) => void updateCategory(id, { quota: value });

  async function remove() {
    try {
      await archiveCategory(id);
    } catch (e) {
      setConfirming(false);
      setError(e instanceof Error ? e.message : 'No s’ha pogut esborrar.');
    }
  }

  return (
    <li className="rounded-(--radius-rajola) bg-rajola px-2 py-1">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-(--radius-rajola)"
          style={{ backgroundColor: color }}
        >
          <CategoryIcon icon={icon} size={22} stroke={1.5} color={inkOn(color)} />
        </span>
        <button
          type="button"
          onClick={() => onEdit(id)}
          aria-label={`Editar ${name}`}
          className="-my-1 flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-(--radius-rajola) text-left transition-colors hover:bg-ciment/40"
        >
          <span className="min-w-0 flex-1">
            <span data-name className="block truncate font-medium">
              {name}
            </span>
            {quota > 0 && !hasDishes && <span className="block text-sm text-tinta-suau">Encara no té plats</span>}
          </span>
          <IconChevronRight size={18} stroke={1.75} className="shrink-0 text-tinta-suau" aria-hidden="true" />
        </button>
        <div className="grid shrink-0 grid-cols-[2.75rem_2rem_2.75rem] items-center gap-0.5">
          <button
            type="button"
            aria-label={`Una vegada menys de ${name}`}
            disabled={quota <= 0}
            onClick={() => setQuota(quota - 1)}
            className={stepClass}
          >
            <IconMinus size={18} stroke={2} aria-hidden="true" />
          </button>
          <output aria-live="polite" className="text-center text-lg font-semibold tabular-nums">
            {quota}
          </output>
          <button
            type="button"
            aria-label={`Una vegada més de ${name}`}
            disabled={!canIncrement(categories, id)}
            onClick={() => setQuota(quota + 1)}
            className={stepClass}
          >
            <IconPlus size={18} stroke={2} aria-hidden="true" />
          </button>
        </div>
      </div>

      {quota === 0 && (
        // L'avís de 0 vegades: una sola línia sota el nom (arriba fins sota el comptador).
        <p className="flex items-center gap-1.5 pb-0.5 pl-[3.25rem] text-sm text-capritx-tinta">
          <span>No es proposa mai</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setConfirming((c) => !c);
            }}
            className="-my-2 py-2 font-semibold underline decoration-capritx-tinta/40 underline-offset-4 hover:decoration-capritx-tinta"
          >
            Esborrar-la
          </button>
        </p>
      )}
      {quota === 0 && confirming && (
        <div className="mt-1 pb-1 pl-[3.25rem] text-sm">
          {ownDishes > 0 ? (
            <p className="font-medium text-capritx-tinta">{inUseMessage(ownDishes)}</p>
          ) : (
            <div className="flex flex-wrap items-center gap-x-2">
              <p className="font-medium">
                Esborrar {name}? Els sopars que ja n’has fet es queden a la setmana.
              </p>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className={`${textButton} -ml-2 text-tinta decoration-tinta/40 hover:decoration-tinta`}
              >
                No, deixa-la
              </button>
              <button
                type="button"
                onClick={remove}
                className={`${textButton} text-capritx-tinta decoration-capritx-tinta/40 hover:decoration-capritx-tinta`}
              >
                Esborrar
              </button>
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-1 px-1 text-sm font-medium text-capritx-tinta">{error}</p>}
    </li>
  );
}

export function CategoriesScreen({
  onBack,
  onNavigate,
  onAdd,
  onEdit,
}: {
  onBack: () => void;
  onNavigate: (screen: MainScreen) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
}) {
  const status = useAppStore((s) => s.status);
  const categories = useAppStore((s) => s.categories);
  const dishes = useAppStore((s) => s.dishes);
  const active = activeCategories(categories);
  const total = quotaTotal(categories);
  const resetCategories = useAppStore((s) => s.resetCategories);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const recommendedNames = DEFAULT_CATEGORIES.map((c) => c.name);
  const recommendedList = `${recommendedNames.slice(0, -1).join(', ')} i ${recommendedNames.at(-1)}`;

  async function reset() {
    try {
      await resetCategories();
      setConfirmReset(false);
    } catch (e) {
      setConfirmReset(false);
      if (e instanceof CategoryInUseError) setResetError(resetInUseMessage(e.count));
      else throw e;
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <ScreenHeader title="Categories" onBack={onBack} menu={{ current: 'settings', nested: true, onNavigate }} />

      {status === 'ready' && (
        <>
          <ul aria-label="Categories de la setmana" className="mt-1 grid gap-0.5">
            {active.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                categories={categories}
                ownDishes={dishes.filter((d) => d.source === 'user' && d.category === category.id).length}
                hasDishes={dishes.some((d) => d.category === category.id)}
                onEdit={onEdit}
              />
            ))}
          </ul>

          <p className="mt-3 font-semibold tabular-nums" aria-live="polite">
            {total} de {WEEK_DINNERS} sopars de la setmana
          </p>
          {total < WEEK_DINNERS && (
            <p className="text-sm text-tinta-suau">Els dies que sobrin, en proposarem de les que tens.</p>
          )}

          <div className="mt-auto grid gap-1 pt-4">
            {active.length < MAX_ACTIVE_CATEGORIES ? (
              <button
                type="button"
                onClick={onAdd}
                className="flex h-12 items-center justify-center gap-2 rounded-(--radius-rajola) border-2 border-tinta/25 font-medium transition-colors hover:border-tinta/50 hover:bg-rajola/50 active:bg-rajola"
              >
                <IconPlus size={20} stroke={2} aria-hidden="true" />
                Afegir una categoria
              </button>
            ) : (
              <p className="text-sm text-tinta-suau">Ja fas servir els 9 colors: per afegir-ne una, esborra’n una altra.</p>
            )}

            {confirmReset ? (
              <div className="mt-1 rounded-(--radius-rajola) bg-rajola p-3 text-sm">
                <p className="font-medium text-pretty">
                  Tornaran {recommendedList} amb les vegades de sempre. Les que has creat deixaran de proposar-se.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="h-11 rounded-(--radius-rajola) border-2 border-tinta/25 font-medium transition-colors hover:border-tinta/50"
                  >
                    Deixar-ho com està
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="h-11 rounded-(--radius-rajola) bg-tinta font-semibold text-ciment transition-colors hover:bg-tinta/90"
                  >
                    Sí, torna-hi
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setResetError(null);
                  setConfirmReset(true);
                }}
                className="min-h-11 justify-self-center rounded-(--radius-rajola) px-3 text-sm font-medium underline decoration-tinta/40 underline-offset-4 transition-colors hover:decoration-tinta"
              >
                Tornar a les recomanades
              </button>
            )}
            {resetError && <p className="text-sm font-medium text-capritx-tinta">{resetError}</p>}
          </div>
        </>
      )}
    </main>
  );
}
