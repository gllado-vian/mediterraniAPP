import { CATEGORIES, type Category } from '../domain/categories';
import { inkOn } from './contrast';

/**
 * Tria d'una categoria: sis rajoletes amb juntes de 2px (com les del dinar),
 * però amb botons de ràdio perquè només se'n pot triar una.
 */
export function CategoryPicker({
  value,
  onChange,
  error,
}: {
  value: Category | null;
  onChange: (category: Category) => void;
  error?: string;
}) {
  return (
    <fieldset aria-describedby={error ? 'category-error' : undefined}>
      <legend className="mb-2 text-sm font-medium">Categoria</legend>
      <div className="grid grid-cols-3 gap-0.5">
        {CATEGORIES.map(({ id, label, color }) => {
          const checked = value === id;
          return (
            <label
              key={id}
              className={[
                'relative flex min-h-12 cursor-pointer items-center justify-center overflow-hidden rounded-(--radius-rajola) px-2 py-2 text-center text-sm leading-tight font-medium transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-tinta',
                checked ? '' : 'bg-rajola hover:bg-rajola/70',
              ].join(' ')}
              style={checked ? { backgroundColor: color, color: inkOn(color) } : undefined}
            >
              <input
                type="radio"
                name="category"
                value={id}
                checked={checked}
                onChange={() => onChange(id)}
                className="sr-only"
              />
              {!checked && (
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
              )}
              {label}
            </label>
          );
        })}
      </div>
      {error && (
        <p id="category-error" className="mt-1.5 text-sm font-medium text-capritx-tinta">
          {error}
        </p>
      )}
    </fieldset>
  );
}
