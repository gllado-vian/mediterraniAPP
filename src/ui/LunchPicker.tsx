import { categoryInfo, isRotationCategory, LUNCH_OPTIONS, type LunchOption } from '../domain/categories';
import { textInkOn } from './contrast';

const LUNCH_LABEL: Record<LunchOption, string> = {
  peix: 'Peix',
  carn: 'Carn',
  ou: 'Ou',
  llegum: 'Llegum',
  vegetaria: 'Vegetarià',
  altre: 'Una altra cosa',
};

/**
 * Mini-taulell de 6 rajoletes amb juntes de 2px. Cada rajoleta porta la franja
 * de color de la categoria; en marcar-la, el color l'omple sencera.
 */
export function LunchPicker({
  value,
  onChange,
}: {
  value: LunchOption | undefined;
  onChange: (lunch: LunchOption | null) => void;
}) {
  return (
    <fieldset className="mb-3">
      <legend className="mb-2 text-sm font-medium text-tinta-suau">Què has dinat avui?</legend>
      <div className="grid grid-cols-3 gap-0.5">
        {LUNCH_OPTIONS.map((option) => {
          const pressed = value === option;
          const color = isRotationCategory(option) ? categoryInfo(option).color : null;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(pressed ? null : option)}
              className={[
                'relative min-h-11 overflow-hidden rounded-(--radius-rajola) px-2 text-sm font-medium transition-colors duration-150',
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
              {LUNCH_LABEL[option]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
