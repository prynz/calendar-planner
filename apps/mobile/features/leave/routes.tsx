import { useLocalSearchParams } from 'expo-router';

import { ReadyCheckScreen } from './ReadyCheckScreen';

export function ReadyCheckRoute() {
  const { id, occurrence } = useLocalSearchParams<{ id: string; occurrence?: string }>();
  return <ReadyCheckScreen eventId={String(id)} occurrence={typeof occurrence === 'string' ? occurrence : undefined} />;
}
