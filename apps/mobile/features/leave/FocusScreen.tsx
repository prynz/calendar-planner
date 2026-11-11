import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { agendaBetween } from '@nowish/demo';
import { addDays, displayTitle, HERO_WINDOW_MIN, leaveState } from '@nowish/domain';
import { formatShortDate, formatTime } from '@nowish/i18n';
import { Button, Card, EmptyState, IconButton, ProgressBar, SectionTitle, space, Text, useTheme } from '@nowish/ui';

import { duration, leavePlanFor, timeLabel } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { haptic } from '@/services/haptics';

import { LeavePanel } from './LeavePanel';

const BODY_DOUBLE_MIN = 25;

/**
 * Focus mode (anti-chaos-engine.md §6): only "now" and "up next", a calm bar until leaving and a body-doubling
 * timer that works offline. Nothing else competes for attention.
 */
export function FocusScreen() {
  const { store, now, locale, t, buffer, today } = useAgendaContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const upcoming = agendaBetween(store.events, today, addDays(today, 2), store.timeZone).filter(
    (i) => i.end.getTime() > now.getTime(),
  );
  const focus = upcoming.find((i) => i.start.getTime() > now.getTime() && leavePlanFor(i.event, i.start, buffer));
  const plan = focus ? leavePlanFor(focus.event, focus.start, buffer) : null;
  const next = upcoming.find((i) => i !== focus && i.start.getTime() > (focus?.start.getTime() ?? now.getTime()));

  const state = plan && focus ? leaveState(plan, focus.start, now) : null;
  const toLeaveMin = plan ? Math.ceil((plan.leaveAt.getTime() - now.getTime()) / 60_000) : 0;
  const windowStart = plan ? plan.leaveAt.getTime() - HERO_WINDOW_MIN * 60_000 : 0;
  const barValue = plan ? (now.getTime() - windowStart) / (plan.leaveAt.getTime() - windowStart) : 0;
  const nowText =
    state?.kind === 'relaxed'
      ? t('leave.state.relaxed', { duration: duration(state.minutesUntilPrep, t) })
      : state?.kind === 'get-ready'
        ? t('leave.state.getReady', { duration: duration(state.minutesUntilLeave, t) })
        : state?.kind === 'late'
          ? t('leave.state.late', { minutes: state.minutesLate })
          : t('leave.state.leaveNow');

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView
        testID="screen-focus"
        contentContainerStyle={{
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + space[8],
          paddingHorizontal: space[5],
          gap: space[5],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="titleL" accessibilityRole="header">
            {t('focus.title')}
          </Text>
          <IconButton
            icon={(c) => <X color={c} size={22} />}
            onPress={() => router.back()}
            accessibilityLabel={t('common.close')}
            testID="focus-close"
          />
        </View>
        <StoreGate>
          {focus && plan ? (
            <>
              <View style={{ gap: space[2] }} testID="focus-now">
                <Text variant="label" color="textSecondary">
                  {t('focus.now')}
                </Text>
                <Text variant="displayL" accessibilityLiveRegion="polite">
                  {toLeaveMin > 0 ? t('focus.leaveIn', { duration: duration(toLeaveMin, t) }) : t('focus.leaveNow')}
                </Text>
                <Text variant="bodyL" color="textSecondary">
                  {`${displayTitle(focus.event, locale)} · ${formatTime(focus.start, locale, focus.event.timeZone)}`}
                </Text>
                <Text variant="label" color="textSecondary">
                  {`${t('focus.timeToLeave')} · ${nowText}`}
                </Text>
                <ProgressBar value={barValue} testID="focus-bar" />
              </View>
              <LeavePanel
                event={focus.event}
                occurrenceKey={focus.occurrenceKey}
                start={focus.start}
                plan={plan}
                compact
              />
            </>
          ) : (
            <EmptyState title={t('focus.title')} body={t('focus.nothing')} testID="focus-nothing" />
          )}
          {next ? (
            <Card testID="focus-next">
              <SectionTitle>{t('focus.next')}</SectionTitle>
              <Text variant="titleM">{displayTitle(next.event, locale)}</Text>
              <Text variant="bodyM" color="textSecondary">
                {next.occurrenceKey === today
                  ? timeLabel(next, locale, t)
                  : `${formatShortDate(next.start, locale, next.event.timeZone)} · ${timeLabel(next, locale, t)}`}
              </Text>
            </Card>
          ) : null}
          <BodyDouble />
        </StoreGate>
      </ScrollView>
    </View>
  );
}

/** A quiet 25-minute companion timer. Purely local, nothing is sent anywhere. */
function BodyDouble() {
  const { t } = useAgendaContext();
  const [endAt, setEndAt] = useState<number | null>(null);
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [endAt]);
  const left = endAt === null ? 0 : Math.max(0, endAt - tick);
  const done = endAt !== null && left === 0;
  useEffect(() => {
    if (done) haptic('success');
  }, [done]);
  const mm = String(Math.floor(left / 60_000)).padStart(2, '0');
  const ss = String(Math.floor((left % 60_000) / 1000)).padStart(2, '0');
  return (
    <Card testID="focus-body-double">
      <SectionTitle>{t('focus.bodyDouble')}</SectionTitle>
      <Text variant="bodyM" color="textSecondary">
        {t('focus.bodyDouble.hint')}
      </Text>
      {endAt !== null ? (
        <>
          <Text variant="displayL" tabular align="center" testID="focus-timer">
            {done ? t('focus.bodyDouble.done') : t('focus.bodyDouble.left', { time: `${mm}:${ss}` })}
          </Text>
          <ProgressBar value={1 - left / (BODY_DOUBLE_MIN * 60_000)} />
        </>
      ) : null}
      <Button
        label={endAt === null || done ? t('focus.bodyDouble.start') : t('focus.bodyDouble.stop')}
        variant={endAt === null || done ? 'primary' : 'secondary'}
        onPress={() => {
          haptic('light');
          if (endAt === null || done) {
            const start = Date.now();
            setTick(start);
            setEndAt(start + BODY_DOUBLE_MIN * 60_000);
          } else setEndAt(null);
        }}
        testID="focus-body-double-toggle"
      />
    </Card>
  );
}
