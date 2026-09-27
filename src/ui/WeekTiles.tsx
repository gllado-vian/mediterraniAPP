import { categoryInfo } from '../domain/categories';
import { weekDates } from '../domain/dates';
import { WEEKDAY_LONG_FROM_MONDAY, WEEKDAY_SHORT } from '../domain/format';
import type { DayRecord, IsoDate } from '../domain/types';
import { inkOn } from './contrast';

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
    <ul aria-label="La teva setmana" className="grid grid-cols-7 gap-1">
      {weekDates(today).map((date, i) => {
        const dinner = byDate.get(date)?.dinner;
        const info = dinner?.status === 'confirmed' ? categoryInfo(dinner.category) : null;
        const isToday = date === today;
        return (
          <li
            key={date}
            aria-current={isToday ? 'date' : undefined}
            aria-label={info ? `${WEEKDAY_LONG_FROM_MONDAY[i]}: ${info.label}` : undefined}
            className={[
              'relative grid aspect-square place-items-center rounded-(--radius-rajola) text-sm font-medium',
              info ? '' : 'bg-rajola/60 text-tinta-suau',
              isToday
                ? 'after:pointer-events-none after:absolute after:inset-0 after:z-20 after:rounded-(--radius-rajola) after:ring-2 after:ring-tinta after:ring-inset'
                : '',
            ].join(' ')}
          >
            {info && (
              <span
                aria-hidden="true"
                className={`absolute inset-0 rounded-(--radius-rajola) ${justPlaced === date ? 'rajola-nova' : ''}`}
                style={{ backgroundColor: info.color }}
              />
            )}
            <span className="relative z-10" style={info ? { color: inkOn(info.color) } : undefined}>
              {WEEKDAY_SHORT[i]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
