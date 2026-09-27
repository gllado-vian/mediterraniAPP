import { IconChevronRight, IconPlus } from '@tabler/icons-react';
import { categoryInfo, type CategoryDef } from '../domain/categories';
import { formatMinutes } from '../domain/format';
import type { Dish } from '../domain/types';
import { useAppStore } from '../store/appStore';
import type { MainScreen } from '../ui/AppMenu';
import { CategoryIcon } from '../ui/CategoryIcon';
import { inkOn } from '../ui/contrast';
import { ScreenHeader } from '../ui/ScreenHeader';

function DishRow({
  dish,
  onEdit,
  categories,
}: {
  dish: Dish;
  onEdit: (id: string) => void;
  categories: readonly CategoryDef[];
}) {
  const { label, color, icon } = categoryInfo(dish.category, categories);
  const time = formatMinutes(dish.prepMinutes);
  return (
    <li>
      <button
        type="button"
        onClick={() => onEdit(dish.id)}
        className="flex min-h-16 w-full items-center gap-3 rounded-(--radius-rajola) bg-rajola py-2 pr-3 pl-2 text-left transition-colors hover:bg-rajola/70 active:bg-rajola/50"
      >
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-(--radius-rajola)"
          style={{ backgroundColor: color }}
        >
          <CategoryIcon icon={icon} size={22} stroke={1.5} color={inkOn(color)} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{dish.name}</span>
          <span className="block text-sm text-tinta-suau">{time ? `${label} · ${time}` : label}</span>
        </span>
        <IconChevronRight size={20} stroke={1.75} className="shrink-0 text-tinta-suau" aria-hidden="true" />
      </button>
    </li>
  );
}

export function MyDishesScreen({
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
  const dishes = useAppStore((s) => s.dishes);
  const categories = useAppStore((s) => s.categories);
  const mine = dishes
    .filter((d) => d.source === 'user')
    .sort((a, b) => a.name.localeCompare(b.name, 'ca'));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <ScreenHeader
        title="Els meus plats"
        onBack={onBack}
        menu={{ current: 'settings', nested: true, onNavigate }}
      />

      {status === 'ready' && (
        <>
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 flex h-14 items-center justify-center gap-2 rounded-(--radius-rajola) bg-tinta text-lg font-semibold text-ciment transition-[transform,background-color] duration-150 hover:bg-tinta/90 active:scale-[0.98]"
          >
            <IconPlus size={22} stroke={2} aria-hidden="true" />
            Afegir un plat
          </button>

          {mine.length > 0 ? (
            <ul aria-label="Els meus plats" className="mt-6 grid gap-0.5">
              {mine.map((dish) => (
                <DishRow key={dish.id} dish={dish} onEdit={onEdit} categories={categories} />
              ))}
            </ul>
          ) : (
            <p className="mt-6 max-w-[34ch] text-tinta-suau">
              Els plats que afegeixis sortiran primer a les propostes.
            </p>
          )}
        </>
      )}
    </main>
  );
}
