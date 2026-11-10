import { useLocalSearchParams } from 'expo-router';

import { EditorScreen } from './EditorScreen';

export function EditorRoute() {
  const { id, day } = useLocalSearchParams<{ id?: string; day?: string }>();
  return (
    <EditorScreen
      {...(typeof id === 'string' ? { eventId: id } : {})}
      {...(typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? { initialDay: day } : {})}
    />
  );
}
