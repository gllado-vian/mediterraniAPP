/** "No la pots esborrar: hi tens 2 plats propis. Canvia'ls de categoria o esborra'ls primer." */
export function inUseMessage(count: number): string {
  return count === 1
    ? 'No la pots esborrar: hi tens 1 plat propi. Canvia’l de categoria o esborra’l primer.'
    : `No la pots esborrar: hi tens ${count} plats propis. Canvia’ls de categoria o esborra’ls primer.`;
}

/** Per a "Tornar a les recomanades" quan les categories pròpies tenen plats. */
export function resetInUseMessage(count: number): string {
  return count === 1
    ? 'No hi podem tornar: les categories que has creat tenen 1 plat propi. Canvia’l de categoria o esborra’l primer.'
    : `No hi podem tornar: les categories que has creat tenen ${count} plats propis. Canvia’ls de categoria o esborra’ls primer.`;
}
