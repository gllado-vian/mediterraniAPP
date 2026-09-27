import {
  IconArrowsExchange,
  IconBowl,
  IconDeviceMobile,
  IconDownload,
  IconHistory,
  IconInfoCircle,
  IconNotebook,
  IconToolsKitchen2,
  type Icon,
} from '@tabler/icons-react';

/** Què porta la rajoleta del sòcol: una icona o una mostra real de l'app. */
export type HelpTile = { kind: 'icon'; icon: Icon } | { kind: 'week' } | { kind: 'capritx' };

export interface HelpStep {
  id: string;
  title: string;
  tile: HelpTile;
  /** D'una a tres frases curtes. */
  body: string[];
}

export interface HelpGroup {
  title: string;
  steps: HelpStep[];
}

const icon = (i: Icon): HelpTile => ({ kind: 'icon', icon: i });

export const HELP_GROUPS: HelpGroup[] = [
  {
    title: 'Cada vespre',
    steps: [
      {
        id: 'ahir',
        title: 'El sopar d’ahir',
        tile: icon(IconHistory),
        body: ['Si ahir no el vas apuntar, et preguntem si vas sopar el que tocava: Sí, Un altre plat o No ho recordo.'],
      },
      {
        id: 'dinar',
        title: 'Què has dinat avui?',
        tile: icon(IconBowl),
        body: ['Si ens dius què has dinat, no et proposarem el mateix per sopar. No és obligatori.'],
      },
      {
        id: 'plat',
        title: 'El plat del dia',
        tile: icon(IconToolsKitchen2),
        body: [
          'Et proposem un sopar pensant en tota la setmana, perquè hi hagi de tot.',
          'Si et va bé, toca Sopem això.',
        ],
      },
      {
        id: 'canviar',
        title: 'Canviar plat',
        tile: icon(IconArrowsExchange),
        body: [
          'Llisca a la dreta si t’agrada i a l’esquerra per passar-lo.',
          'Primer surten els plats de les categories que falten aquesta setmana.',
        ],
      },
      {
        id: 'girar',
        title: 'Més informació',
        tile: icon(IconInfoCircle),
        body: ['Toca la rajola del plat per girar-la: hi veuràs els ingredients, el temps i quan el vas fer per última vegada.'],
      },
    ],
  },
  {
    title: 'La setmana',
    steps: [
      {
        id: 'setmana',
        title: 'La teva setmana',
        tile: { kind: 'week' },
        body: [
          'Cada sopar confirmat col·loca una rajola del color de la seva categoria.',
          'Al menú, La teva setmana et diu què falta.',
        ],
      },
      {
        id: 'capritxos',
        title: 'Capritxos',
        tile: { kind: 'capritx' },
        body: [
          'Pizza, croquetes o sopar fora. No compten per a cap categoria i mai te’ls proposem.',
          'Si en tries un abans del marge que has posat a Ajustos, t’avisem.',
        ],
      },
    ],
  },
  {
    title: 'A Ajustos',
    steps: [
      {
        id: 'plats',
        title: 'Els meus plats',
        tile: icon(IconNotebook),
        body: ['Afegeix els plats que feu a casa: sortiran abans que els del recetari.'],
      },
      {
        id: 'copia',
        title: 'Còpia de seguretat',
        tile: icon(IconDownload),
        body: ['Baixa una còpia per guardar les dades o per passar-les a un altre mòbil.'],
      },
      {
        id: 'dades',
        title: 'Les teves dades',
        tile: icon(IconDeviceMobile),
        body: [
          'Tot es queda en aquest mòbil: no hi ha comptes ni núvol.',
          'Si esborres l’app, les perds. Per això hi ha la còpia.',
        ],
      },
    ],
  },
];
