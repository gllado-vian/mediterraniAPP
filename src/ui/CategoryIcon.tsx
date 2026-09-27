import {
  IconAvocado,
  IconBowlSpoon,
  IconBread,
  IconCarrot,
  IconCheese,
  IconChefHat,
  IconEgg,
  IconEggFried,
  IconFish,
  IconLeaf,
  IconMeat,
  IconMilk,
  IconMushroom,
  IconPepper,
  IconSalad,
  IconSeedling,
  IconSoup,
  type Icon,
} from '@tabler/icons-react';
import type { CategoryIconKey } from '../domain/categories';

const ICONS: Record<CategoryIconKey | 'chef-hat', Icon> = {
  fish: IconFish,
  meat: IconMeat,
  egg: IconEgg,
  soup: IconSoup,
  carrot: IconCarrot,
  salad: IconSalad,
  leaf: IconLeaf,
  seedling: IconSeedling,
  bread: IconBread,
  cheese: IconCheese,
  milk: IconMilk,
  mushroom: IconMushroom,
  pepper: IconPepper,
  avocado: IconAvocado,
  'bowl-spoon': IconBowlSpoon,
  'egg-fried': IconEggFried,
  'chef-hat': IconChefHat,
};

/** Nom en català de cada icona (per al selector d'icones). */
export const ICON_LABELS: Record<CategoryIconKey, string> = {
  fish: 'Peix',
  meat: 'Carn',
  egg: 'Ou',
  soup: 'Plat de cullera',
  carrot: 'Pastanaga',
  salad: 'Amanida',
  leaf: 'Fulla',
  seedling: 'Brot',
  bread: 'Pa',
  cheese: 'Formatge',
  milk: 'Llet',
  mushroom: 'Bolet',
  pepper: 'Pebrot',
  avocado: 'Alvocat',
  'bowl-spoon': 'Bol',
  'egg-fried': 'Ou ferrat',
};

/** Icona d'una categoria per la seva clau; una clau desconeguda es pinta amb el bol. */
export function CategoryIcon({
  icon,
  size = 24,
  stroke = 1.5,
  color,
}: {
  icon: string;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const Component = ICONS[icon as keyof typeof ICONS] ?? IconBowlSpoon;
  return <Component size={size} stroke={stroke} color={color} aria-hidden="true" />;
}
