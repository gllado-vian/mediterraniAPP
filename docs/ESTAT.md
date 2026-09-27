# Estat del projecte i traspàs entre sessions

Última actualització: 27/09/2026 · Branca: `claude/que-sopem-pwa-mvp-5kixi9`

## Fonts de veritat (llegir primer)

1. `docs/ESPECIFICACIO.md` — especificació resultant de l'entrevista (mana sobre la proposta original).
2. `PRODUCT.md` — context de producte per a Impeccable (aprovat per l'Olga).
3. `.impeccable/surfaces/src-screens-todayscreen-tsx.md` — contracte de direcció visual **Taulell** (aprovat).

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
| 6 | Registre del dinar (no bloquejant, vinculant) + avís "ahir: vas sopar X?" | 🚧 en curs: tests escrits en vermell (TDD), falta el codi |
| 7 | Resum setmanal per categoria | pendent |
| 8 | "+info" del plat | pendent |
| 9 | Export/import JSON + Ajustos (marge capritx, els meus plats) | pendent |
| 10 | Passada final d'identitat visual + `DESIGN.md` (Impeccable document) | pendent |

## On som exactament (pas 6)

Tests ja escrits i fallant pel motiu correcte (fase RED):
- `src/db/repository.test.ts`: `ensureHouse(data)` accepta la data de creació.
- `src/screens/TodayScreen.test.tsx`: blocs "dinar" i "avís d'ahir".

Falta implementar (fase GREEN):
1. `repo.ensureHouse(createdAt = new Date())`; l'store hi passa `now()` i exposa la data d'instal·lació.
2. Store: acció `markDinnerUnknown(date)`.
3. `TodayScreen`: fila "Què has dinat avui?" (grup amb 6 botons `aria-pressed`: Peix, Carn, Ou, Llegum, Vegetarià, Una altra cosa; tornar a tocar esborra; s'amaga si el sopar és confirmat) i regió "Sopar d'ahir" ("Ahir: vas sopar X?" → Sí / Una altra cosa / No ho recordo), només si la casa existia ahir i ahir no té sopar. Nova prop `onPickYesterday(date)`.
4. `SwipeScreen`: títol "Què vas sopar ahir?" quan la data no és avui.
5. `App`: estat de pantalla amb data per al swipe d'ahir; test de flux complet.

## Decisions preses durant la construcció

- Ordre de categories del pla: es queda fix (varia sol quan l'usuari tria un altre plat).
- Ingredients passats al català: pepino→cogombre, pavo→gall dindi, orègan→orenga.
- La identitat (colors + icones) ja s'aplica des del pas 4; el pas 10 és la passada global.
- Plats base ordenats segons el recetari (l'store els reordena; IndexedDB els retorna per id).
- Swipe: en cas d'empat entre categories pendents, la del plat rebutjat (el de la pantalla Avui) va després.
- Swipe: els capritxos porten el segell "No recomanat"; l'avís de marge surt a la targeta, sense passos extra.
- L'avís d'ahir no surt el dia que s'instal·la l'app (data de creació de la casa).
- Els plugins s'instal·len amb el hook `.claude/hooks/session-start.sh` (les sessions noves no ho feien soles).

## Pendents d'Impeccable (per a la sessió amb el plugin carregat)

- Tirada de direcció degradada (impeccable.style bloquejat per la xarxa de l'entorn). La direcció Taulell ja està aprovada: no cal tornar-la a triar.
- Revisió final amb `impeccable-finish-reviewer` i `DESIGN.md` amb `impeccable-documenter`: fer-ho al pas 10.
