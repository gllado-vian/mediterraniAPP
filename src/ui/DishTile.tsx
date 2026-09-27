import { IconInfoCircle } from '@tabler/icons-react';
import { useEffect, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { categoryInfo, DEFAULT_CATEGORIES, type CategoryDef } from '../domain/categories';
import { formatMinutes } from '../domain/format';
import type { Dish } from '../domain/types';
import { CategoryIcon } from './CategoryIcon';
import { inkOn } from './contrast';

interface DishTileProps extends HTMLAttributes<HTMLElement> {
  dish: Dish;
  label: string;
  /** Contingut sobre el camp de color (p. ex. els segells del swipe). */
  overlay?: ReactNode;
  /** Contingut extra sota el nom i el temps. */
  footer?: ReactNode;
  /** Dors de la rajola (el "+info"). Si hi és, la rajola es pot girar. */
  back?: ReactNode;
  flipped?: boolean;
  /** Gira la rajola; amb el teclat, Retorn o Espai. */
  onFlip?: () => void;
  /** Versió més baixa, per quan a sobre hi ha l'avís d'ahir. */
  compact?: boolean;
  categories?: readonly CategoryDef[];
}

/** Rajola d'un plat: camp de color de la categoria amb la icona com a motiu. */
export function DishTile({
  dish,
  label,
  overlay,
  footer,
  back,
  flipped = false,
  compact = false,
  categories = DEFAULT_CATEGORIES,
  onFlip,
  className = '',
  ...rest
}: DishTileProps) {
  const info = categoryInfo(dish.category, categories);
  const time = formatMinutes(dish.prepMinutes);
  // El dors només és al DOM mentre es veu o mentre gira (no dupliquem el nom del plat).
  const [backMounted, setBackMounted] = useState(flipped);
  useEffect(() => {
    if (flipped) setBackMounted(true);
  }, [flipped]);

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    onFlip?.();
  }

  const front = (
    <div
      aria-hidden={flipped || undefined}
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-(--radius-rajola) bg-rajola backface-hidden"
    >
      <div
        className={`relative grid flex-1 place-items-center ${compact ? 'min-h-20' : 'min-h-32'}`}
        style={{ backgroundColor: info.color }}
      >
        <CategoryIcon icon={info.icon} size={compact ? 64 : 104} stroke={1.25} color={inkOn(info.color)} />
        {overlay}
        {back && (
          <span
            aria-hidden="true"
            className="absolute right-3 bottom-3 grid size-8 place-items-center rounded-(--radius-rajola) bg-ciment/90 text-tinta"
          >
            <IconInfoCircle size={20} stroke={1.75} />
          </span>
        )}
      </div>
      <div className={compact ? 'px-5 pt-3 pb-4' : 'px-5 pt-4 pb-5'}>
        <h2 className={`${compact ? 'text-2xl' : 'text-[1.75rem]'} leading-tight font-semibold text-balance`}>
          {dish.name}
        </h2>
        <p className="mt-1.5 flex items-center gap-2 text-base text-tinta-suau">
          <span>{info.label}</span>
          {time && (
            <>
              <span aria-hidden="true">·</span>
              <span>{time}</span>
            </>
          )}
        </p>
        {footer}
      </div>
    </div>
  );

  return (
    <article
      aria-label={label}
      tabIndex={onFlip ? 0 : undefined}
      onKeyDown={onFlip ? onKeyDown : undefined}
      className={`flex max-h-160 flex-1 flex-col rounded-(--radius-rajola) perspective-[1400px] ${onFlip ? 'cursor-pointer' : ''} ${className}`}
      {...rest}
    >
      {back ? (
        <div
          className="relative flex flex-1 flex-col transition-transform duration-420 ease-out-expo transform-3d motion-reduce:transition-none"
          style={{ transform: flipped ? 'rotateY(180deg)' : undefined }}
          onTransitionEnd={() => setBackMounted(flipped)}
        >
          {front}
          {(flipped || backMounted) && (
            <div
              aria-hidden={!flipped || undefined}
              className="absolute inset-0 overflow-hidden rounded-(--radius-rajola) bg-rajola backface-hidden rotate-y-180"
            >
              {back}
            </div>
          )}
        </div>
      ) : (
        front
      )}
    </article>
  );
}
