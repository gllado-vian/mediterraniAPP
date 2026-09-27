# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

PWA local-first: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + idb
(IndexedDB) + vite-plugin-pwa. Sense backend ni comptes. Tests amb Vitest.

## Users

Una casa (persona sola, parella o família amb nens/adolescents) que vol sopar
equilibrat sense haver de pensar-hi. Obre l'app al vespre, sovint amb el mòbil a
una mà mentre decideix què cuinar. Primer usuari: l'Olga, provant-la sola 1–2
setmanes abans de compartir-la amb gent propera. No és un producte comercial.

## Product Purpose

Respondre "què sopem avui?" en pocs segons, garantint al llarg de la setmana una
rotació d'inspiració mediterrània (Peix 2, Ou 2, Llegum 1, Carn magra 1,
Vegetarià 1) sense càlculs visibles. Èxit: l'usuari confirma el sopar en segons
i les quotes setmanals es compleixen sense que hi hagi pensat.

## Positioning

Rotació per categories en lloc de calories: un pla dinàmic que es recalcula cada
dia segons el que s'ha menjat i el que s'ha dinat, amb un swipe per canviar de
plat ordenat pel que falta per equilibrar la setmana.

## Operating Context

- Cicle diari: (opcional) registrar la categoria del dinar → veure el plat del
  dia → confirmar o canviar amb swipe.
- Si ahir no es va confirmar, un avís no bloquejant ho pregunta.
- "Capritx per un dia" (fora de casa, pizza, croquetes…) només a demanda, al
  final del swipe, amb un marge mínim entre capritxos (7 dies per defecte).
- Dades només al dispositiu; export/import JSON per canviar de mòbil.

## Capabilities and Constraints

- Recetari base de 20 plats, immutable; plats propis de la casa amb prioritat.
- Una casa per dispositiu; les dades d'una casa mai es barregen amb les d'una altra.
- Fora de l'MVP: rebost, llista de la compra, tuppers, primer/segon plat,
  postres, sincronització al núvol.
- Especificació completa: `docs/ESPECIFICACIO.md`.

## Brand Commitments

- Nom: **Què sopem**. Tot en català.
- Veu: textos curts, directes i propers; tuteig; amigable, mai robòtic.
- Paleta vinculant: fons `#F2F2F2`, superfície/targetes `#E8DACA`, text
  `#3A4229`. Categories: Peix `#6E93A8`, Carn magra `#BF8275`, Ou `#F2C166`,
  Llegum `#6B6E3D`, Vegetarià pur `#BCBF69`, Capritx per un dia `#A8402E`.
- Icones: `@tabler/icons-react`, versió outline (IconFish, IconMeat, IconEgg,
  IconSoup, IconCarrot, IconChefHat).
- Sense fotos de plats a l'MVP.

## Evidence on Hand

Cap testimoni ni dada d'ús encara. No inventar-ne.

## Product Principles

1. Zero fricció: cap pantalla de configuració complexa, res bloquejant.
2. L'app decideix, l'usuari només ratifica o canvia.
3. L'equilibri és invisible: cap número nutricional a la vista.
4. Mobile first, usable amb el polze i una sola mà.
5. Les dades són de la casa i viuen al seu dispositiu.
