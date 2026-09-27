---
version: 1
slug: "src-screens-todayscreen-tsx"
primary_target: "src/screens/TodayScreen.tsx"
related_targets: []
---

# Superfície: Avui (plat del dia)

Mode: Operate. Usuari al vespre, mòbil a una mà, vol saber què sopar en segons.
Tasca: veure la proposta, confirmar-la o obrir el swipe per canviar-la.
Estats: carregant, proposta, proposta substituïda pel dinar, confirmat (amb desfer).
Constraints: paleta i icones fixades a PRODUCT.md; tot en català, to proper.

## Direction contract

THESIS: La setmana s'enrajola: cada sopar confirmat col·loca una rajola de color al taulell de la setmana. Refusa el tauler de targetes blanques amb mètriques i anells de progrés.

OWN-WORLD: Fons #F2F2F2 com el ciment de les juntes; rajoles #E8DACA amb cantonada petita (6px) i juntes de 2px; cada plat porta un camp de color de categoria que ocupa la part superior de la rajola, amb la icona Tabler outline gran com a motiu central en #3A4229. Text #3A4229, tipografia Figtree. Sense ombres de colors ni degradats.

STORY: L'usuari veu quin plat toca i per què (categoria), confirma amb un toc amb el polze o el canvia; en confirmar, veu com la rajola del dia es col·loca a la fila de la setmana.

FIRST VIEWPORT: Capçalera curta amb el dia ("Dilluns, 28 de setembre"). Rajola gran del plat al centre (camp de color amb icona + nom + temps). Accions al terç inferior a l'abast del polze: "Sopem això" primari (#3A4229 ple) i "Canviar plat" secundari. A sota, fila de 7 rajoletes Dl–Dg.

FORM: Rajola hidràulica / taulell, posició 3 de la llista ordenada; seed key e790d706 (tirada degradada, sense challengers). Interacció signatura: col·locar la rajola del dia (escala + reompliment de color) en confirmar.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
