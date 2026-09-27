import { IconArrowsExchange, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import type { RotationCategory } from '../domain/categories';
import { formatLongDate } from '../domain/format';
import { proposeTonight } from '../domain/planner';
import { useAppStore } from '../store/appStore';
import { DishTile } from '../ui/DishTile';
import { WeekTiles } from '../ui/WeekTiles';

const LUNCH_WORD: Record<RotationCategory, string> = {
  peix: 'peix',
  carn: 'carn',
  ou: 'ou',
  llegum: 'llegum',
  vegetaria: 'vegetarià',
};

export function TodayScreen({ onOpenSwipe }: { onOpenSwipe: () => void }) {
  const status = useAppStore((s) => s.status);
  const today = useAppStore((s) => s.today);
  const days = useAppStore((s) => s.days);
  const dishes = useAppStore((s) => s.dishes);
  const confirmDinner = useAppStore((s) => s.confirmDinner);
  const undoDinner = useAppStore((s) => s.undoDinner);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);

  if (status === 'loading') {
    return <main aria-busy="true" className="min-h-dvh bg-ciment" />;
  }

  const dinner = days.find((d) => d.date === today)?.dinner;
  const confirmedDish =
    dinner?.status === 'confirmed' ? dishes.find((d) => d.id === dinner.dishId) : undefined;
  const proposal = confirmedDish ? null : proposeTonight({ today, days, dishes });
  const shownDish = confirmedDish ?? proposal?.dish;

  async function confirm() {
    if (!proposal) return;
    await confirmDinner(proposal.dish);
    setJustPlaced(today);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="pb-4">
        <h1 className="text-lg font-semibold">{formatLongDate(today)}</h1>
      </header>

      {proposal?.replacedForLunch && (
        <p className="mb-3 flex items-center gap-2 text-sm text-tinta-suau">
          <IconArrowsExchange size={18} stroke={1.75} aria-hidden="true" />
          Canviat perquè has dinat {LUNCH_WORD[proposal.replacedForLunch]}
        </p>
      )}

      {shownDish && <DishTile dish={shownDish} label="Plat del dia" />}

      <div className="pt-4">
        {confirmedDish ? (
          <div className="flex items-center justify-between gap-4 rounded-(--radius-rajola) bg-rajola px-5 py-4">
            <div className="flex items-center gap-3">
              <IconCheck size={24} stroke={2} aria-hidden="true" />
              <div>
                <p className="font-semibold">Bon profit!</p>
                <p className="text-sm text-tinta-suau">Aquest sopar ja és a la setmana.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => undoDinner()}
              className="min-h-11 rounded-(--radius-rajola) px-3 text-sm font-medium underline underline-offset-4"
            >
              Desfer
            </button>
          </div>
        ) : (
          <div className="grid gap-2">
            <button
              type="button"
              onClick={confirm}
              className="h-14 rounded-(--radius-rajola) bg-tinta text-lg font-semibold text-ciment transition-transform active:scale-[0.98]"
            >
              Sopem això
            </button>
            <button
              type="button"
              onClick={onOpenSwipe}
              className="h-12 rounded-(--radius-rajola) border-2 border-tinta/25 font-medium transition-colors active:bg-rajola"
            >
              Canviar plat
            </button>
          </div>
        )}

        <div className="mt-6">
          <WeekTiles today={today} days={days} justPlaced={justPlaced} />
        </div>
      </div>
    </main>
  );
}
