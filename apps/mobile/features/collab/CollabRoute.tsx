import { useLocalSearchParams } from 'expo-router';

import { BringScreen } from './BringScreen';
import { ChatScreen } from './ChatScreen';
import { GuestsScreen } from './GuestsScreen';
import { PollScreen } from './PollScreen';
import { TasksScreen } from './TasksScreen';

export const COLLAB_SECTIONS = ['guests', 'poll', 'bring', 'tasks', 'chat'] as const;
export type CollabSection = (typeof COLLAB_SECTIONS)[number];

const SCREENS: Record<CollabSection, (p: { eventId: string }) => React.JSX.Element> = {
  guests: GuestsScreen,
  poll: PollScreen,
  bring: BringScreen,
  tasks: TasksScreen,
  chat: ChatScreen,
};

const isSection = (s: unknown): s is CollabSection =>
  typeof s === 'string' && (COLLAB_SECTIONS as readonly string[]).includes(s);

/** `/event/<id>/<section>` – unknown sections fall back to the guest list instead of a blank screen. */
export function CollabRoute() {
  const { id, section } = useLocalSearchParams<{ id: string; section: string }>();
  const Screen = SCREENS[isSection(section) ? section : 'guests'];
  return <Screen eventId={String(id)} />;
}
