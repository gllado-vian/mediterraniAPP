# Què sopem — Especificació de l'MVP (beta)

Resultat de l'entrevista de definició (27/09/2026). Complementa i **corregeix**
la proposta original: on hi hagi discrepància, mana aquest document.

## 1. Objectiu

Resoldre en pocs segons "què sopem avui" mantenint una dieta d'inspiració
mediterrània per rotació de categories, sense càlculs visibles ni planificació
conscient.

## 2. Usuari

Una sola casa per dispositiu (persona sola, parella o família). Tothom menja el
mateix sopar. Sense login ni backend: PWA local-first, dades a IndexedDB.

## 3. Flux diari

1. En obrir l'app, si ahir no hi ha sopar confirmat → avís no bloquejant
   "Ahir: vas sopar X?" → **Sí** / **Una altra cosa** (swipe per a ahir) /
   **No ho recordo** (queda en blanc). Només per al dia anterior.
2. Fila opcional "Què has dinat avui?": Peix · Carn · Ou · Llegum · Vegetarià ·
   Una altra cosa. No bloqueja; si es dona, és **vinculant**.
3. Targeta "plat del dia". Si repeteix la categoria del dinar se substitueix
   automàticament ("Canviat perquè has dinat peix").
4. **Confirmar** o **Canviar plat** (swipe).
5. El dinar es pot canviar mentre el sopar no estigui confirmat.

## 4. Categories i quotes setmanals (dilluns → diumenge)

| Categoria | Sopars/setm. | Color | Icona |
| --- | --- | --- | --- |
| Peix | 2 | `#6E93A8` | IconFish |
| Ou | 2 | `#F2C166` | IconEgg |
| Llegum | 1 | `#6B6E3D` | IconSoup |
| Carn magra | 1 | `#BF8275` | IconMeat |
| Vegetarià pur | 1 | `#BCBF69` | IconCarrot |
| **Capritx per un dia** | no computa | `#A8402E` | IconChefHat |

**Capritx per un dia** (unifica "menjar fora" i "menjar ràpid"):
- Mai es proposa ni es recomana. Només surt al final del swipe, separat:
  "Capritx per un dia · no recomanat".
- Inclou: *Fora de casa*, *Pizza casolana*, *Croquetes casolanes* (+ propis).
- No computa a cap quota: la categoria d'aquell dia queda pendent.
- Marge mínim entre capritxos: **7 dies** per defecte, configurable a Ajustos.
  Si no s'ha complert → **avís**, però es pot confirmar igualment.

## 5. Generador (pla dinàmic)

Es recalcula cada dia per als dies restants de la setmana segons el que s'ha
confirmat. Prioritat de regles (guanya la primera):

1. No repetir la categoria del dinar d'avui.
2. No repetir la categoria del sopar d'ahir.
3. Completar quotes pendents (planificant endavant per evitar atzucacs).

Si cap categoria pendent és vàlida → es proposa una categoria ja complerta
vàlida; la quota perduda no es penalitza visiblement.

**Selecció de plat dins la categoria:** primer plats propis de la casa, després
recetari base; dins de cada grup, el que fa més temps que no es menja. No es
repeteix un plat dins la mateixa setmana si hi ha alternativa.

## 6. Swipe

- Dreta = confirmar · Esquerra = descartar · Tocar = "+info" sense descartar.
- Ordre: categories pendents vàlides → categories complertes vàlides →
  separador Capritx. Les categories vetades avui (dinar, sopar d'ahir) **no
  surten**.

## 7. "+info"

Temps de preparació, ingredients, dies des de l'últim cop, cops aquest mes.

## 8. Resum setmanal

Una fila per categoria: ✓ complerta o "1/2 · pendent". Capritxos a part.

## 9. Recetari

- **Base** (20 plats de la proposta, amb pizza i croquetes a Capritx): no es
  pot editar ni esborrar.
- **Plats propis**: formulari mínim (nom, ingredients, temps, categoria triada a
  mà). Editables i esborrables. Tenen prioritat sobre el base.

## 10. Ajustos

Marge de capritx · Els meus plats · Exportar / Importar JSON (tota la info).

## 11. To i UI

- Tot en català. Textos curts, directes i propers (tuteig, gens robòtics).
- Mobile first; navegació mínima i optimitzada (polze, una mà).
- Fons `#F2F2F2`, targetes `#E8DACA`, text `#3A4229`. Icones `@tabler/icons-react`.

## Fora de l'MVP

Rebost, llista de la compra, caducitats, tuppers, primer/segon plat, postres,
proposta automàtica de categoria per nom, sincronització al núvol.

## Supòsits pendents de validar

- "Modificar el recetari base" s'interpreta com **completar-lo** amb plats
  propis; els plats base són immutables.
