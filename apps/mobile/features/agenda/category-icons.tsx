import {
  BriefcaseBusiness,
  Dumbbell,
  HeartPulse,
  House,
  LayoutGrid,
  PartyPopper,
  UsersRound,
} from 'lucide-react-native';
import type { ReactNode } from 'react';

import type { EventCategory } from '@nowish/ui';

const ICONS = {
  social: UsersRound,
  family: House,
  health: HeartPulse,
  work: BriefcaseBusiness,
  sport: Dumbbell,
  celebration: PartyPopper,
} as const satisfies Record<EventCategory, unknown>;

/** Icon for a category filter chip (Phase 8); `all` shows a grid. */
export function categoryIcon(category: EventCategory | 'all', color: string): ReactNode {
  const Icon = category === 'all' ? LayoutGrid : ICONS[category];
  return <Icon color={color} size={18} strokeWidth={2.25} />;
}
