import {
  Car,
  CircleHelp,
  Ellipsis,
  HeartPulse,
  House,
  PartyPopper,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Tag,
  type LucideIcon,
} from 'lucide-react';

/** Icônes Lucide utilisées par les catégories (noms stockés côté API). */
const ICONS: Record<string, LucideIcon> = {
  house: House,
  'shopping-cart': ShoppingCart,
  car: Car,
  'heart-pulse': HeartPulse,
  repeat: Repeat,
  'party-popper': PartyPopper,
  'shopping-bag': ShoppingBag,
  ellipsis: Ellipsis,
  'circle-help': CircleHelp,
  tag: Tag,
};

export const CATEGORY_ICON_NAMES = Object.keys(ICONS).filter((n) => n !== 'circle-help');

export function CategoryIcon({
  name,
  color,
  size = 'md',
}: {
  name: string | null;
  color: string | null;
  size?: 'sm' | 'md';
}) {
  const Icon = (name && ICONS[name]) || Tag;
  const box = size === 'sm' ? 'size-5' : 'size-9';
  const icon = size === 'sm' ? 'size-3' : 'size-4.5';
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white ${box}`}
      style={{ background: color ?? 'var(--text-muted)' }}
    >
      <Icon className={icon} />
    </span>
  );
}
