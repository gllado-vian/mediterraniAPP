import { IconArrowsExchange, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import type { DayRecord, Dish, IsoDate } from '../domain/types';
import { activeCategories, lunchWord } from '../domain/categories';
import { addDays } from '../domain/dates';
import { dishStats } from '../domain/dishStats';
import { formatLongDate } from '../domain/format';
import { proposeTonight } from '../domain/planner';
import { useAppStore } from '../store/appStore';
import { DishInfo } from '../ui/DishInfo';
import { DishTile } from '../ui/DishTile';
import { AppMenu, type MainScreen } from '../ui/AppMenu';
import { LunchPicker } from '../ui/LunchPicker';
import { WeekTiles } from '../ui/WeekTiles';
import { YesterdayPrompt } from '../ui/YesterdayPrompt';

/** El plat confirmat, o una còpia feta amb l'historial si el plat s'ha esborrat. */
function confirmedDishOf(dinner: DayRecord['dinner'], dishes: Dish[]): Dish | undefined {
  if (dinner?.status !== 'confirmed') return undefined;
  return (
    dishes.find((d) => d.id === dinner.dishId) ?? {
      id: dinner.dishId,
      name: dinner.dishName,
      category: dinner.category,
      ingredients: [],
      prepMinutes: null,
      source: 'user',
    }
  );
}

export function TodayScreen({
  onOpenSwipe,
  onPickYesterday,
  onNavigate,
  onOpenCategories,
}: {
  onOpenSwipe: () => void;
  onPickYesterday: (date: IsoDate) => void;
  onNavigate: (screen: MainScreen) => void;
  onOpenCategories: () => void;
}) {
  const status = useAppStore((s) => s.status);
  const today = useAppStore((s) => s.today);
  const houseSince = useAppStore((s) => s.houseSince);
  const categories = useAppStore((s) => s.categories);
  const days = useAppStore((s) => s.days);
  const dishes = useAppStore((s) => s.dishes);
  const confirmDinner = useAppStore((s) => s.confirmDinner);
  const undoDinner = useAppStore((s) => s.undoDinner);
  const setLunch = useAppStore((s) => s.setLunch);
  const markDinnerUnknown = useAppStore((s) => s.markDinnerUnknown);
  const [justPlaced, setJustPlaced] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // El gir es guarda per plat: si canvia el plat, torna a sortir de cara.
  const [flippedId, setFlippedId] = useState<string | null>(null);

  if (status === 'loading') {
    return <main aria-busy="true" className="min-h-dvh bg-ciment" />;
  }

  const todayRecord = days.find((d) => d.date === today);
  const dinner = todayRecord?.dinner;
  const confirmedDish = confirmedDishOf(dinner, dishes);
  const proposal = confirmedDish ? null : proposeTonight({ today, days, dishes, categories });
  // Sense res planificable (p. ex. totes les categories a 0 vegades) no hi ha cap proposta.
  const nothingToPropose = !confirmedDish && !proposal;
  const shownDish = confirmedDish ?? proposal?.dish;

  // Només preguntem per ahir si l'app ja existia i ahir encara és en blanc.
  const yesterday = addDays(today, -1);
  const yesterdayOpen =
    houseSince !== null &&
    houseSince <= yesterday &&
    !days.find((d) => d.date === yesterday)?.dinner;
  const yesterdayDish = yesterdayOpen
    ? proposeTonight({ today: yesterday, days: days.filter((d) => d.date <= yesterday), dishes, categories })?.dish
    : undefined;

  /** Evita dobles tocs mentre es desa. */
  async function save(action: () => Promise<void>) {
    if (saving) return;
    setSaving(true);
    try {
      await action();
    } finally {
      setSaving(false);
    }
  }

  function confirm() {
    if (!proposal) return;
    void save(async () => {
      await confirmDinner(proposal.dish);
      setJustPlaced(today);
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2 pb-3">
        <h1 className="flex-1 text-lg font-semibold">{formatLongDate(today)}</h1>
        <AppMenu current="today" onNavigate={onNavigate} />
      </header>

      {yesterdayDish && (
        <YesterdayPrompt
          dish={yesterdayDish}
          busy={saving}
          onYes={() => save(() => confirmDinner(yesterdayDish, yesterday))}
          onOther={() => onPickYesterday(yesterday)}
          onUnknown={() => save(() => markDinnerUnknown(yesterday))}
          categories={categories}
        />
      )}

      {!confirmedDish && (
        <LunchPicker value={todayRecord?.lunch} onChange={setLunch} categories={categories} />
      )}

      {proposal?.replacedForLunch && (
        <p className="mb-3 flex items-center gap-2 text-sm text-tinta-suau">
          <IconArrowsExchange size={18} stroke={1.75} aria-hidden="true" />
          Canviat perquè has dinat {lunchWord(proposal.replacedForLunch, categories)}
        </p>
      )}

      {shownDish && (
        <DishTile
          // Amb l'avís d'ahir o moltes categories al dinar, la rajola es compacta (tot cap a 375×667).
          compact={Boolean(yesterdayDish) || activeCategories(categories).length > 5}
          dish={shownDish}
          label="Plat del dia"
          categories={categories}
          back={<DishInfo dish={shownDish} stats={dishStats(shownDish.id, today, days)} categories={categories} />}
          flipped={flippedId === shownDish.id}
          onFlip={() => setFlippedId((id) => (id === shownDish.id ? null : shownDish.id))}
          onClick={() => setFlippedId((id) => (id === shownDish.id ? null : shownDish.id))}
        />
      )}

      <div className="pt-3">
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
              className="min-h-11 rounded-(--radius-rajola) px-3 text-sm font-medium underline decoration-tinta/40 underline-offset-4 transition-colors hover:decoration-tinta"
            >
              Desfer
            </button>
          </div>
        ) : nothingToPropose ? (
          <div className="rounded-(--radius-rajola) bg-rajola px-5 py-4">
            <p className="font-semibold">No tenim cap sopar per proposar</p>
            <p className="mt-1 text-sm text-tinta-suau">
              Cap categoria té vegades aquesta setmana, o les que en tenen encara no tenen plats.
            </p>
            <button
              type="button"
              onClick={onOpenCategories}
              className="mt-3 h-12 w-full rounded-(--radius-rajola) bg-tinta font-semibold text-ciment transition-colors hover:bg-tinta/90"
            >
              Revisar les categories
            </button>
          </div>
        ) : (
          <div className="grid gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={saving}
              className="h-14 rounded-(--radius-rajola) bg-tinta text-lg font-semibold text-ciment transition-[transform,background-color] duration-150 hover:bg-tinta/90 active:scale-[0.98] disabled:opacity-70"
            >
              Sopem això
            </button>
            <button
              type="button"
              onClick={onOpenSwipe}
              className="h-12 rounded-(--radius-rajola) border-2 border-tinta/25 font-medium transition-colors duration-150 hover:border-tinta/50 hover:bg-rajola/50 active:bg-rajola"
            >
              Canviar plat
            </button>
          </div>
        )}

        {/* La llista es queda com a llista; el botó la cobreix sencera. */}
        <div className="relative mt-6">
          <WeekTiles today={today} days={days} justPlaced={justPlaced} categories={categories} />
          <button
            type="button"
            onClick={() => onNavigate('week')}
            aria-label="Veure el resum de la setmana"
            className="absolute -inset-1 z-30 rounded-(--radius-rajola) transition-colors hover:bg-tinta/5 active:bg-tinta/10"
          />
        </div>
      </div>
    </main>
  );
}
