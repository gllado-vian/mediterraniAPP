---
version: 1
slug: "src-screens-settingsscreen-tsx"
primary_target: "src/screens/SettingsScreen.tsx"
related_targets: ["src/ui/AppMenu.tsx"]
---

# Superfície: Ajustos

Mode: Operate. S'hi arriba des del menú de la capçalera (Avui, La teva setmana, Ajustos).
Tasca: ajustar el marge entre capritxos, anar a Els meus plats i fer/recuperar una còpia de seguretat (exportar / importar JSON).
Estats: carregant, valor normal, als límits (0 i 30 dies, botó desactivat); còpia: exportada, fitxer invàlid, confirmació d'importar (amb o sense còpia prèvia), importada.
Constraints: paleta i icones fixades a PRODUCT.md; tot en català, to proper; cada canvi es desa al moment, sense botó de desar.

## Direction contract

Hereta la direcció **Taulell** aprovada per a la pantalla Avui (`src-screens-todayscreen-tsx.md`); no n'hi ha de nova.

- Comptador fet de tres rajoles `#E8DACA` amb juntes de 2px: −, valor, +.
- Menú: panell de rajoles sobre el ciment, amb ombra suau; la pantalla actual en tinta plena.
- Còpia de seguretat: dues rajoles (Exportar · Importar); la confirmació d'importar ocupa el seu lloc mentre és oberta. Tota la pantalla, confirmació inclosa, cap a 375×667 sense scroll.
