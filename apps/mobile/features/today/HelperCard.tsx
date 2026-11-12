import { Clock3 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import type { AgendaItem } from '@nowish/demo';
import { personName } from '@nowish/demo';
import { displayTitle, eventToDraft, type Conflict } from '@nowish/domain';
import { formatTime } from '@nowish/i18n';
import { Button, FadeIn, Gutter, radii, SoftCard, space, Text, useTheme, withAlpha } from '@nowish/ui';

import { haptic } from '@/services/haptics';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { withStart } from '../editor/draft-helpers';
import { itemKey } from './insights';

type Outcome = { kind: 'shift' | 'ask'; text: string } | { kind: 'ok'; text: string };

const conflictId = (c: Conflict) => `${c.kind}:${c.first}>${c.second}`;

/**
 * The helper (Phase 8, ADR 0016): speaks up only when plans don't fit, and always with a ready-made fix.
 * Own appointments can be moved directly; someone else's event can only be asked about (simulated in the demo).
 */
export function HelperCard({ conflicts, items }: { conflicts: readonly Conflict[]; items: readonly AgendaItem[] }) {
  const { t, locale, store } = useAgendaContext();
  const { colors } = useTheme();
  const [handled, setHandled] = useState<Record<string, Outcome>>({});
  const [failed, setFailed] = useState(false);

  const open = conflicts.filter((c) => !handled[conflictId(c)]);
  const last = Object.values(handled).at(-1);
  const conflict = open[0];
  if (!conflict) {
    return last ? (
      <Gutter>
        <FadeIn>
          <SoftCard testID="helper-done">
            <Text variant="bodyM">{last.text}</Text>
          </SoftCard>
        </FadeIn>
      </Gutter>
    ) : null;
  }

  const byKey = (k: string) => items.find((i) => itemKey(i) === k);
  const first = byKey(conflict.first);
  const second = byKey(conflict.second);
  if (!first || !second) return null;
  const firstTitle = displayTitle(first.event, locale);
  const secondTitle = displayTitle(second.event, locale);
  const shift = conflict.fixes.find((f) => f.kind === 'shift');
  const newStart = shift ? new Date(second.start.getTime() + shift.minutes * 60_000) : null;
  const newTime = newStart ? formatTime(newStart, locale, second.event.timeZone) : '';
  const own = !second.event.recurrence && (second.event.kind === 'appointment' || second.event.hostId === VIEWER_ID);
  const host = second.event.hostId && second.event.hostId !== VIEWER_ID ? personName(second.event.hostId) : null;
  const id = conflictId(conflict);
  const done = (o: Outcome) => setHandled((h) => ({ ...h, [id]: o }));

  const moveOwn = () => {
    if (!shift) return;
    const draft = eventToDraft(second.event, locale);
    setFailed(false);
    store
      .update(second.event.id, withStart(draft, draft.startMinute + shift.minutes))
      .then(() => {
        haptic('success');
        done({ kind: 'shift', text: t('helper.done.shift', { title: secondTitle, time: newTime }) });
      })
      .catch((e: unknown) => {
        console.warn('[helper] move failed', e instanceof Error ? e.name : 'unknown');
        setFailed(true);
      });
  };

  return (
    <Gutter>
      <FadeIn>
        <SoftCard testID="helper-card">
          <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
            <View
              style={{
                width: space[10],
                height: space[10],
                borderRadius: radii.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: withAlpha(colors.textPrimary, 0.06),
              }}
            >
              <Clock3 color={colors.dangerText} size={20} strokeWidth={2.25} />
            </View>
            <View style={{ flex: 1, gap: space[0.5] }}>
              <Text variant="label" color="textSecondary">
                {t('helper.label')}
              </Text>
              <Text variant="bodyStrong" accessibilityRole="header">
                {t(`helper.${conflict.kind}.title`, { first: firstTitle, second: secondTitle })}
              </Text>
            </View>
          </View>
          <Text variant="bodyM" color="textSecondary">
            {t(`helper.${conflict.kind}.body`, { minutes: conflict.minutes })}
          </Text>
          {failed ? (
            <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
              {t('quick.error.save')}
            </Text>
          ) : null}
          {shift && own ? (
            <Button label={t('helper.fix.shift', { time: newTime })} onPress={moveOwn} testID="helper-shift" />
          ) : shift && host ? (
            <Button
              label={t('helper.fix.ask', { host, time: newTime })}
              onPress={() => {
                haptic('light');
                done({ kind: 'ask', text: t('helper.done.ask', { host }) });
              }}
              testID="helper-ask"
            />
          ) : null}
          <Button
            label={t('helper.fix.ok')}
            variant="secondary"
            onPress={() => {
              haptic('selection');
              done({ kind: 'ok', text: t('helper.done.ok') });
            }}
            testID="helper-ok"
          />
          {open.length > 1 ? (
            <Text variant="label" color="textSecondary">
              {t('helper.more', { count: open.length - 1 })}
            </Text>
          ) : null}
        </SoftCard>
      </FadeIn>
    </Gutter>
  );
}
