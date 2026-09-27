import { categoryInfo } from '../domain/categories';
import { formatMinutes } from '../domain/format';
import type { Dish } from '../domain/types';
import { CategoryIcon } from './CategoryIcon';
import { inkOn } from './contrast';

/** Rajola d'un plat: camp de color de la categoria amb la icona com a motiu. */
export function DishTile({ dish, label }: { dish: Dish; label: string }) {
  const info = categoryInfo(dish.category);
  const time = formatMinutes(dish.prepMinutes);
  return (
    <article
      aria-label={label}
      className="flex max-h-[40rem] flex-1 flex-col overflow-hidden rounded-(--radius-rajola) bg-rajola"
    >
      <div
        className="grid min-h-48 flex-1 place-items-center"
        style={{ backgroundColor: info.color }}
      >
        <CategoryIcon category={dish.category} size={104} stroke={1.25} color={inkOn(info.color)} />
      </div>
      <div className="px-5 pt-4 pb-5">
        <h2 className="text-[1.75rem] leading-tight font-semibold text-balance">{dish.name}</h2>
        <p className="mt-1.5 flex items-center gap-2 text-base text-tinta-suau">
          <span>{info.label}</span>
          {time && (
            <>
              <span aria-hidden="true">·</span>
              <span>{time}</span>
            </>
          )}
        </p>
      </div>
    </article>
  );
}
