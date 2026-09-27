export const INK_DARK = '#3A4229';
export const INK_LIGHT = '#F2F2F2';
/** Tinta més fosca, només per a text petit on cap de les dues arriba a 4,5:1 (Peix, Carn). */
export const INK_DEEP = '#1F2412';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Tinta de la paleta amb més contrast sobre `background`. */
export function inkOn(background: string): string {
  return contrastRatio(INK_DARK, background) >= contrastRatio(INK_LIGHT, background)
    ? INK_DARK
    : INK_LIGHT;
}

/** Tinta per a text sobre `background`: la de la paleta si arriba a 4,5:1; si no, la més fosca. */
export function textInkOn(background: string): string {
  const ink = inkOn(background);
  return contrastRatio(ink, background) >= 4.5 ? ink : INK_DEEP;
}
