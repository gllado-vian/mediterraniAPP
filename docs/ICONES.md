# Icones de l'app

Direcció: **rajola del dia** (món Taulell), triada per l'Olga al pas 10c (27/09/2026):
la rajola del plat d'Avui en miniatura — camp de color de Peix `#6E93A8` a dalt, base
`#E8DACA` amb dues ratlles de "text" en tinta, sobre ciment `#F2F2F2` — amb el motiu
**`salad`** de [Tabler Icons](https://tabler.io/icons) (llicència MIT, outline, traç en
tinta `#3A4229`).

## Fitxers i procedència

| Fitxer | Mida | Ús | Procedència |
| --- | --- | --- | --- |
| `public/icon.svg` | vectorial | favicon, manifest (`any`) | Font. Dibuixat a mà; motiu Tabler `salad` (MIT) |
| `public/icons/icon-maskable.svg` | vectorial | font de la maskable | Font. Com `icon.svg`, amb la rajola dins la zona segura (cercle del 80%) |
| `public/icons/apple-touch-icon.png` | 180×180 | pantalla d'inici d'iOS | Generat de `public/icon.svg` |
| `public/icons/icon-192.png` | 192×192 | manifest (`any`) | Generat de `public/icon.svg` |
| `public/icons/icon-512.png` | 512×512 | manifest (`any`) | Generat de `public/icon.svg` |
| `public/icons/icon-maskable-512.png` | 512×512 | manifest (`maskable`) | Generat de `public/icons/icon-maskable.svg` |

Els PNG no s'editen mai a mà: es regeneren des dels SVG amb

```sh
node scripts/generate-icons.mjs
```

(renderitza cada SVG amb Google Chrome via Playwright a la mida exacta).
