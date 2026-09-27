---
name: Què sopem
description: La setmana s'enrajola; cada sopar confirmat col·loca una rajola de color al taulell.
colors:
  ciment: "#f2f2f2"
  rajola: "#e8daca"
  tinta: "#3a4229"
  tinta-suau: "#5b6348"
  tinta-fosca: "#1f2412"
  peix: "#6e93a8"
  carn: "#bf8275"
  ou: "#f2c166"
  llegum: "#6b6e3d"
  vegetaria: "#bcbf69"
  capritx: "#a8402e"
  lavanda: "#a395c2"
  aigua-de-cala: "#6fa89a"
  safra: "#d98f4e"
  alberginia: "#6b4a6e"
  capritx-tinta: "#8c3222"
typography:
  display:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.25
  headline:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.556
  body:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
rounded:
  junta: "2px"
  rajola: "6px"
  panell: "8px"
spacing:
  junta: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  gutter: "16px"
  rajola: "20px"
  seccio: "24px"
components:
  button-primary:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.ciment}"
    typography: "{typography.title}"
    rounded: "{rounded.rajola}"
    height: "56px"
  button-secondary:
    textColor: "{colors.tinta}"
    rounded: "{rounded.rajola}"
    height: "48px"
  button-text:
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.rajola}"
    padding: "0 12px"
    height: "44px"
  rajoleta:
    backgroundColor: "{colors.rajola}"
    textColor: "{colors.tinta}"
    typography: "{typography.label}"
    rounded: "{rounded.rajola}"
    height: "44px"
  dish-tile:
    backgroundColor: "{colors.rajola}"
    textColor: "{colors.tinta}"
    typography: "{typography.display}"
    rounded: "{rounded.rajola}"
    padding: "16px 20px 20px"
  input-field:
    backgroundColor: "{colors.rajola}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.rajola}"
    padding: "10px 12px"
  menu-panel:
    backgroundColor: "{colors.ciment}"
    rounded: "{rounded.panell}"
    padding: "4px"
    width: "240px"
  menu-item:
    backgroundColor: "{colors.rajola}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.rajola}"
    padding: "0 12px"
    height: "48px"
  menu-item-active:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.ciment}"
    rounded: "{rounded.rajola}"
    height: "48px"
---

# Design System: Què sopem

## Overview

**Creative North Star: "El Taulell"**

La setmana s'enrajola. El fons de l'app és el ciment de les juntes; cada superfície és una rajola hidràulica de color terra amb la cantonada petita, separada de la veïna per una junta de 2px. Cada plat porta a la part superior un camp de color de la seva categoria amb la icona Tabler outline gran com a motiu central, i cada sopar confirmat col·loca una rajoleta de color a la fila de la setmana. L'equilibri es llegeix com un mosaic que s'omple, mai com a números.

La densitat és la d'una eina de vespre, a una mà: una sola columna estreta, poques peces, accions al terç inferior a l'abast del polze. El món és pla i material alhora: la profunditat surt de la geometria (rajola sobre ciment, juntes, camp de color que omple o emmarca), no d'ombres ni de degradats. El refús explícit de la direcció és el tauler de targetes blanques amb mètriques i anells de progrés.

La veu és curta i propera, en català i amb tuteig ("Sopem això", "Canviar plat", "Bon profit!", "No ho recordo"), amb l'apòstrof tipogràfic (’) a tota la interfície.

**Key Characteristics:**
- Ciment `ciment` de fons, rajoles `rajola` com a única superfície, tinta verda oliva `tinta` per a tot el text.
- Juntes de 2px entre rajoles germanes; cantonada de 6px a totes les rajoles.
- Camp de color de categoria a dalt de la rajola, amb la icona outline com a motiu.
- Una sola interacció signatura: la rajola del dia es col·loca a la setmana.
- Pla: cap ombra d'elevació excepte el panell del menú.

## Colors

