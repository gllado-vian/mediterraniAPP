import { IconAlertTriangle, IconArrowLeft, IconCheck, IconRefresh, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { dishStats } from '../domain/dishStats';
import { buildSwipeDeck, type SwipeCard } from '../domain/swipeDeck';
import type { IsoDate } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { DishInfo } from '../ui/DishInfo';
import { DishTile } from '../ui/DishTile';

/** Distància (px) a partir de la qual un lliscament decideix. */
const DECIDE_AT = 96;
/** Moviment màxim (px) perquè un toc compti com a toc i no com a lliscament. */
const TAP_SLOP = 8;
const FLY_MS = 220;

type Decision = 'confirm' | 'discard';

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function CapritxWarning({ warning }: { warning: NonNullable<SwipeCard['capritxWarning']> }) {
  return (
    <p className="mt-3 flex items-start gap-1.5 text-sm text-tinta">
      <IconAlertTriangle size={18} stroke={1.75} className="mt-px shrink-0 text-capritx-tinta" aria-hidden="true" />
      Fa {warning.daysSince} {warning.daysSince === 1 ? 'dia' : 'dies'} de l’últim capritx i el teu marge
      és de {warning.marginDays}. Tu decideixes.
    </p>
  );
}

export function SwipeScreen({
  date,
  onDone,
  onBack,
}: {
  /** Dia per al qual es tria (per defecte, avui). */
  date?: IsoDate;
  onDone: () => void;
  onBack: () => void;
}) {
  const status = useAppStore((s) => s.status);
  const today = useAppStore((s) => s.today);
  const days = useAppStore((s) => s.days);
  const dishes = useAppStore((s) => s.dishes);
  const settings = useAppStore((s) => s.settings);
  const categories = useAppStore((s) => s.categories);
  const confirmDinner = useAppStore((s) => s.confirmDinner);
  const forDate = date ?? today;

  // La baralla es congela en obrir la pantalla perquè no es reordeni mentre es llisca.
  const deck = useMemo(
    () => (status === 'ready' ? buildSwipeDeck({ date: forDate, today, days, dishes, settings, categories }) : []),
    [status, forDate],
  );
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<Decision | null>(null);
  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const drag = useRef<{ id: number; x: number; y: number; moved: number } | null>(null);
  const busy = useRef(false);

  const card = deck[index];
  const next = deck[index + 1];

  const decide = useCallback(
    async (decision: Decision) => {
      if (!card || busy.current) return;
      busy.current = true;
      setLeaving(decision);
      if (!prefersReducedMotion()) await new Promise((r) => setTimeout(r, FLY_MS));
      if (decision === 'confirm') {
        await confirmDinner(card.dish, forDate);
        onDone();
      } else {
        setIndex((i) => i + 1);
        setFlipped(false);
      }
      setDx(0);
      setLeaving(null);
      busy.current = false;
    },
    [card, confirmDinner, forDate, onDone],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') void decide('discard');
      if (e.key === 'ArrowRight') void decide('confirm');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide]);

  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (busy.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.x, e.clientY - d.y));
    setDx(e.clientX - d.x);
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || d.id !== e.pointerId || !card) return;
    const moved = Math.max(d.moved, Math.hypot(e.clientX - d.x, e.clientY - d.y));
    const finalDx = e.clientX - d.x;
    if (moved <= TAP_SLOP) {
      setDx(0);
      setFlipped((f) => !f);
    } else if (finalDx >= DECIDE_AT) {
      void decide('confirm');
    } else if (finalDx <= -DECIDE_AT) {
      void decide('discard');
    } else {
      setDx(0);
    }
  }

  const offset = leaving === 'confirm' ? 480 : leaving === 'discard' ? -480 : dx;
  const pull = Math.min(1, Math.abs(dx) / DECIDE_AT);
  const title = forDate === today ? 'Tria un altre plat' : 'Què vas sopar ahir?';

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col overflow-x-clip px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Tornar"
          className="-ml-2 grid size-11 place-items-center rounded-(--radius-rajola) transition-colors hover:bg-rajola/60"
        >
          <IconArrowLeft size={24} stroke={1.75} aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>

      {status === 'ready' && card ? (
        <>
          <div className="relative flex flex-1 flex-col">
            {next && (
              <div aria-hidden="true" className="absolute inset-0 flex translate-y-2 scale-[0.96] flex-col opacity-80">
                <DishTile dish={next.dish} label="" categories={categories} />
              </div>
            )}
            <DishTile
              key={card.dish.id}
              dish={card.dish}
              label={`Plat proposat: ${card.dish.name}`}
              categories={categories}
              back={<DishInfo dish={card.dish} stats={dishStats(card.dish.id, forDate, days)} categories={categories} />}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                drag.current = null;
                setDragging(false);
                setDx(0);
              }}
              className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing"
              style={{
                transform: `translateX(${offset}px) rotate(${offset / 24}deg)`,
                transition: dragging ? 'none' : `transform ${FLY_MS}ms var(--ease-out-expo)`,
              }}
              overlay={
                <>
                  {card.capritx && (
                    <span className="absolute bottom-4 left-4 rounded-(--radius-rajola) bg-ciment px-3 py-1.5 text-sm font-semibold text-capritx-tinta">
                      No recomanat
                    </span>
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute top-4 left-4 rounded-(--radius-rajola) bg-tinta px-3 py-1.5 font-semibold text-ciment"
                    style={{ opacity: dx > 0 ? pull : leaving === 'confirm' ? 1 : 0 }}
                  >
                    Aquest!
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute top-4 right-4 rounded-(--radius-rajola) bg-ciment px-3 py-1.5 font-semibold text-tinta"
                    style={{ opacity: dx < 0 ? pull : leaving === 'discard' ? 1 : 0 }}
                  >
                    Un altre
                  </span>
                </>
              }
              footer={card.capritxWarning ? <CapritxWarning warning={card.capritxWarning} /> : null}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4">
            <button
              type="button"
              onClick={() => void decide('discard')}
              className="flex h-14 items-center justify-center gap-2 rounded-(--radius-rajola) border-2 border-tinta/25 text-lg font-medium transition-colors duration-150 hover:border-tinta/50 hover:bg-rajola/50 active:bg-rajola"
            >
              <IconX size={22} stroke={2} aria-hidden="true" />
              Un altre
            </button>
            <button
              type="button"
              onClick={() => void decide('confirm')}
              className="flex h-14 items-center justify-center gap-2 rounded-(--radius-rajola) bg-tinta text-lg font-semibold text-ciment transition-[transform,background-color] duration-150 hover:bg-tinta/90 active:scale-[0.98]"
            >
              <IconCheck size={22} stroke={2.25} aria-hidden="true" />
              Aquest!
            </button>
          </div>
          <p className="pt-3 text-center text-sm text-tinta-suau">
            Llisca a la dreta si t’agrada, a l’esquerra per passar-lo i toca’l per veure més informació.
          </p>
        </>
      ) : status === 'ready' ? (
        <div className="grid flex-1 content-center justify-items-center gap-3 text-center">
          <p className="text-xl font-semibold">No queden més plats</p>
          <p className="max-w-[28ch] text-tinta-suau">Els has vist tots. Vols tornar-los a mirar?</p>
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setFlipped(false);
            }}
            className="mt-2 flex h-12 items-center gap-2 rounded-(--radius-rajola) bg-tinta px-6 font-semibold text-ciment transition-colors hover:bg-tinta/90"
          >
            <IconRefresh size={20} stroke={2} aria-hidden="true" />
            Tornar a començar
          </button>
        </div>
      ) : null}
    </main>
  );
}
