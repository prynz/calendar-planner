import { Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { simulateChatReply } from '@nowish/demo';
import { COLLAB_LIMITS, localized, postMessage, sortedMessages, type ChatMessage } from '@nowish/domain';
import { formatTime } from '@nowish/i18n';
import { EmptyState, IconButton, radii, space, Text, TextField, useTheme } from '@nowish/ui';

import { CollabShell } from './CollabShell';
import { noteText } from './text';
import { useCollab, type CollabContext } from './use-collab';

/** Event chat, local and simulated (ADR 0012): demo people answer by fixed rules; system notes inline. */
export function ChatScreen({ eventId }: { eventId: string }) {
  const ctx = useCollab(eventId);
  const { collab, t, run, viewerId } = ctx;
  const [draft, setDraft] = useState('');
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const count = collab?.messages.length ?? 0;

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: count > 0 });
  }, [count]);

  const send = () => {
    const body = draft;
    void run((c, now) => {
      const next = postMessage(c, viewerId, body, now);
      return { collab: next, simulate: simulateChatReply(next, now) };
    }, 'light').then((ok) => {
      if (ok) setDraft('');
    });
  };

  return (
    <CollabShell
      ctx={ctx}
      title={t('chat.title')}
      testID="screen-chat"
      scrollRef={scroll}
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[2] }}>
          <View style={{ flex: 1 }}>
            <TextField
              label={t('chat.input')}
              value={draft}
              onChangeText={setDraft}
              placeholder={t('chat.empty')}
              maxLength={COLLAB_LIMITS.message}
              testID="chat-input"
            />
          </View>
          <IconButton
            icon={(c) => <Send color={c} size={20} />}
            onPress={send}
            disabled={draft.trim().length === 0}
            tone="accent"
            accessibilityLabel={t('chat.send')}
            testID="chat-send"
          />
        </View>
      }
    >
      {collab ? (
        collab.messages.length === 0 ? (
          <EmptyState title={t('chat.empty')} body={t('collab.demoHint')} testID="chat-empty" />
        ) : (
          <>
            <Text variant="label" color="textSecondary" align="center">
              {t('collab.demoHint')}
            </Text>
            {sortedMessages(collab).map((m) => (
              <Bubble key={m.id} message={m} ctx={ctx} />
            ))}
          </>
        )
      ) : null}
    </CollabShell>
  );
}

function Bubble({ message: m, ctx }: { message: ChatMessage; ctx: CollabContext }) {
  const { colors } = useTheme();
  const { collab, t, locale, event, name, viewerId } = ctx;
  if (!collab || !event) return null;
  const time = formatTime(m.at, locale, event.timeZone);
  if (m.type === 'system') {
    return (
      <Text variant="label" color="textSecondary" align="center" testID={`chat-system-${m.id}`}>
        {`${noteText(m.note, collab, t, locale, event.timeZone)} · ${time}`}
      </Text>
    );
  }
  const own = m.authorId === viewerId;
  return (
    <View
      style={{ alignItems: own ? 'flex-end' : 'flex-start' }}
      accessible
      accessibilityLabel={`${name(m.authorId)}, ${time}: ${localized(m.body, m.bodyI18n, locale)}`}
      testID={`chat-msg-${m.id}`}
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
          {localized(m.body, m.bodyI18n, locale)}
        </Text>
        <Text variant="label" color={own ? 'onAccentFill' : 'textSecondary'}>
          {time}
        </Text>
      </View>
    </View>
  );
}
