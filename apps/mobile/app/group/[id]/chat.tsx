import { useLocalSearchParams } from 'expo-router';

import { GroupChatScreen } from '@/features/groups/GroupChatScreen';

export default function GroupChatRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <GroupChatScreen groupId={String(id)} />;
}
