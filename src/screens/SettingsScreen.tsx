import { IconArrowLeft, IconMinus, IconPlus } from '@tabler/icons-react';
import { useAppStore } from '../store/appStore';
import { AppMenu, type MainScreen } from '../ui/AppMenu';

const MIN_MARGIN = 0;
const MAX_MARGIN = 30;

const stepClass =
  'grid h-14 place-items-center rounded-(--radius-rajola) bg-rajola transition-colors hover:bg-rajola/70 active:bg-rajola/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-rajola';

export function SettingsScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: MainScreen) => void;
}) {
  const status = useAppStore((s) => s.status);
  const margin = useAppStore((s) => s.settings.capritxMarginDays);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const setMargin = (days: number) => void updateSettings({ capritxMarginDays: days });

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Tornar"
          className="-ml-2 grid size-11 place-items-center rounded-(--radius-rajola) transition-colors hover:bg-rajola/60"
        >
          <IconArrowLeft size={24} stroke={1.75} aria-hidden="true" />
        </button>
        <h1 className="flex-1 text-lg font-semibold">Ajustos</h1>
        <AppMenu current="settings" onNavigate={onNavigate} />
      </header>

      {status === 'ready' && (
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
      )}
    </main>
  );
}
