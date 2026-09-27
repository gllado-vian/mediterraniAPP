import {
  IconCalendarWeek,
  IconHelpCircle,
  IconMenu2,
  IconSettings,
  IconToolsKitchen2,
  IconX,
  type Icon,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

export type MainScreen = 'today' | 'week' | 'settings' | 'help';

const ITEMS: { id: MainScreen; label: string; icon: Icon }[] = [
  { id: 'today', label: 'Avui', icon: IconToolsKitchen2 },
  { id: 'week', label: 'La teva setmana', icon: IconCalendarWeek },
  { id: 'settings', label: 'Ajustos', icon: IconSettings },
  { id: 'help', label: 'Com funciona', icon: IconHelpCircle },
];

/** Menú de la capçalera: dona accés a les pantalles principals. */
export function AppMenu({
  current,
  nested = false,
  onNavigate,
}: {
  current: MainScreen;
  /** La pantalla és dins de la secció `current` (p. ex. Els meus plats, dins d'Ajustos). */
  nested?: boolean;
  onNavigate: (screen: MainScreen) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function choose(screen: MainScreen) {
    setOpen(false);
    if (screen !== current || nested) onNavigate(screen);
  }

  const ToggleIcon = open ? IconX : IconMenu2;

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-label="Menú"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="-mr-2 grid size-11 place-items-center rounded-(--radius-rajola) transition-colors hover:bg-rajola/60"
      >
        <ToggleIcon size={24} stroke={1.75} aria-hidden="true" />
      </button>

      {open && (
        <nav
          aria-label="Menú"
          className="menu-obert absolute top-full right-0 z-40 mt-2 w-60 rounded-[8px] bg-ciment p-1 shadow-[0_8px_24px_-6px_rgb(58_66_41/0.28)]"
        >
          <ul className="grid gap-0.5">
            {ITEMS.map(({ id, label, icon: ItemIcon }) => {
              const active = id === current;
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-current={active ? (nested ? 'true' : 'page') : undefined}
                    onClick={() => choose(id)}
                    className={[
                      'flex min-h-12 w-full items-center gap-3 rounded-(--radius-rajola) px-3 text-left font-medium transition-colors',
                      active ? 'bg-tinta text-ciment' : 'bg-rajola hover:bg-rajola/70 active:bg-rajola/50',
                    ].join(' ')}
                  >
                    <ItemIcon size={20} stroke={1.75} aria-hidden="true" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
