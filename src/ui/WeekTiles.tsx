import { categoryInfo } from '../domain/categories';
import { weekDates } from '../domain/dates';
import { WEEKDAY_LONG_FROM_MONDAY, WEEKDAY_SHORT } from '../domain/format';
import type { DayRecord, IsoDate } from '../domain/types';
import { textInkOn } from './contrast';

/** Fila de 7 rajoletes: cada sopar confirmat hi col·loca el color de la seva categoria. */
export function WeekTiles({
  today,
  days,
  justPlaced,
}: {
  today: IsoDate;
  days: DayRecord[];
  justPlaced?: IsoDate | null;
}) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  return (
    <ul aria-label="La teva setmana" className="grid grid-cols-7 gap-0.5">
      {weekDates(today).map((date, i) => {
        const dinner = byDate.get(date)?.dinner;
        const info = dinner?.status === 'confirmed' ? categoryInfo(dinner.category) : null;
        const isToday = date === today;
        // El capritx no compta per a cap quota: no omple la rajoleta, l'emmarca.
        const capritx = info?.id === 'capritx';
        const placed = justPlaced === date ? 'rajola-nova' : '';
        return (
          <li
            key={date}
            aria-current={isToday ? 'date' : undefined}
            aria-label={info ? `${WEEKDAY_LONG_FROM_MONDAY[i]}: ${info.label}` : undefined}
            className={[
              'relative grid aspect-square place-items-center rounded-(--radius-rajola) text-sm font-medium',
              info && !capritx ? '' : 'bg-rajola/60 text-tinta-suau',
              isToday
                ? `after:pointer-events-none after:absolute after:z-20 after:rounded-(--radius-rajola) after:ring-2 after:ring-tinta after:ring-inset ${capritx ? 'after:inset-[5px] after:rounded-[3px]' : 'after:inset-0'}`
                : '',
            ].join(' ')}
          >
            {info && !capritx && (
              <span
                data-fill
                aria-hidden="true"
                className={`absolute inset-0 rounded-(--radius-rajola) ${placed}`}
                style={{ backgroundColor: info.color }}
              />
            )}
            {capritx && (
              <span
                data-marc
                aria-hidden="true"
                className={`absolute inset-0 rounded-(--radius-rajola) border-[3px] ${placed}`}
                style={{ borderColor: info.color }}
              />
            )}
            <span
              className="relative z-10"
              style={info && !capritx ? { color: textInkOn(info.color) } : undefined}
            >
              {WEEKDAY_SHORT[i]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
