import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { leaveGroup, localized, sortedGroupMessages } from '@nowish/domain';
import { Button, Card, SectionTitle, space, Text } from '@nowish/ui';

import { DetailShell } from '../shell/DetailShell';
import { confirm } from '@/services/confirm';
import { haptic } from '@/services/haptics';

import { GroupMeetings } from './GroupMeetings';
import { GroupMembers } from './GroupMembers';
import { groupNoteText } from './notes';
import { groupName, useGroup } from './use-group';

/** One group (groups.md): meetings with per-occurrence answers, chat preview, members, leaving. */
export function GroupScreen({ groupId }: { groupId: string }) {
  const ctx = useGroup(groupId);
  const { group, store, t, locale, error, run, viewerId, name } = ctx;
  const router = useRouter();
  const last = group ? sortedGroupMessages(group).slice(-2) : [];
  return (
    <DetailShell
      eyebrow={group ? `${group.emoji} ${t('groups.title')}` : undefined}
      title={group ? groupName(group, locale) : t('group.notFound.title')}
      demo={groupId.startsWith('demo-')}
      error={error}
      missing={
        group ? null : { title: t('group.notFound.title'), body: t('group.notFound.body'), testID: 'group-missing' }
      }
      testID="screen-group"
      backTestID="group-back"
    >
      <GroupMeetings ctx={ctx} />
      <Card testID="group-chat-preview">
        <SectionTitle>{t('group.chat')}</SectionTitle>
        {last.length === 0 ? (
          <Text variant="bodyM" color="textSecondary">
            {t('group.chat.empty')}
          </Text>
        ) : (
          last.map((m) => (
            <Text
              key={m.id}
              variant="bodyM"
              color={m.type === 'system' ? 'textSecondary' : 'textPrimary'}
              numberOfLines={2}
            >
              {m.type === 'system'
                ? groupNoteText(m.note, store.events, t, locale)
                : `${name(m.authorId)}: ${localized(m.body, m.bodyI18n, locale)}`}
            </Text>
          ))
        )}
        <Button
          label={t('group.chat.open')}
          variant="secondary"
          onPress={() => {
            haptic('light');
            router.push({ pathname: '/group/[id]/chat', params: { id: groupId } });
          }}
          testID="group-chat-open"
        />
      </Card>
      <GroupMembers ctx={ctx} />
      <View style={{ marginTop: space[2] }}>
        <Button
          label={t('group.leave')}
          variant="tertiary"
          onPress={() =>
            group &&
            confirm(t('group.leave.confirm', { name: groupName(group, locale) }), '', t('members.cancel'), [
              {
                label: t('group.leave'),
                destructive: true,
                onPress: () =>
                  void run((g, now) => leaveGroup(g, viewerId, now)).then((ok) => {
                    if (ok) router.back();
                  }),
              },
            ])
          }
          testID="group-leave"
        />
      </View>
    </DetailShell>
  );
}
