---
version: 1
slug: "src-screens-mydishesscreen-tsx"
primary_target: "src/screens/MyDishesScreen.tsx"
related_targets: ["src/screens/DishFormScreen.tsx", "src/ui/CategoryPicker.tsx"]
---

# Superfície: Els meus plats (llista i formulari)

Mode: Operate. S'hi arriba des d'Ajustos. Dins la secció Ajustos del menú.
Tasca: afegir, editar i esborrar plats propis (nom, categoria, temps, ingredients un per línia). El recetari base no s'hi mostra ni es pot tocar.
Estats: llista buida, llista amb plats; formulari nou, formulari d'edició, errors per camp, confirmació d'esborrar al mateix lloc.
Constraints: paleta i icones fixades a PRODUCT.md; tot en català, to proper; res bloquejant, cap finestra emergent.

## Direction contract

Hereta la direcció **Taulell** aprovada per a la pantalla Avui (`src-screens-todayscreen-tsx.md`); no n'hi ha de nova.

- Cada plat de la llista és una rajola amb la rajoleta de color i la icona de la categoria.
- Categoria: sis rajoletes amb juntes de 2px i franja de color a dalt; la triada s'omple del color (com la fila del dinar).
- Camps de text sobre rajola `#E8DACA`, vora de tinta en el focus i granat fosc en error.
- Esborrar en granat fosc de capritx. La confirmació ("Esborrar aquest plat? Els sopars que ja n’has fet es queden a l’historial." · No, deixa’l · Esborrar) ocupa el lloc de Desar mentre és oberta.
