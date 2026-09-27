import { IconCalendarEvent, IconHistory, IconRotate } from '@tabler/icons-react';
import { categoryInfo, DEFAULT_CATEGORIES, type CategoryDef } from '../domain/categories';
import type { DishStats } from '../domain/dishStats';
import { formatMinutes } from '../domain/format';
import type { Dish } from '../domain/types';
import { CategoryIcon } from './CategoryIcon';
import { inkOn } from './contrast';

function lastTime(daysSince: number | null): string {
  if (daysSince === null) return 'No l’has fet mai';
  if (daysSince === 0) return 'Avui';
  if (daysSince === 1) return 'Ahir';
  return `Fa ${daysSince} dies`;
}

function thisMonth(times: number): string {
  if (times === 0) return 'Cap cop aquest mes';
  return `${times} ${times === 1 ? 'cop' : 'cops'} aquest mes`;
}

/** Dors de la rajola: el "+info" del plat. */
export function DishInfo({
  dish,
  stats,
  categories = DEFAULT_CATEGORIES,
}: {
  dish: Dish;
  stats: DishStats;
  categories?: readonly CategoryDef[];
}) {
  const { label, color, icon } = categoryInfo(dish.category, categories);
  const time = formatMinutes(dish.prepMinutes);
  return (
    <div className="h-full overflow-y-auto overscroll-contain px-5 pt-4 pb-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-(--radius-rajola)"
          style={{ backgroundColor: color }}
        >
          <CategoryIcon icon={icon} size={22} stroke={1.5} color={inkOn(color)} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl leading-tight font-semibold text-balance">{dish.name}</h2>
          <p className="mt-0.5 text-sm text-tinta-suau">
            {label}
            {time && ` · ${time}`}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-(--radius-rajola) bg-ciment"
        >
          <IconRotate size={18} stroke={1.75} />
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-tinta-suau">
        <p className="flex items-center gap-1.5">
          <IconHistory size={16} stroke={1.75} aria-hidden="true" />
          {lastTime(stats.daysSince)}
        </p>
        <p className="flex items-center gap-1.5">
          <IconCalendarEvent size={16} stroke={1.75} aria-hidden="true" />
          {thisMonth(stats.timesThisMonth)}
        </p>
      </div>

      {dish.ingredients.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-tinta-suau">Ingredients</h3>
          <ul aria-label="Ingredients" className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
            {dish.ingredients.map((ingredient) => (
              <li key={ingredient} className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 -translate-y-px rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
