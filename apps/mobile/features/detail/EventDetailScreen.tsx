import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { agendaForDay, personName } from '@nowish/demo';
import { displayLocation, displayTitle, reminderStages, type ReminderStageKind } from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import {
  AvatarStack,
  Badge,
  Button,
  Card,
  categoryColors,
  EmptyState,
  FadeIn,
  Gutter,
  IconButton,
  radii,
  SectionTitle,
  space,
  Text,
  useTheme,
} from '@nowish/ui';

import { leavePlanFor, statusLabel, timeLabel, VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { useReminders } from '@/providers/reminders';
import { confirm, type ConfirmChoice } from '@/services/confirm';
import { haptic } from '@/services/haptics';

import { LeavePanel } from '../leave/LeavePanel';
import { FamilyPanel } from '../family/FamilyPanel';
import { SocialPanel } from './SocialPanel';

export function EventDetailScreen({
  eventId,
  occurrence,
  openLate = false,
}: {
  eventId: string;
  occurrence: string | undefined;
  /** Opened from the reminder's "I'm running late" action. */
  openLate?: boolean;
}) {
  const { store, now, locale, t, today, buffer, settings } = useAgendaContext();
  const reminders = useReminders();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [deleteFailed, setDeleteFailed] = useState(false);
  const event = store.getEvent(eventId);
  const day = occurrence ?? today;
  const item = event ? (agendaForDay([event], day, event.timeZone)[0] ?? null) : null;

  if (!event || !item) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: insets.top + space[10] }}>
        <EmptyState
          title={t('detail.notFound.title')}
          body={t('detail.notFound.body')}
          action={{ label: t('common.back'), onPress: () => router.back() }}
          testID="detail-not-found"
        />
      </View>
    );
  }

  const tz = event.timeZone;
  const fmt = (d: Date) => formatTime(d, locale, tz);
  const plan = leavePlanFor(event, item.start, buffer);
  const upcomingStages = plan ? reminderStages(plan, settings.reminderIntensity, new Date(0), event.prepMinutes) : [];
  const others = event.participantIds.filter((id) => id !== VIEWER_ID).map(personName);
  const location = displayLocation(event, locale);

  const confirmDelete = () => {
    haptic('warning');
    const run = (fn: () => Promise<void>) => () => {
      fn()
        .then(() => {
          haptic('success');
          router.back();
        })
        .catch((error: unknown) => {
          console.warn('[detail] delete failed', error instanceof Error ? error.message : 'unknown');
          setDeleteFailed(true);
        });
    };
    const choices: ConfirmChoice[] = event.recurrence
      ? [
          { label: t('detail.delete.one'), onPress: run(() => store.removeOccurrence(event.id, item.occurrenceKey)) },
          { label: t('detail.delete.all'), destructive: true, onPress: run(() => store.remove(event.id)) },
        ]
      : [{ label: t('common.delete'), destructive: true, onPress: run(() => store.remove(event.id)) }];
    confirm(t('detail.delete.title'), t('detail.delete.body'), t('common.cancel'), choices);
  };

  const timeline: { key: string; label: string; at: Date; strong?: boolean }[] = plan
    ? [
        ...upcomingStages.map((s) => ({
          key: s.kind,
          label: t(`stage.${s.kind as ReminderStageKind}`),
          at: s.at,
          strong: s.kind === 'leave-now',
        })),
        { key: 'arrive', label: t('stage.arrive'), at: plan.arriveBy },
      ].sort((a, b) => a.at.getTime() - b.at.getTime())
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      {/* Pastel header is always light → dark status bar text in both themes. */}
      <Stack.Screen options={{ headerShown: false, statusBarStyle: 'dark' }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + space[10], gap: space[5] }}
        testID="screen-detail"
      >
        <View
          style={{
            backgroundColor: categoryColors[event.category],
            paddingTop: insets.top + space[3],
            paddingBottom: space[6],
            paddingHorizontal: space[5],
            gap: space[4],
            borderBottomStartRadius: radii.xl,
            borderBottomEndRadius: radii.xl,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton
              icon={(c) => <ChevronLeft color={c} size={22} />}
              onPress={() => router.back()}
              accessibilityLabel={t('common.back')}
              testID="detail-back"
            />
            {event.isDemo ? <Badge label={t('demo.badge')} tone="demo" /> : null}
          </View>
          <Text variant="label" color="onCategoryFill">
            {`${t(`category.${event.category}`)} · ${statusLabel(item, now, t)}`}
          </Text>
          <Text variant="displayL" color="onCategoryFill" accessibilityRole="header" testID="detail-title">
            {displayTitle(event, locale)}
          </Text>
          <Text variant="bodyL" color="onCategoryFill">
            {`${formatLongDate(item.start, locale, tz)} · ${timeLabel(item, locale, t)}`}
          </Text>
          {location ? (
            <Text variant="bodyM" color="onCategoryFill">
              {location}
            </Text>
          ) : null}
          {event.recurrence ? (
            <Text variant="label" color="onCategoryFill">
              {t('detail.repeats', { rule: t(`repeat.${event.recurrence.freq}`) })}
            </Text>
          ) : null}
        </View>

        <Gutter gap={4}>
          {deleteFailed ? (
            <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
              {t('detail.deleteFailed')}
            </Text>
          ) : null}
          <FadeIn>
            <Card testID="detail-plan">
              <SectionTitle>{t('detail.leavePlan')}</SectionTitle>
              {plan ? (
                <View style={{ gap: space[3] }}>
                  {timeline.map((row) => {
                    const past = row.at.getTime() < now.getTime();
                    return (
                      <View
                        key={row.key}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}
                        accessible
                        accessibilityLabel={`${fmt(row.at)} ${row.label}`}
                      >
                        <View
                          style={{
                            width: space[3],
                            height: space[3],
                            borderRadius: radii.pill,
                            backgroundColor: row.strong
                              ? colors.accentFill
                              : past
                                ? colors.border
                                : colors.textSecondary,
                          }}
                        />
                        <Text
                          variant={row.strong ? 'titleM' : 'bodyL'}
                          tabular
                          color={past ? 'textSecondary' : 'textPrimary'}
                        >
                          {fmt(row.at)}
                        </Text>
                        <Text
                          variant={row.strong ? 'titleM' : 'bodyL'}
                          color={row.strong ? 'accentText' : past ? 'textSecondary' : 'textPrimary'}
                        >
                          {row.label}
                        </Text>
                      </View>
                    );
                  })}
                  {event.travel ? (
                    <Text variant="label" color="textSecondary">
                      {`${t('leave.hero.breakdown', { travel: event.travel.minutes, mode: t(`leave.mode.${event.travel.mode}`), buffer })} · ${t('leave.manualHint')}`}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text variant="bodyM" color="textSecondary">
                  {t('detail.noLeavePlan')}
                </Text>
              )}
            </Card>
          </FadeIn>

          {plan && now.getTime() < item.start.getTime() ? (
            <FadeIn delay={30}>
              <LeavePanel
                event={event}
                occurrenceKey={item.occurrenceKey}
                start={item.start}
                plan={plan}
                openLate={openLate}
              />
            </FadeIn>
          ) : null}

          <FamilyPanel event={event} occurrenceKey={item.occurrenceKey} start={item.start} end={item.end} />

          {plan ? (
            <FadeIn delay={60}>
              <Card testID="detail-reminders">
                <SectionTitle>{t('detail.reminders')}</SectionTitle>
                {reminders.permission === 'granted' ? (
                  <Text variant="bodyM" testID="reminders-count">
                    {t('detail.reminders.scheduled', { count: reminders.scheduledFor(event.id) })}
                  </Text>
                ) : reminders.permission === 'denied' ? (
                  <>
                    <Text variant="bodyM" color="textSecondary">
                      {t('detail.reminders.denied')}
                    </Text>
                    <Button
                      label={t('detail.reminders.openSettings')}
                      variant="secondary"
                      onPress={reminders.openSettings}
                    />
                  </>
                ) : reminders.permission === 'unavailable' ? (
                  <Text variant="bodyM" color="textSecondary">
                    {t('detail.reminders.unavailable')}
                  </Text>
                ) : (
                  <>
                    <Text variant="bodyM" color="textSecondary">
                      {t('detail.reminders.off')}
                    </Text>
                    <Button
                      label={t('detail.reminders.enable')}
                      onPress={() => {
                        haptic('light');
                        void reminders.request();
                      }}
                      loading={reminders.permission === 'checking'}
                      testID="reminders-enable"
                    />
                  </>
                )}
              </Card>
            </FadeIn>
          ) : null}

          {store.getCollab(event.id) ? (
            <SocialPanel eventId={event.id} />
          ) : others.length > 0 ? (
            <FadeIn delay={120}>
              <Card>
                <SectionTitle>{t('detail.people')}</SectionTitle>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                  <AvatarStack
                    names={others}
                    max={5}
                    accessibilityLabel={t('event.people', { count: others.length, names: others.join(', ') })}
                  />
                  <Text variant="bodyM" color="textSecondary">
                    {others.join(', ')}
                  </Text>
                </View>
              </Card>
            </FadeIn>
          ) : null}

          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <View style={{ flex: 1 }}>
              <Button
                label={t('common.edit')}
                variant="secondary"
                onPress={() => {
                  haptic('light');
                  router.push({ pathname: '/editor', params: { id: event.id } });
                }}
                testID="detail-edit"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label={t('common.delete')} variant="secondary" onPress={confirmDelete} testID="detail-delete" />
            </View>
          </View>
        </Gutter>
      </ScrollView>
    </View>
  );
}
