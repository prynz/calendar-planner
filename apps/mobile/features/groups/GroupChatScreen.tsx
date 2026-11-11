import { Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { simulateGroupReply } from '@nowish/demo';
import { GROUP_LIMITS, localized, postGroupMessage, sortedGroupMessages, type GroupMessage } from '@nowish/domain';
import { formatTime } from '@nowish/i18n';
import { EmptyState, IconButton, radii, space, Text, TextField, useTheme } from '@nowish/ui';

import { DetailShell } from '../shell/DetailShell';
import { groupNoteText } from './notes';
import { groupName, useGroup, type GroupContext } from './use-group';

/** GRP-05: group chat outside of events – local and simulated in the prototype (Demo). */
export function GroupChatScreen({ groupId }: { groupId: string }) {
  const ctx = useGroup(groupId);
  const { group, t, locale, error, run, viewerId } = ctx;
  const [draft, setDraft] = useState('');
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const count = group?.messages.length ?? 0;
  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: count > 0 });
  }, [count]);

  const send = () => {
    const body = draft;
    void run((g, now) => {
      const next = postGroupMessage(g, viewerId, body, now);
      return { group: next, simulate: simulateGroupReply(next, now) };
    }).then((ok) => {
      if (ok) setDraft('');
    });
  };

  return (
    <DetailShell
      eyebrow={group ? `${group.emoji} ${groupName(group, locale)}` : undefined}
      title={t('group.chat')}
      demo={groupId.startsWith('demo-')}
      error={error}
      missing={
        group ? null : { title: t('group.notFound.title'), body: t('group.notFound.body'), testID: 'group-missing' }
      }
      testID="screen-group-chat"
      backTestID="group-chat-back"
      scrollRef={scroll}
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[2] }}>
          <View style={{ flex: 1 }}>
            <TextField
              label={t('chat.input')}
              value={draft}
              onChangeText={setDraft}
              maxLength={GROUP_LIMITS.message}
              testID="group-chat-input"
            />
          </View>
          <IconButton
            icon={(c) => <Send color={c} size={20} />}
            onPress={send}
            disabled={draft.trim().length === 0}
            tone="accent"
            accessibilityLabel={t('chat.send')}
            testID="group-chat-send"
          />
        </View>
      }
    >
      {group && group.messages.length === 0 ? (
        <EmptyState title={t('group.chat.empty')} body={t('collab.demoHint')} testID="group-chat-empty" />
      ) : (
        <>
          <Text variant="label" color="textSecondary" align="center">
            {t('collab.demoHint')}
          </Text>
          {group ? sortedGroupMessages(group).map((m) => <Bubble key={m.id} message={m} ctx={ctx} />) : null}
        </>
      )}
    </DetailShell>
  );
}

function Bubble({ message: m, ctx }: { message: GroupMessage; ctx: GroupContext }) {
  const { colors } = useTheme();
  const { store, t, locale, name, viewerId } = ctx;
  const time = formatTime(m.at, locale, store.timeZone);
  if (m.type === 'system') {
    return (
      <Text variant="label" color="textSecondary" align="center">
        {`${groupNoteText(m.note, store.events, t, locale)} · ${time}`}
      </Text>
    );
  }
  const own = m.authorId === viewerId;
  const body = localized(m.body, m.bodyI18n, locale);
  return (
    <View
      style={{ alignItems: own ? 'flex-end' : 'flex-start' }}
      accessible
      accessibilityLabel={`${name(m.authorId)}, ${time}: ${body}`}
      testID={`group-msg-${m.id}`}
    >
      <View
        style={{
          maxWidth: '82%',
          paddingHorizontal: space[4],
          paddingVertical: space[3],
          gap: space[1],
          borderRadius: radii.lg,
          borderBottomEndRadius: own ? radii.sm : radii.lg,
          borderBottomStartRadius: own ? radii.lg : radii.sm,
          backgroundColor: own ? colors.accentFill : colors.surface,
        }}
      >
        {own ? null : (
          <Text variant="label" color="textSecondary">
            {name(m.authorId)}
          </Text>
        )}
        <Text variant="bodyL" color={own ? 'onAccentFill' : 'textPrimary'}>
          {body}
        </Text>
        <Text variant="label" color={own ? 'onAccentFill' : 'textSecondary'}>
          {time}
        </Text>
      </View>
    </View>
  );
}
