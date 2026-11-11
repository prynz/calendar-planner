import { useLocalSearchParams } from 'expo-router';

import { EventDetailScreen } from './EventDetailScreen';

export function EventDetailRoute() {
  const { id, occurrence, late } = useLocalSearchParams<{ id: string; occurrence?: string; late?: string }>();
  return (
    <EventDetailScreen
      eventId={String(id)}
      occurrence={typeof occurrence === 'string' ? occurrence : undefined}
      openLate={late === '1'}
    />
  );
}
