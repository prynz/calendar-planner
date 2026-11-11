import { useLocalSearchParams } from 'expo-router';

import { EditorScreen } from './EditorScreen';

export function EditorRoute() {
  const { id, day, kind, template, group } = useLocalSearchParams<{
    id?: string;
    day?: string;
    kind?: string;
    template?: string;
    group?: string;
  }>();
  return (
    <EditorScreen
      {...(typeof id === 'string' ? { eventId: id } : {})}
      social={kind === 'social'}
      {...(typeof template === 'string' ? { templateId: template } : {})}
      {...(typeof group === 'string' ? { groupId: group } : {})}
      {...(typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? { initialDay: day } : {})}
    />
  );
}
