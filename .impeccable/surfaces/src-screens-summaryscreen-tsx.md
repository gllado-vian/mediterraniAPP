---
version: 1
slug: "src-screens-summaryscreen-tsx"
primary_target: "src/screens/SummaryScreen.tsx"
related_targets: ["src/ui/WeekTiles.tsx"]
---

# Superfície: La teva setmana (resum setmanal)

Mode: Operate. S'hi arriba tocant la fila de la setmana de la pantalla Avui.
Tasca: veure d'un cop d'ull quines categories ja són complertes i quines queden pendents. Només lectura.
Estats: carregant, setmana buida, parcial, tot complert; capritxos a part (cap o algun).
Constraints: paleta i icones fixades a PRODUCT.md; tot en català, to proper; cap número nutricional, només "x/y · pendent".

## Direction contract

Hereta la direcció **Taulell** aprovada per a la pantalla Avui (`src-screens-todayscreen-tsx.md`); no n'hi ha de nova.

- Les 7 rajoletes de la setmana a dalt, iguals que a Avui.
- Una rajola per categoria, juntes de 2px: pendent = rajola `#E8DACA` amb la rajoleta de color i la icona; complerta = la rajola s'omple del color de la categoria (la rajola "col·locada").
- Capritxos a part, en una línia discreta sota el taulell.
