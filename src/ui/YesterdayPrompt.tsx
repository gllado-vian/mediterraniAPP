import { categoryInfo, DEFAULT_CATEGORIES, type CategoryDef } from '../domain/categories';
import type { Dish } from '../domain/types';
import { CategoryIcon } from './CategoryIcon';
import { inkOn } from './contrast';

/** Avís no bloquejant: pregunta si ahir es va sopar el plat que tocava. */
export function YesterdayPrompt({
  dish,
  busy,
  onYes,
  onOther,
  onUnknown,
  categories = DEFAULT_CATEGORIES,
}: {
  dish: Dish;
  busy: boolean;
  onYes: () => void;
  onOther: () => void;
  onUnknown: () => void;
  categories?: readonly CategoryDef[];
}) {
  const { color, icon } = categoryInfo(dish.category, categories);
  return (
    <section aria-label="Sopar d’ahir" className="mb-3 rounded-(--radius-rajola) bg-rajola p-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-(--radius-rajola)"
          style={{ backgroundColor: color }}
        >
          <CategoryIcon icon={icon} size={22} stroke={1.5} color={inkOn(color)} />
        </span>
        <p className="font-medium text-balance">Ahir: vas sopar {dish.name}?</p>
      </div>
      <div className="mt-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={onYes}
          disabled={busy}
          className="min-h-11 min-w-16 rounded-(--radius-rajola) bg-tinta px-4 text-sm font-semibold text-ciment transition-colors duration-150 hover:bg-tinta/90 disabled:opacity-70"
        >
          Sí
        </button>
        <button
          type="button"
          onClick={onOther}
          disabled={busy}
          className="min-h-11 rounded-(--radius-rajola) px-3 text-sm font-medium underline decoration-tinta/40 underline-offset-4 transition-colors hover:decoration-tinta disabled:opacity-70"
        >
          Un altre plat
        </button>
        <button
          type="button"
          onClick={onUnknown}
          disabled={busy}
          className="min-h-11 rounded-(--radius-rajola) px-3 text-sm font-medium text-tinta-suau underline decoration-tinta/30 underline-offset-4 transition-colors hover:decoration-tinta disabled:opacity-70"
        >
          No ho recordo
        </button>
      </div>
    </section>
  );
}
