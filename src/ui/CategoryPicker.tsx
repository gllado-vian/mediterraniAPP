import { activeCategories, CAPRITX_ID, categoryInfo, type Category, type CategoryDef } from '../domain/categories';
import { textInkOn, tileColumns } from './contrast';

/** Etiquetes curtes perquè cap rajoleta no es parteixi en dues línies. */
const SHORT_LABEL: Partial<Record<Category, string>> = { capritx: 'Capritx' };

/**
 * Tria d'una categoria (les actives + el capritx): rajoletes amb juntes de 2px (com les del dinar),
 * però amb botons de ràdio perquè només se'n pot triar una.
 */
export function CategoryPicker({
  value,
  onChange,
  error,
  categories,
}: {
  value: Category | null;
  categories: readonly CategoryDef[];
  onChange: (category: Category) => void;
  error?: string;
}) {
  const options = [...activeCategories(categories).map((c) => c.id), CAPRITX_ID].map((id) =>
    categoryInfo(id, categories),
  );
  return (
    <fieldset aria-describedby={error ? 'category-error' : undefined}>
      <legend className="mb-1 text-sm font-medium">Categoria</legend>
      <div className={`grid gap-0.5 ${tileColumns(options.length)}`}>
        {options.map(({ id, label, color }) => {
          const checked = value === id;
          return (
            <label
              key={id}
              className={[
                'relative flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-(--radius-rajola) px-1.5 pt-1 text-center text-sm leading-[1.1] font-medium transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-tinta',
                checked ? '' : 'bg-rajola hover:bg-rajola/70',
              ].join(' ')}
              style={checked ? { backgroundColor: color, color: textInkOn(color) } : undefined}
            >
              <input
                type="radio"
                name="category"
                value={id}
                checked={checked}
                onChange={() => onChange(id)}
                aria-label={SHORT_LABEL[id] ? label : undefined}
                className="sr-only"
              />
              {!checked && (
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
              )}
              {SHORT_LABEL[id] ?? label}
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
