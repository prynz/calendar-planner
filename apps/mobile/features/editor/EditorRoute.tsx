import { useLocalSearchParams } from 'expo-router';

import { EditorScreen } from './EditorScreen';

export function EditorRoute() {
  const { id, day, kind, template, group, title, start, place } = useLocalSearchParams<{
    id?: string;
    day?: string;
    kind?: string;
    template?: string;
    group?: string;
    title?: string;
    start?: string;
    place?: string;
  }>();
  const startMinute = typeof start === 'string' && /^\d{1,4}$/.test(start) ? Number(start) : undefined;
  const prefill = {
    ...(typeof title === 'string' && title ? { title: title.slice(0, 120) } : {}),
    ...(startMinute !== undefined && startMinute < 24 * 60 ? { startMinute } : {}),
    ...(typeof place === 'string' && place ? { location: place.slice(0, 200) } : {}),
  };
  return (
    <EditorScreen
      {...(typeof id === 'string' ? { eventId: id } : {})}
      social={kind === 'social'}
      {...(typeof template === 'string' ? { templateId: template } : {})}
      {...(typeof group === 'string' ? { groupId: group } : {})}
      {...(typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day) ? { initialDay: day } : {})}
      {...(Object.keys(prefill).length > 0 ? { prefill } : {})}
    />
  );
}
