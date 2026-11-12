import { useState } from 'react';

import type { AgendaItem } from '@nowish/demo';
import { personName } from '@nowish/demo';
import { addDays, displayTitle, eventToDraft } from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import { BottomSheet, Button, Text } from '@nowish/ui';

import { haptic } from '@/services/haptics';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { withStart } from '../editor/draft-helpers';

const OPTIONS = [
  { key: 'by15', minutes: 15 },
  { key: 'by60', minutes: 60 },
  { key: 'tomorrow', minutes: 0 },
] as const;

/**
 * "Later" (Phase 9): move one of my own plans by a quarter hour, an hour or to tomorrow. Someone else's event or a
 * repeating series can't be moved from here – the sheet says why and offers to open the plan instead.
 */
export function LaterSheet({ item, onClose }: { item: AgendaItem | null; onClose: () => void }) {
  const { store, locale, t, openEvent } = useAgendaContext();
  const [failed, setFailed] = useState(false);
  const e = item?.event;
  const own = e ? e.kind === 'appointment' || e.hostId === VIEWER_ID : false;
  const movable = Boolean(e && own && !e.recurrence && !e.allDay);

  const move = (key: (typeof OPTIONS)[number]['key'], minutes: number) => {
    if (!e || !item) return;
    const draft = eventToDraft(e, locale);
    const moved =
      key === 'tomorrow'
        ? { ...draft, day: addDays(draft.day, 1) }
        : withStart(draft, Math.min(23 * 60 + 45, draft.startMinute + minutes));
    setFailed(false);
    store
      .update(e.id, moved)
      .then(() => {
        haptic('success');
        onClose();
      })
      .catch((err: unknown) => {
        console.warn('[later] move failed', err instanceof Error ? err.name : 'unknown');
        setFailed(true);
      });
  };

  return (
    <BottomSheet
      visible={item !== null}
      onClose={onClose}
      title={e ? `${t('later.title')}: ${displayTitle(e, locale)}` : t('later.title')}
      closeLabel={t('common.close')}
      testID="later-sheet"
    >
      {movable && item ? (
        <>
          <Text variant="bodyM" color="textSecondary">
            {t('quick.whenValue', {
              date: formatLongDate(item.start, locale, e?.timeZone),
              time: formatTime(item.start, locale, e?.timeZone),
            })}
          </Text>
          {OPTIONS.map((o) => (
            <Button
              key={o.key}
              label={t(`later.${o.key}`)}
              variant="secondary"
              onPress={() => move(o.key, o.minutes)}
              testID={`later-${o.key}`}
            />
          ))}
          {failed ? (
            <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
              {t('later.failed')}
            </Text>
          ) : null}
        </>
      ) : e && item ? (
        <>
          <Text variant="bodyM" color="textSecondary">
            {e.recurrence ? t('later.recurring') : t('later.notOwn', { host: personName(e.hostId ?? VIEWER_ID) })}
          </Text>
          <Button
            label={t('later.open')}
            onPress={() => {
              onClose();
              openEvent(e.id, item.occurrenceKey);
            }}
            testID="later-open"
          />
        </>
      ) : null}
    </BottomSheet>
  );
}
