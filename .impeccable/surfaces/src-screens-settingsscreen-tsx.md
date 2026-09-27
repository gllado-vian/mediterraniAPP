---
version: 1
slug: "src-screens-settingsscreen-tsx"
primary_target: "src/screens/SettingsScreen.tsx"
related_targets: ["src/ui/AppMenu.tsx"]
---

# Superfície: Ajustos

Mode: Operate. S'hi arriba des del menú de la capçalera (Avui, La teva setmana, Ajustos).
Tasca: ajustar el marge entre capritxos. Més endavant: els meus plats (9b) i còpia de seguretat (9c).
Estats: carregant, valor normal, als límits (0 i 30 dies, botó desactivat).
Constraints: paleta i icones fixades a PRODUCT.md; tot en català, to proper; cada canvi es desa al moment, sense botó de desar.

## Direction contract

Hereta la direcció **Taulell** aprovada per a la pantalla Avui (`src-screens-todayscreen-tsx.md`); no n'hi ha de nova.

- Comptador fet de tres rajoles `#E8DACA` amb juntes de 2px: −, valor, +.
- Menú: panell de rajoles sobre el ciment, amb ombra suau; la pantalla actual en tinta plena.
