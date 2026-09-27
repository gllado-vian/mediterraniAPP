# Estat del projecte i traspàs entre sessions

Última actualització: 27/09/2026 · Branca: `claude/que-sopem-pwa-mvp-5kixi9`

## Fonts de veritat (llegir primer)

1. `docs/ESPECIFICACIO.md` — especificació resultant de l'entrevista (mana sobre la proposta original).
2. `PRODUCT.md` — context de producte per a Impeccable (aprovat per l'Olga).
3. `.impeccable/surfaces/src-screens-todayscreen-tsx.md` — contracte de direcció visual **Taulell** (aprovat). Les altres pantalles l'hereten (`.impeccable/surfaces/`).

## Mètode de treball acordat

- **Superpowers TDD** a cada pas: test primer, veure'l fallar, codi mínim, refactor. `npm test` i `npx tsc --noEmit` nets abans de cada commit.
- **Impeccable**: `/impeccable polish` en acabar cada pantalla (passos 4, 5, 7, 8 i 10); detector sense findings.
- **Pas a pas**: acabar cada peça, fer commit + push, i **ensenyar-la a l'Olga abans de passar a la següent**.
- Tot en català; textos curts, directes i propers.
- No implementar res de les "idees futures".

## Progrés

| Pas | Peça | Estat |
| --- | --- | --- |
| 1 | Model de dades local (idb) | ✅ fet |
| 2 | Recetari base (20 plats + "Fora de casa") | ✅ fet |
| 3 | Generador del pla setmanal dinàmic | ✅ fet |
| 4 | Pantalla "plat del dia" + botó cap al swipe | ✅ fet + polish |
| 5 | Swipe de plats (ordenat per equilibri pendent; capritxos al final) | ✅ fet (tocar la targeta obrirà el +info al pas 8) |
| 6 | Registre del dinar (no bloquejant, vinculant) + avís "ahir: vas sopar X?" | ✅ fet + polish |
| 7 | Resum setmanal per categoria | ✅ fet + polish |
| 8 | "+info" del plat | pendent |
| 9 | Export/import JSON + Ajustos (marge capritx, els meus plats) | pendent |
| 10 | Passada final d'identitat visual + `DESIGN.md` (Impeccable document) | pendent |

## On som exactament (pas 8)

Pas 7 tancat (132 tests en verd, `tsc` net, polish de "La teva setmana" fet,
detector d'Impeccable sense findings). **Esperant el vistiplau de l'Olga** per
començar el pas 8 ("+info" del plat), també amb TDD.

## Decisions preses durant la construcció

- Ordre de categories del pla: es queda fix (varia sol quan l'usuari tria un altre plat).
- Ingredients passats al català: pepino→cogombre, pavo→gall dindi, orègan→orenga.
- La identitat (colors + icones) ja s'aplica des del pas 4; el pas 10 és la passada global.
- Plats base ordenats segons el recetari (l'store els reordena; IndexedDB els retorna per id).
- Swipe: en cas d'empat entre categories pendents, la del plat rebutjat (el de la pantalla Avui) va després.
- Swipe: els capritxos porten el segell "No recomanat"; l'avís de marge surt a la targeta, sense passos extra.
- L'avís d'ahir no surt el dia que s'instal·la l'app (data de creació de la casa).
- Els plugins s'instal·len amb el hook `.claude/hooks/session-start.sh` (les sessions noves no ho feien soles). Sense `-y`: la versió actual de Claude Code no l'accepta.
- Dinar: mini-taulell de 6 rajoletes (juntes de 2px) amb la franja de color de la categoria; en marcar-la, el color l'omple. S'amaga quan el sopar és confirmat.
- Avís d'ahir: rajola amb la icona de la categoria del plat que tocava (no franja lateral de color, que Impeccable prohibeix). El plat és el que el generador hauria proposat ahir.
- Rajola del plat: camp de color mínim de 128px (abans 192px) perquè "Sopem això" càpiga al mòbil petit (375×667) amb l'avís d'ahir obert.
- Si Impeccable no es carrega en una sessió de VS Code, cal reiniciar la sessió.
- Resum setmanal: s'hi arriba tocant la fila de 7 rajoletes d'Avui (botó que la cobreix; la llista es manté per als lectors de pantalla). Pantalla "La teva setmana" amb les 7 rajoletes, una rajola per categoria (complerta = plena del color de la categoria; pendent = "x/y · pendent") i els capritxos a part. Brief: `.impeccable/surfaces/src-screens-summaryscreen-tsx.md`.
- Fila de la setmana (Avui i resum): el dia de capritx no s'omple, queda emmarcat en granat (no compta per a cap quota). Si és avui, la marca d'avui va per dins del marc.
- Carn (`#BF8275`) i Capritx (`#A8402E`) són de la mateixa família de color; es distingeixen per forma (ple / marc), icona i nom. L'Olga decideix deixar la paleta com està; si costa distingir-los provant l'app, revisar-ho al pas 10.

## Pendents d'Impeccable (per a la sessió amb el plugin carregat)

- Tirada de direcció degradada (impeccable.style bloquejat per la xarxa de l'entorn). La direcció Taulell ja està aprovada: no cal tornar-la a triar.
- Revisió final amb `impeccable-finish-reviewer` i `DESIGN.md` amb `impeccable-documenter`: fer-ho al pas 10.