Una paleta vinculant de terra mediterrània: neutres de ciment i terracota pàl·lida, una tinta verda oliva i sis colors de categoria que són l'únic color saturat de la pantalla.

### Primary
- **Tinta d'oliva** (`tinta`): tot el text, les icones d'interfície, el botó primari ple ("Sopem això", "Sí", "Desar"), l'element actiu del menú, el contorn de focus i la marca d'avui a la setmana. Sobre ciment fa 9,4:1; sobre rajola, 7,7:1.

### Secondary
Els sis colors de categoria. Només apareixen com a camp de color d'un plat, com a franja o farciment d'una rajoleta, com a quadret de la icona d'una categoria i com a pic dels ingredients. Mai com a color de text ni de fons de pantalla.
- **Blau de mar** (`peix`): Peix.
- **Terracota rosada** (`carn`): Carn magra.
- **Groc de rovell** (`ou`): Ou. També el fons de la selecció de text.
- **Oliva fosca** (`llegum`): Llegum.
- **Verd d'olivó** (`vegetaria`): Vegetarià pur.
- **Lavanda** (`lavanda`), **Aigua de cala** (`aigua-de-cala`), **Safrà** (`safra`) i **Albergínia** (`alberginia`): colors addicionals per a les categories que crea l’usuari, proposats amb Impeccable (colorize) i aprovats per la propietària. Mateixa família de terra i mar apagada; cap no queda més a prop d’un altre que els parells que ja existien (Ou–Vegetarià), ni tampoc per a daltonisme vermell-verd. Icona i text en tinta (text en tinta fosca sobre Lavanda, Aigua de cala i Safrà) i en ciment sobre Albergínia. **Un color per categoria**: com a màxim 9 categories actives.
- **Granat de rajola** (`capritx`): Capritx per un dia. Mateixa família que Carn; es distingeixen per forma (ple / marc), icona i nom. Decisió de la propietària: la paleta es queda com està.

### Tertiary
- **Granat d'avís** (`capritx-tinta`): el mateix to del capritx enfosquit perquè el text petit arribi a 4,5:1 (5,9:1 sobre rajola). Errors de formulari, avís de marge entre capritxos, segell "No recomanat", accions destructives ("Esborrar el plat"; el botó "Esborrar" de la confirmació és granat d’avís ple amb text ciment).

### Neutral
- **Ciment de junta** (`ciment`): fons de tota l'app, color que es veu a les juntes, text sobre tinta plena, fons del panell del menú i dels segells sobre el camp de color.
- **Rajola crua** (`rajola`): l'única superfície: rajola del plat, rajoletes, files de llista, camps de formulari, avisos. Estats de hover i premut amb la mateixa rajola a 70% i 50%; buit de la setmana a 60%.
- **Tinta suau** (`tinta-suau`): text secundari (categoria · temps, llegendes, recomptes, "x/y · pendent"). 4,6:1 sobre rajola.
- **Tinta fosca** (`tinta-fosca`): no és un color de paleta sinó una variant de la tinta per a text petit on ni tinta ni ciment arriben a 4,5:1. A la pràctica, només sobre Peix i Carn.

### Named Rules
**The Ink-On Rule.** Tota icona o text sobre un color de categoria es tria per contrast, mai a mà. Icones: `inkOn` (la tinta de paleta amb més contrast, ≥3:1): tinta sobre Peix, Carn, Ou i Vegetarià; ciment sobre Llegum i Capritx. Text: `textInkOn` (≥4,5:1): la mateixa tinta si hi arriba; si no, tinta fosca. Tinta fosca només apareix sobre Peix i Carn.

**The Category-Is-Field Rule.** Un color de categoria sempre és superfície (camp, franja, farciment o marc), mai text. El text que ha de dir "capritx" o "error" fa servir granat d'avís.

**The Capritx Frame Rule.** El capritx no compta per a cap quota, i per això a la setmana no omple la rajoleta: l'emmarca amb una vora de 3px en granat. Si és avui, la marca d'avui va per dins del marc.

