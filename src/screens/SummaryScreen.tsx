import { IconArrowLeft, IconCheck, IconChefHat } from '@tabler/icons-react';
import { categoryInfo } from '../domain/categories';
import { weeklySummary, type SummaryRow } from '../domain/weeklySummary';
import { useAppStore } from '../store/appStore';
import { CategoryIcon } from '../ui/CategoryIcon';
import { inkOn } from '../ui/contrast';
import { AppMenu, type MainScreen } from '../ui/AppMenu';
import { WeekTiles } from '../ui/WeekTiles';

/** Una rajola per categoria: quan la quota és complerta, el color l'omple sencera. */
function Row({ row }: { row: SummaryRow }) {
  const { label, color } = categoryInfo(row.category);
  const ink = inkOn(color);
  return (
    <li
      className={`flex min-h-14 items-center gap-3 rounded-(--radius-rajola) py-2 pr-4 pl-2 ${row.complete ? '' : 'bg-rajola'}`}
      style={row.complete ? { backgroundColor: color, color: ink } : undefined}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-(--radius-rajola)"
        style={{ backgroundColor: color }}
      >
        <CategoryIcon category={row.category} size={22} stroke={1.5} color={ink} />
      </span>
      <span data-label className="flex-1 font-medium">
        {label}
      </span>
      {row.complete ? (
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <IconCheck size={18} stroke={2.25} aria-hidden="true" />
          complerta
        </span>
      ) : (
        <span className="text-sm text-tinta-suau">
          {row.done}/{row.quota} · pendent
        </span>
      )}
    </li>
  );
}

export function SummaryScreen({
  onBack,
  onNavigate,
}: {
  onBack: () => void;
  onNavigate: (screen: MainScreen) => void;
}) {
  const status = useAppStore((s) => s.status);
  const today = useAppStore((s) => s.today);
  const days = useAppStore((s) => s.days);
  const { rows, capritxos } = weeklySummary(today, days);

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
        <h1 className="flex-1 text-lg font-semibold">La teva setmana</h1>
        <AppMenu current="week" onNavigate={onNavigate} />
      </header>

      {status === 'ready' && (
        <>
          <WeekTiles today={today} days={days} />

          <ul aria-label="Resum per categoria" className="mt-6 grid gap-0.5">
            {rows.map((row) => (
              <Row key={row.category} row={row} />
            ))}
          </ul>

          <p className="mt-5 flex items-center gap-2 text-sm text-tinta-suau">
            <IconChefHat size={18} stroke={1.75} className="text-capritx-tinta" aria-hidden="true" />
            {capritxos > 0 ? `Capritxos aquesta setmana: ${capritxos}` : 'Cap capritx aquesta setmana'}
          </p>
        </>
      )}
    </main>
  );
}
