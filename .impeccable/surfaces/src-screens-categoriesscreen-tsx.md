---
version: 1
slug: "src-screens-categoriesscreen-tsx"
primary_target: "src/screens/CategoriesScreen.tsx"
related_targets: ["src/screens/SettingsScreen.tsx", "src/domain/categoryRules.ts"]
---

# Superfície: Categories

Mode: Operate. S'hi arriba des d'Ajustos (fila "Categories", a continuació d'"Els meus plats") i des de l'estat buit d'Avui. Dins la secció Ajustos del menú.
Tasca: triar quantes vegades per setmana es vol cada categoria (0–7, com a molt 7 sopars en total) i esborrar les que no es fan servir. Crear i editar: formulari de categoria (peça 5).
Estats: setmana plena (tots els + desactivats), setmana amb dies lliures ("Els dies que sobrin, en proposarem de les que tens."), categoria sense plats ("Encara no té plats"), categoria a 0 ("No es proposa mai · Esborrar-la"), confirmació d'esborrar al mateix lloc, esborrat impossible perquè té plats propis.
Constraints: paleta de 9 colors (un per categoria) i icones Tabler outline; tot en català, to proper; cada canvi es desa al moment; cap a 375×667 sense scroll fins i tot amb 9 categories i avisos.

## Direction contract

Hereta la direcció **Taulell** (`src-screens-todayscreen-tsx.md`).

- Cada categoria és una rajola `#E8DACA` amb juntes de 2px: rajoleta de 40px del seu color amb la icona, nom, i comptador de tres peces (−, valor, +) amb rajoles de ciment de 44px.
- L'avís de 0 vegades és una sola línia en granat d'avís sota el nom; no allarga la fila més del necessari. La confirmació o el motiu per no poder esborrar s'obren només en tocar "Esborrar-la".