## Typography

**Display Font:** Figtree Variable (amb ui-sans-serif, system-ui)
**Body Font:** Figtree Variable

**Character:** Una sola família geomètrica i amable, en tres pesos (400, 500, 600). La jerarquia surt de la mida i el pes, mai de majúscules, espaiat ni colors.

### Hierarchy
- **Display** (600, 1.75rem, 1.25): el nom del plat a la rajola d'Avui i del swipe. En la rajola compacta baixa a 1.5rem. Amb `text-balance`.
- **Headline** (600, 1.25rem, 1.25): el nom al dors de la rajola i els estats buits ("No queden més plats").
- **Title** (600, 1.125rem): el títol de pantalla a la capçalera (la data a Avui) i l'etiqueta del botó primari i del swipe.
- **Body** (400, 1rem, 1.5): text corrent, categoria · temps sota el nom del plat, camps de formulari. Textos d'estat buit limitats a 28–34ch.
- **Label** (500, 0.875rem): llegendes de fieldset, rajoletes de dinar i de categoria, etiquetes de camp, accions de text. El text secundari petit va en 400 i tinta suau.

### Named Rules
**The Plain Case Rule.** Cap etiqueta en majúscules ni amb espaiat ampliat; no hi ha titolets sobre els títols. Una llegenda és una frase normal ("Què has dinat avui?").

**The Tabular Count Rule.** Els valors numèrics que canvien al lloc (comptador del marge, minuts al formulari) porten xifres tabulars.

## Layout

Mobile first, una sola columna centrada de 28rem d'amplada màxima amb un marge lateral de 16px i els marges segurs del dispositiu (superior mínim 16px, inferior mínim 24px). A escriptori, la mateixa columna al centre del ciment; no hi ha disposició diferent.

Totes les pantalles comparteixen el mateix marge superior i la mateixa capçalera de 44px d'alçada, de manera que el títol no salta en canviar de pantalla. A Avui, la rajola del plat creix per omplir l'espai (camp de color mínim de 128px, 80px en compacte, rajola màxima de 640px) i les accions queden al terç inferior.

Ritme: 2px de junta entre rajoles germanes (setmana, dinar, categoria, comptador, còpia de seguretat, llistes, menú), 8px entre botons d'acció independents, 12px entre blocs d'una pantalla, 24px abans d'una secció nova. Dins la rajola, 20px de farciment lateral.

### Named Rules
**The First Viewport Rule.** Avui (amb l'avís d'ahir obert i noms de dues línies), el formulari de plat (nou i editant) i Ajustos (inclosa la confirmació d'importar) caben sencers a 375×667 sense scroll. Quan no hi caben, es compacta la peça (rajola compacta, ingredients en tres línies que es desplacen dins la caixa, dors que es desplaça dins la rajola), mai s'afegeix scroll a la pantalla.

**The Thumb Rule.** Tot objectiu tàctil fa com a mínim 44px d'alçada; el primari fa 56px. L'acció principal és sempre l'última peça gran de la columna.

## Elevation & Depth

El sistema és pla. La profunditat la dona el material: rajola crua sobre ciment, juntes que en marquen els límits, un camp de color que omple o emmarca. L'únic volum real és el gir 3D de la rajola i la pila del swipe (la rajola de sota, un 4% més petita, 8px més avall i al 80% d'opacitat).

### Shadow Vocabulary
- **Panell flotant** (`box-shadow: 0 8px 24px -6px rgb(58 66 41 / 0.28)`): només el panell del menú, que és l'únic element que surt per sobre del contingut. Ombra suau tenyida de tinta, mai negra.
- **Línia de camp** (`box-shadow: inset 0 -1px 0 rgb(58 66 41 / 0.3)`): no és elevació, és una línia de base d'1px en tinta dins dels camps de text perquè es llegeixin com a camp sobre la rajola.

