import { IconArrowLeft } from '@tabler/icons-react';
import type { ComponentProps } from 'react';
import { AppMenu } from './AppMenu';

/** Capçalera de les pantalles secundàries: fletxa de tornar, títol i (si cal) el menú. */
export function ScreenHeader({
  title,
  onBack,
  menu,
}: {
  title: string;
  onBack: () => void;
  menu?: ComponentProps<typeof AppMenu>;
}) {
  return (
    <header className="flex items-center gap-2 pb-3">
      <button
        type="button"
        onClick={onBack}
        aria-label="Tornar"
        className="-ml-2 grid size-11 place-items-center rounded-(--radius-rajola) transition-colors hover:bg-rajola/60"
      >
        <IconArrowLeft size={24} stroke={1.75} aria-hidden="true" />
      </button>
      <h1 className="flex-1 text-lg font-semibold">{title}</h1>
      {menu && <AppMenu {...menu} />}
    </header>
  );
}
