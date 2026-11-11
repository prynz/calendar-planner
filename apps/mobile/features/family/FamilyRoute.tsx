import { useLocalSearchParams } from 'expo-router';

import { ChoresScreen } from './ChoresScreen';
import { MembersScreen } from './MembersScreen';
import { RidesScreen } from './RidesScreen';
import { ShoppingScreen } from './ShoppingScreen';

const SCREENS = { rides: RidesScreen, shopping: ShoppingScreen, chores: ChoresScreen, members: MembersScreen } as const;
type FamilySection = keyof typeof SCREENS;
const isSection = (s: unknown): s is FamilySection => typeof s === 'string' && s in SCREENS;

/** `/family/<section>` – unknown sections fall back to the members screen instead of a blank page. */
export function FamilyRoute() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const Screen = SCREENS[isSection(section) ? section : 'members'];
  return <Screen />;
}
