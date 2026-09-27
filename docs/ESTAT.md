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
| 8 | "+info" del plat | ✅ fet + polish |
| 9 | Export/import JSON + Ajustos (marge capritx, els meus plats) | ✅ fet + polish (9a menú + marge, 9b els meus plats, 9c còpia de seguretat) |
| 10 | Passada final d'identitat visual + `DESIGN.md` (Impeccable document) | pendent |

## On som exactament (pas 10)

Pas 9 tancat en tres peces (9a menú + marge, 9b els meus plats, 9c còpia de seguretat): 203 tests en verd,
`tsc` net, polish fet, detector d'Impeccable sense findings.

**Esperant el vistiplau de l'Olga** per començar el pas 10: passada final d'identitat visual,
revisió amb `impeccable-finish-reviewer` i `DESIGN.md` amb `impeccable-documenter`.

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
- "+info": tocar la rajola del plat (swipe i Avui) la gira i ensenya el dors; tornar a tocar la torna de cara. Amb teclat, Retorn o Espai. Una icona d'informació a la cantonada del camp de color indica que es pot girar; al dors, una icona de girar.
- Dors compacte perquè hi càpiga a Avui al mòbil petit: nom, "fa X dies · X cops aquest mes" en una línia, ingredients en dues columnes (si no hi cap, es desplaça dins la rajola; la rajola no canvia de mida).
- "Cops aquest mes" = mes natural. Les dades del swipe d'ahir es calculen respecte d'ahir.
- Navegació: icona de menú a la dreta de la capçalera d'Avui, La teva setmana i Ajustos. Panell de rajoles (la pantalla actual en tinta plena); es tanca en triar, amb Escape, tocant fora o tornant a tocar la icona. El swipe no porta menú. La fletxa de Tornar es manté a La teva setmana i Ajustos.
- Ajustos · marge entre capritxos: comptador de tres rajoles (− valor +), de 0 a 30 dies, es desa a cada toc. Brief: `.impeccable/surfaces/src-screens-settingsscreen-tsx.md`.
- Els meus plats: s'hi arriba des d'Ajustos (rajola amb el recompte). Llista només de plats propis (ordre alfabètic); formulari (nom, categoria amb 6 rajoletes de ràdio, temps opcional, ingredients un per línia). Errors al costat del camp (el repositori diu a quin camp pertanyen). Esborrar amb confirmació en línia. El formulari no porta menú (és un pas intermedi, com el swipe); a Els meus plats, el menú marca Ajustos i tocar-lo hi torna. Brief: `.impeccable/surfaces/src-screens-mydishesscreen-tsx.md`. El formulari ha de cabre sencer a 375×667 sense scroll (nou i editant, amb "Esborrar el plat"): ingredients en 3 línies (es desplacen dins la caixa), temps a la mateixa fila que l'etiqueta.
- Capçalera compartida `ScreenHeader` (fletxa + títol + menú opcional) a totes les pantalles secundàries.
- Còpia de seguretat (Ajustos): el fitxer porta la casa, els ajustos, els plats propis i tots els dies (el recetari base no, ja és a l'app), amb marca `app: "que-sopem"` i `version: 1`. Es valida sencer abans de fer res; si no és vàlid: "Aquest fitxer no és una còpia de Què sopem." Importar **substitueix** tot en una sola transacció (si falla, no canvia res) i abans ensenya què hi ha al fitxer. Casella "Abans, baixa una còpia del que hi ha ara" marcada per defecte (fitxer `que-sopem-AAAA-MM-DD-abans-d-importar.json`); no surt si el mòbil no té res apuntat. Al mòbil de veritat (iOS) cal provar on va a parar el fitxer exportat.
- Tests intermitents corregits (TodayScreen): comprovaven la pantalla just després d'esperar la base de dades; ara esperen la pantalla. 0 fallades en 8 passades de la suite.

## Pendents per a passos següents

- ~~Pas 10: pista per saber que la fila de la setmana obre el resum.~~ Resolt a la 9a: el menú de capçalera porta a "La teva setmana" (la fila continua sent una drecera).

## Pendents d'Impeccable (per a la sessió amb el plugin carregat)

- Tirada de direcció degradada (impeccable.style bloquejat per la xarxa de l'entorn). La direcció Taulell ja està aprovada: no cal tornar-la a triar.
- Revisió final amb `impeccable-finish-reviewer` i `DESIGN.md` amb `impeccable-documenter`: fer-ho al pas 10.
