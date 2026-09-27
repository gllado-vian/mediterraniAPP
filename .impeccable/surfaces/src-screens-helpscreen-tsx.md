---
version: 1
slug: "src-screens-helpscreen-tsx"
primary_target: "src/screens/HelpScreen.tsx"
related_targets: ["src/ui/helpContent.ts", "src/ui/AppMenu.tsx"]
---

# Superfície: Com funciona (ajuda)

Mode: Read. S'hi arriba des del menú de la capçalera (4a opció). Es pot fer scroll; sense scroll horitzontal.
Tasca: entendre en un minut com funciona l'app. Contingut a `src/ui/helpContent.ts` (grups → apartats d'1 a 3 frases, apòstrof ’).
Constraints: paleta i icones de PRODUCT.md; veu en plural ("et proposem", "t'avisem"); textos curts.

## Direction contract

Hereta la direcció **Taulell** (`src-screens-todayscreen-tsx.md`). Refusa la pila de targetes iguals d'icona + títol + text.

- Cada grup és una llista on els apartats pengen d'un **sòcol**: una columna de rajoles amb juntes de 2px (rajoleta de 40px amb la icona Tabler en tinta i, a sota, una rajola més clara que s'allarga fins al final del text). El text va sobre el ciment, fora de cap targeta.
- Les rajoletes de mostra són reals: la setmana (quatre rajoletes de categoria) i el capritx (emmarcat en granat).
- Els colors de categoria només apareixen a les mostres (Category-Is-Field).