### Named Rules
**The Flat Tile Rule.** Cap rajola, botó ni fila porta ombra. Si un element necessita separar-se, es separa amb una junta, amb un canvi de to (rajola / ciment / tinta) o amb un marc, no amb una ombra.

## Shapes

Una sola cantonada: 6px a totes les rajoles, botons, camps, rajoletes, segells i quadrets d'icona. El panell del menú és l'única peça a 8px. El marc interior de la marca d'avui sobre un capritx fa 3px, i el pic dels ingredients és un quadret de 8px amb 2px de cantonada (una rajoleta minúscula, no un punt).

Les formes són quadrades o rectangulars, com peces d'un taulell: rajoletes de la setmana quadrades (1:1), quadret de la icona de categoria de 40px, franja superior de 4px a les rajoletes de dinar i de categoria no marcades. El color d'una categoria sempre entra per dalt o omple la peça sencera.

### Named Rules
**The Top Field Rule.** El color de categoria d'una rajola ocupa la part superior (camp de color a la rajola del plat, franja de 4px a les rajoletes) o la peça sencera quan està marcada o complerta. Mai una franja lateral.

## Components

### Buttons
Peces de tinta plena o de rajola; mai contorns acolorits ni degradats.
- **Shape:** cantonada de rajola (6px).
- **Primary:** tinta plena, text ciment en semibold, 56px d'alçada i amplada sencera ("Sopem això", "Desar", "Afegir un plat"). Al swipe i a l'avís d'ahir, 56px i 44px.
- **Hover / Active:** tinta al 90% en passar-hi; en prémer, s'encongeix a 0,98 (150ms). Desactivat: 70% d'opacitat.
- **Secondary:** vora de 2px en tinta al 25%, sense fons; en passar-hi, vora al 50% i rajola al 50% ("Canviar plat", "Un altre", "Deixar-ho com està", "No, deixa’l"). 48px.
- **Text:** acció de text subratllada amb subratllat de tinta al 40% i desplaçament de 4px, 44px d'alçada ("Desfer", "Un altre plat", "No ho recordo"). Les destructives van en granat d'avís.
- **Icon:** 44px quadrat, sense fons; rajola al 60% en passar-hi (tornar, menú).

### Rajoletes (chips)
- **Style:** rajola amb franja superior de 4px del color de la categoria; 44px, label 500, juntes de 2px en graella de 3 columnes.
- **State:** marcada, el color de la categoria l'omple sencera i el text passa per `textInkOn`. "Una altra cosa" marcada va en tinta plena. Al dinar és un botó que es marca i es desmarca; a la categoria del formulari són botons de ràdio amb la rajoleta com a etiqueta.

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** rajola. L'avís d'ahir i la confirmació d'importar són una rajola amb 12px de farciment; les files de llista (Els meus plats, resum) són rajoles de 56–64px amb el quadret d'icona de 40px a l'esquerra.
- **Shadow Strategy:** cap (vegeu Elevation & Depth).
- **Border:** cap.

### Inputs / Fields
- **Style:** rajola plena, vora transparent de 2px, línia de base d'1px en tinta, 10px × 12px de farciment, text 16px.
- **Focus:** la vora passa a tinta; sense halo.
- **Error:** vora en granat d'avís i missatge a sota, al costat del camp, en label granat d'avís.

### Navigation
- **Capçalera:** títol a l'esquerra (la data a Avui; fletxa de tornar + títol a les pantalles secundàries), icona de menú a la dreta a Avui, La teva setmana, Ajustos i Els meus plats. El swipe i el formulari no porten menú.
- **Menú:** panell de ciment de 240px amb 4px de farciment, amb tres rajoles de 48px (icona + nom) separades per juntes; la pantalla actual en tinta plena. Es tanca en triar, amb Escape, tocant fora o tornant a tocar la icona.

