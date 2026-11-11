import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { simulateLateReply } from '@nowish/demo';
import {
  announceLate,
  departureDelay,
  HERO_WINDOW_MIN,
  invitationOf,
  journeyId,
  LATE_OPTIONS,
  markLeft,
  newJourney,
  postLateNote,
  readyItems,
  readyProgress,
  type CalendarEvent,
  type DayKey,
  type LeavePlan,
} from '@nowish/domain';
import { formatTime } from '@nowish/i18n';
import { Button, Card, ChipGroup, SectionTitle, space, Text } from '@nowish/ui';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { useAccount } from '@/providers/account';
import { haptic } from '@/services/haptics';

/**
 * "On my way", "I'm running late" and the way into the ready check (anti-chaos-engine.md §3, §4).
 * Departure buttons appear within the 3 hours before leaving (same window as the leave card) until the start.
 */
export function LeavePanel({
  event,
  occurrenceKey,
  start,
  plan,
  openLate = false,
  compact = false,
}: {
  event: CalendarEvent;
  occurrenceKey: DayKey;
  start: Date;
  plan: LeavePlan;
  /** Opened from the reminder's "running late" action. */
  openLate?: boolean;
  /** Under the Today card: no title and no ready check summary line. */
  compact?: boolean;
}) {
  const { store, now, locale, t, learnedBuffer } = useAgendaContext();
  const { limits } = useAccount();
  const router = useRouter();
  const [choosing, setChoosing] = useState(openLate);
  const [failed, setFailed] = useState(false);
  const id = journeyId(event.id, occurrenceKey);
  const journey = store.getJourney(id) ?? newJourney(event.id, occurrenceKey, plan.leaveAt);
  const collab = store.getCollab(event.id);
  const shared = !!collab && (collab.hostId === VIEWER_ID || !!invitationOf(collab, VIEWER_ID));
  const tz = event.timeZone;
  const inWindow =
    now.getTime() < start.getTime() && plan.leaveAt.getTime() - now.getTime() <= HERO_WINDOW_MIN * 60_000;
  const items = readyItems(event.category, collab, VIEWER_ID);
  const progress = readyProgress(items, journey.checked);

  const save = (fn: () => Promise<void>, intent: 'success' | 'light') => {
    setFailed(false);
    fn()
      .then(() => haptic(intent))
      .catch((error: unknown) => {
        console.warn('[leave] save failed', error instanceof Error ? error.message : 'unknown');
        haptic('warning');
        setFailed(true);
      });
  };

  const onMyWay = () => save(() => store.saveJourney(markLeft(journey, new Date(now.getTime()))), 'success');
  const late = (minutes: number) =>
    save(async () => {
      await store.saveJourney(announceLate(journey, minutes, now));
      if (shared)
        await store.updateCollab(event.id, (c, at) => {
          const next = postLateNote(c, VIEWER_ID, minutes, at);
          return { collab: next, simulate: simulateLateReply(next, at) };
        });
      setChoosing(false);
    }, 'light');

  const delay = departureDelay(journey);
  const leftText =
    journey.leftAt && delay !== undefined
      ? `${t('leave.underwaySince', { time: formatTime(journey.leftAt, locale, tz) })} · ${
          delay < -2
            ? t('leave.leftEarly', { minutes: -delay })
            : delay <= 2
              ? t('leave.leftOnTime')
              : t('leave.leftLate', { minutes: delay })
        }`
      : null;

  return (
    <Card testID="leave-panel">
      {compact ? null : <SectionTitle>{t('leave.panel.title')}</SectionTitle>}
      {learnedBuffer && !compact ? (
        <Text variant="label" color="textSecondary">
          {t('leave.bufferLearned', { minutes: learnedBuffer.minutes })}
        </Text>
      ) : null}
      {leftText ? (
        <Text variant="titleM" testID="leave-underway" accessibilityLiveRegion="polite">
          {leftText}
        </Text>
      ) : inWindow ? (
        <View style={{ gap: space[3] }}>
          <Button label={t('leave.onMyWay')} onPress={onMyWay} testID="leave-on-my-way" />
          {choosing ? (
            <View style={{ gap: space[2] }}>
              <Text variant="label" color="textSecondary">
                {t('leave.lateChoose')}
              </Text>
              <ChipGroup
                options={LATE_OPTIONS.map((m) => ({ value: String(m), label: t('leave.lateOption', { minutes: m }) }))}
                selected={journey.lateMinutes !== undefined ? [String(journey.lateMinutes)] : []}
                onToggle={(v) => late(Number(v))}
                accessibilityLabel={t('leave.lateChoose')}
                testIDPrefix="leave-late"
              />
            </View>
          ) : (
            <Button
              label={t('leave.runningLate')}
              variant="secondary"
              onPress={() => {
                haptic('light');
                setChoosing(true);
              }}
              testID="leave-running-late"
            />
          )}
        </View>
      ) : null}
      {journey.lateMinutes !== undefined && !journey.leftAt ? (
        <Text variant="bodyM" color="textSecondary" testID="leave-late-noted">
          {t(shared ? 'leave.late.shared' : 'leave.late.private', { minutes: journey.lateMinutes })}
        </Text>
      ) : null}
      {now.getTime() < start.getTime() ? (
        <Button
          label={
            limits.readyCheck
              ? `${t('leave.readyCheck')} · ${t('leave.readyProgress', progress)}`
              : `${t('leave.readyCheck')} · Plus`
          }
          variant={inWindow ? 'tertiary' : 'secondary'}
          onPress={() => {
            haptic('light');
            // The ready check is part of Plus (monetization.md §2); on Free the button explains the plans.
            if (limits.readyCheck)
              router.push({ pathname: '/ready', params: { id: event.id, occurrence: occurrenceKey } });
            else router.push({ pathname: '/paywall', params: { reason: 'ready-check' } });
          }}
          testID="leave-ready-check"
        />
      ) : null}
      {failed ? (
        <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
          {t('collab.error.save')}
        </Text>
      ) : null}
    </Card>
  );
}
