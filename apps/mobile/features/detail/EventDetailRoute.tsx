import { useLocalSearchParams } from 'expo-router';

import { EventDetailScreen } from './EventDetailScreen';

export function EventDetailRoute() {
  const { id, occurrence } = useLocalSearchParams<{ id: string; occurrence?: string }>();
  return (
    <EventDetailScreen eventId={String(id)} occurrence={typeof occurrence === 'string' ? occurrence : undefined} />
  );
}
