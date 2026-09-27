import { IconChevronRight, IconMinus, IconPlus } from '@tabler/icons-react';
import { activeCategories } from '../domain/categories';
import { quotaTotal } from '../domain/categoryRules';
import { useAppStore } from '../store/appStore';
import type { MainScreen } from '../ui/AppMenu';
import { BackupSection } from '../ui/BackupSection';
import { ScreenHeader } from '../ui/ScreenHeader';

const MIN_MARGIN = 0;
const MAX_MARGIN = 30;

const stepClass =
  'grid h-14 place-items-center rounded-(--radius-rajola) bg-rajola transition-colors hover:bg-rajola/70 active:bg-rajola/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rajola';

export function SettingsScreen({
  onBack,
  onNavigate,
  onOpenMyDishes,
  onOpenCategories,
}: {
  onBack: () => void;
  onNavigate: (screen: MainScreen) => void;
  onOpenMyDishes: () => void;
  onOpenCategories: () => void;
}) {
  const status = useAppStore((s) => s.status);
  const margin = useAppStore((s) => s.settings.capritxMarginDays);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const myDishes = useAppStore((s) => s.dishes.filter((d) => d.source === 'user').length);
  const categories = useAppStore((s) => s.categories);
  const activeCount = activeCategories(categories).length;
  const dinners = quotaTotal(categories);

  const setMargin = (days: number) => void updateSettings({ capritxMarginDays: days });

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <ScreenHeader title="Ajustos" onBack={onBack} menu={{ current: 'settings', onNavigate }} />

      {status === 'ready' && (
        <>
          <fieldset className="mt-3">
            <legend className="font-semibold">Marge entre capritxos</legend>
            <div className="mt-3 grid grid-cols-[3.5rem_1fr_3.5rem] gap-0.5">
              <button
                type="button"
                aria-label="Un dia menys"
                disabled={margin <= MIN_MARGIN}
                onClick={() => setMargin(margin - 1)}
                className={stepClass}
              >
                <IconMinus size={22} stroke={2} aria-hidden="true" />
              </button>
              <output
                aria-live="polite"
                className="grid h-14 place-items-center rounded-(--radius-rajola) bg-rajola text-lg font-semibold tabular-nums"
              >
                {margin === 1 ? '1 dia' : `${margin} dies`}
              </output>
              <button
                type="button"
                aria-label="Un dia més"
                disabled={margin >= MAX_MARGIN}
                onClick={() => setMargin(margin + 1)}
                className={stepClass}
              >
                <IconPlus size={22} stroke={2} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-sm text-tinta-suau">
              Dies que han de passar entre dos capritxos. Si en tries un abans, t’avisarem.
            </p>
          </fieldset>

          <button
            type="button"
            onClick={onOpenMyDishes}
            className="mt-6 flex min-h-14 w-full items-center gap-3 rounded-(--radius-rajola) bg-rajola px-4 py-2 text-left transition-colors hover:bg-rajola/70 active:bg-rajola/50"
          >
            <span className="flex-1">
              <span className="block font-semibold">Els meus plats</span>
              <span className="block text-sm text-tinta-suau">
                {myDishes === 0
                  ? 'Encara no n’has afegit cap'
                  : `${myDishes} ${myDishes === 1 ? 'plat propi' : 'plats propis'}`}
              </span>
            </span>
            <IconChevronRight size={20} stroke={1.75} className="text-tinta-suau" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onOpenCategories}
            className="mt-2 flex min-h-14 w-full items-center gap-3 rounded-(--radius-rajola) bg-rajola px-4 py-2 text-left transition-colors hover:bg-rajola/70 active:bg-rajola/50"
          >
            <span className="flex-1">
              <span className="block font-semibold">Categories</span>
              <span className="block text-sm text-tinta-suau">
              {activeCount} {activeCount === 1 ? 'categoria' : 'categories'} · {dinners}{' '}
              {dinners === 1 ? 'sopar' : 'sopars'}
            </span>
            </span>
            <IconChevronRight size={20} stroke={1.75} className="text-tinta-suau" aria-hidden="true" />
          </button>

          <BackupSection />
        </>
      )}
    </main>
  );
}
