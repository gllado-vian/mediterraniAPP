---
version: 1
slug: "src-screens-categoryformscreen-tsx"
primary_target: "src/screens/CategoryFormScreen.tsx"
related_targets: ["src/screens/CategoriesScreen.tsx", "src/ui/CategoryIcon.tsx", "src/ui/categoryCopy.ts"]
---

# Superfície: Formulari de categoria (nova / editar)

Mode: Operate. S'hi arriba des de Categories ("Afegir una categoria" o tocant el nom d'una categoria). Sense menú (pas intermedi, com el formulari de plat).
Tasca: nom (≤20 lletres), una de les 16 icones, un dels 9 colors (un per categoria), vegades per setmana (dins del que queda lliure dels 7 sopars). Esborrar amb confirmació o, si té plats propis, el motiu.
Estats: nova (color lliure i 1 vegada si hi ha lloc, si no 0), editar, errors per camp, confirmació d'esborrar, esborrat bloquejat, recuperar una d'esborrada escrivint-ne el nom.
Constraints: cap a 375×667 sense scroll en tots els estats.

## Direction contract

Hereta la direcció **Taulell**.

- Icones: taulell de 16 rajoletes (8×2) amb juntes de 2px; la triada s'omple del color triat amb la icona en `inkOn`.
- Colors: 9 rajoletes (una per color de la paleta). La triada porta la marca i un anell de tinta; les que ja fa servir una altra categoria van **ratllades** (no disponibles) i el lector de pantalla diu "(el fa servir X)".
- Vegades: comptador de tres rajoles com el marge de capritx.