### Rajola del plat (signatura)
Rajola amb camp de color de categoria a dalt (mínim 128px; 80px en compacte) i la icona outline de la categoria centrada (104px, traç 1,25; 64px en compacte), color per `inkOn`. A sota, nom en display i "categoria · temps" en tinta suau. Una icona d'informació en un quadret de ciment de 32px a la cantonada inferior dreta del camp indica que es pot girar.
- **Gir:** tocar-la (o Retorn / Espai) la gira 180° sobre l'eix vertical (420ms, `ease-out-expo`, perspectiva de 1400px) i ensenya el dors: nom, "fa X dies · X cops aquest mes" en una línia i els ingredients en dues columnes; al dors, una icona de girar. La rajola no canvia de mida en girar.
- **Swipe:** la rajola segueix el dit i s'inclina (desplaçament / 24 graus); surt en 220ms amb `ease-out-expo`. Segells de 6px de cantonada sobre el camp: "Aquest!" en tinta plena, "Un altre" en ciment, "No recomanat" en ciment amb text granat d'avís.

### Fila de la setmana (signatura)
Set rajoletes quadrades Dl–Dg amb juntes de 2px. Buida: rajola al 60% amb el dia en tinta suau. Confirmada: plena del color de la categoria, dia per `textInkOn`. Capritx: marc de 3px en granat, sense farciment. Avui: anell interior de 2px en tinta. A la pantalla Avui, tota la fila és un botó que obre La teva setmana.
- **Col·locar la rajola:** en confirmar el sopar, la rajoleta d'avui creix de 0,55 a 1 mentre el color s'obre des del centre (retall que s'expandeix fins a la cantonada de 6px), 520ms amb `ease-out-expo`. És l'única animació d'entrada de contingut.

### Comptador
Tres rajoles de 56px amb juntes de 2px (−, valor, +), valor en title tabular. Als límits (0 i 30), el botó queda al 40% d'opacitat. Es desa a cada toc.

## Do's and Don'ts

### Do:
- **Do** fer servir `ciment` de fons i `rajola` com a única superfície; separar les peces germanes amb juntes de 2px.
- **Do** posar el color de categoria a dalt de la rajola o omplint-la sencera, i triar la tinta de sobre amb `inkOn` (icones, ≥3:1) o `textInkOn` (text, ≥4,5:1).
- **Do** emmarcar el capritx (vora de 3px) a la setmana, no omplir-lo.
- **Do** fer servir icones Tabler outline: 20–24px amb traç 1,75 a la interfície, 22px amb traç 1,5 dins el quadret de categoria, 104px amb traç 1,25 com a motiu.
- **Do** mantenir Avui, el formulari i Ajustos sencers a 375×667; compactar la peça abans de deixar que la pantalla faci scroll.
- **Do** escriure curt, en català, amb tuteig i apòstrof tipogràfic (’).
- **Do** respectar `prefers-reduced-motion`: sense col·locació de rajola, sense entrada del menú, gir instantani i swipe sense vol.
- **Do** mostrar el focus amb un contorn de 2px en tinta a 3px de distància.

### Don't:
- **Don't** posar franges laterals de color a cap rajola, avís ni fila.
- **Don't** fer servir ombres, excepte l'ombra suau del panell del menú (i la línia de base dels camps, que no és elevació).
- **Don't** fer servir degradats ni ombres de colors.
- **Don't** omplir la rajoleta d'un capritx a la setmana.
- **Don't** fer servir un color de categoria com a color de text; per a text d'avís, granat d'avís.
- **Don't** fer servir tinta fosca com a color general; és només per a text petit sobre Peix i Carn.
- **Don't** mostrar números nutricionals, mètriques ni anells de progrés; el progrés és la rajola plena.
- **Don't** posar titolets en majúscules ni etiquetes espaiades sobre els títols.
- **Don't** fer servir fotos de plats ni icones farcides; el motiu d'un plat és la seva icona outline.
- **Don't** preguntar "Segur?": les confirmacions diuen què passarà i els botons diuen l’acció ("Substituir les dades" / "Deixar-ho com està", "Esborrar" / "No, deixa’l").
