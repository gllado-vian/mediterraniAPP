import { activeCategories, CATEGORY_PALETTE, DEFAULT_CATEGORIES, type CategoryDef } from '../domain/categories';
import { CategoryIcon } from '../ui/CategoryIcon';
import { inkOn } from '../ui/contrast';
import type { MainScreen } from '../ui/AppMenu';
import { HELP_GROUPS, type HelpTile } from '../ui/helpContent';
import { ScreenHeader } from '../ui/ScreenHeader';

/** La rajoleta del sòcol: una icona, o una mostra de com es veu a l'app. */
function Tile({ tile, categories }: { tile: HelpTile; categories: readonly CategoryDef[] }) {
  if (tile.kind === 'week') {
    // Quatre rajoletes de categoria: la setmana que s'enrajola.
    return (
      <span aria-hidden="true" className="grid size-10 grid-cols-2 gap-0.5">
        {CATEGORY_PALETTE.slice(0, 4).map(({ hex }) => (
          <span key={hex} className="rounded-[3px]" style={{ backgroundColor: hex }} />
        ))}
      </span>
    );
  }
  if (tile.kind === 'capritx') {
    return (
      <span
        aria-hidden="true"
        className="block size-10 rounded-(--radius-rajola) border-[3px] border-capritx bg-rajola/60"
      />
    );
  }
  if (tile.kind === 'category') {
    // Mostra real: la primera categoria de la casa, amb el seu color i la seva icona.
    const first = activeCategories(categories)[0] ?? DEFAULT_CATEGORIES[0];
    return (
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-(--radius-rajola)"
        style={{ backgroundColor: first.color }}
      >
        <CategoryIcon icon={first.icon} size={22} stroke={1.5} color={inkOn(first.color)} />
      </span>
    );
  }
  const TileIcon = tile.icon;
  return (
    <span aria-hidden="true" className="grid size-10 place-items-center rounded-(--radius-rajola) bg-rajola">
      <TileIcon size={22} stroke={1.75} />
    </span>
  );
}

export function HelpScreen({
  onBack,
  onNavigate,
  categories = DEFAULT_CATEGORIES,
}: {
  onBack: () => void;
  onNavigate: (screen: MainScreen) => void;
  /** Categories de la casa, per a les mostres. */
  categories?: readonly CategoryDef[];
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <ScreenHeader title="Com funciona" onBack={onBack} menu={{ current: 'help', onNavigate }} />

      <p className="mt-1 text-lg leading-snug text-balance">
        Et proposem un sopar equilibrat cada dia, pensant en tota la setmana. Tu només has de dir que sí
        o triar-ne un altre.
      </p>

      {HELP_GROUPS.map((group) => (
        <section key={group.title} className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-tinta-suau">{group.title}</h2>
          {/* El sòcol: una columna de rajoles amb juntes de 2px que ressegueix els apartats. */}
          <ol className="grid gap-0.5">
            {group.steps.map((step) => (
              <li key={step.id} className="grid grid-cols-[2.5rem_1fr] gap-x-4">
                <div className="flex flex-col gap-0.5">
                  <Tile tile={step.tile} categories={categories} />
                  <span aria-hidden="true" className="w-10 flex-1 rounded-(--radius-rajola) bg-rajola/50" />
                </div>
                <div className="pt-2 pb-5">
                  <h3 className="font-semibold">{step.title}</h3>
                  {step.body.map((sentence) => (
                    <p key={sentence} className="mt-1 leading-relaxed text-pretty text-tinta-suau">
                      {sentence}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
