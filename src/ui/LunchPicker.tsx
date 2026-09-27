import { categoryInfo, LUNCH_OTHER, lunchOptions, type CategoryDef, type LunchOption } from '../domain/categories';
import { textInkOn, tileColumns } from './contrast';

/**
 * Mini-taulell de rajoletes (les categories actives + "Una altra cosa") amb juntes de 2px. Cada rajoleta porta la franja
 * de color de la categoria; en marcar-la, el color l'omple sencera.
 */
export function LunchPicker({
  value,
  onChange,
  categories,
}: {
  value: LunchOption | undefined;
  categories: readonly CategoryDef[];
  onChange: (lunch: LunchOption | null) => void;
}) {
  const options = lunchOptions(categories);
  return (
    <fieldset className="mb-3">
      <legend className="mb-2 text-sm font-medium text-tinta-suau">Què has dinat avui?</legend>
      <div className={`grid gap-0.5 ${tileColumns(options.length)}`}>
        {options.map((option) => {
          const pressed = value === option;
          const other = option === LUNCH_OTHER;
          const info = other ? null : categoryInfo(option, categories);
          const color = info?.color ?? null;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(pressed ? null : option)}
              className={[
                'relative min-h-11 overflow-hidden rounded-(--radius-rajola) px-1.5 text-sm leading-tight font-medium transition-colors duration-150',
                pressed
                  ? color
                    ? ''
                    : 'bg-tinta text-ciment'
                  : 'bg-rajola hover:bg-rajola/70 active:bg-rajola/50',
              ].join(' ')}
              style={pressed && color ? { backgroundColor: color, color: textInkOn(color) } : undefined}
            >
              {!pressed && color && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: color }}
                />
              )}
              {other ? 'Una altra cosa' : info?.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
