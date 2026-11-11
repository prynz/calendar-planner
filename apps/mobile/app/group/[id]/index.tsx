import { useLocalSearchParams } from 'expo-router';

import { GroupScreen } from '@/features/groups/GroupScreen';

export default function GroupRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <GroupScreen groupId={String(id)} />;
}
