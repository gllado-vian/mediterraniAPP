import {
  IconCarrot,
  IconChefHat,
  IconEgg,
  IconFish,
  IconMeat,
  IconSoup,
  type Icon,
} from '@tabler/icons-react';
import type { Category } from '../domain/categories';

const ICONS: Record<Category, Icon> = {
  peix: IconFish,
  carn: IconMeat,
  ou: IconEgg,
  llegum: IconSoup,
  vegetaria: IconCarrot,
  capritx: IconChefHat,
};

export function CategoryIcon({
  category,
  size = 24,
  stroke = 1.5,
  color,
}: {
  category: Category;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const Component = ICONS[category];
  return <Component size={size} stroke={stroke} color={color} aria-hidden="true" />;
}
