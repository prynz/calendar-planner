import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { simulateMeetingAnswers } from '@nowish/demo';
import { attendanceSummary, displayTitle, setAttendance, type Attendance } from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import { AvatarStack, Button, Card, SectionTitle, space, Text } from '@nowish/ui';

import { haptic } from '@/services/haptics';

import { nextMeetings, type GroupContext } from './use-group';

/** GRP-03/04: the next occurrence of every meeting with its own "I'm in / not this time". */
export function GroupMeetings({ ctx }: { ctx: GroupContext }) {
  const { group, store, today, now, locale, t, run, viewerId, name, openEvent } = ctx;
  const router = useRouter();
  if (!group) return null;
  const tz = store.timeZone;
  const meetings = nextMeetings(group, store.events, today, now, tz);
  const answer = (eventId: string, occurrenceKey: string, a: Attendance) =>
    void run((g, at) => {
      const next = setAttendance(g, viewerId, eventId, occurrenceKey, a);
      return { group: next, simulate: simulateMeetingAnswers(next, eventId, occurrenceKey, at) };
    }, 'success');
  return (
    <View style={{ gap: space[3] }}>
      <SectionTitle>{t('group.meetings')}</SectionTitle>
      {meetings.length === 0 ? (
        <Text variant="bodyM" color="textSecondary" testID="group-no-meeting">
          {t('group.meeting.empty')}
        </Text>
      ) : (
        meetings.map((m) => {
          const s = attendanceSummary(group, m.event.id, m.occurrenceKey);
          const mine = group.attendance[`${m.event.id}|${m.occurrenceKey}`]?.[viewerId];
          return (
            <Card key={m.event.id} testID={`meeting-${m.event.id}`}>
              <Text variant="label" color="textSecondary">
                {[
                  formatLongDate(m.start, locale, tz),
                  formatTime(m.start, locale, tz),
                  m.event.recurrence ? t('group.meeting.recurring') : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <Text variant="titleM">{displayTitle(m.event, locale)}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                {s.yes.length > 0 ? (
                  <AvatarStack names={s.yes.map(name)} accessibilityLabel={s.yes.map(name).join(', ')} />
                ) : null}
                <Text
                  variant="label"
                  color="textSecondary"
                  accessibilityLiveRegion="polite"
                  testID={`meeting-summary-${m.event.id}`}
                >
                  {t('groups.attendance', { yes: s.yes.length, no: s.no.length, open: s.open.length })}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: space[2] }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('group.meeting.yes')}
                    variant={mine === 'yes' ? 'primary' : 'secondary'}
                    onPress={() => answer(m.event.id, m.occurrenceKey, 'yes')}
                    testID={`meeting-yes-${m.event.id}`}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={t('group.meeting.no')}
                    variant={mine === 'no' ? 'primary' : 'secondary'}
                    onPress={() => answer(m.event.id, m.occurrenceKey, 'no')}
                    testID={`meeting-no-${m.event.id}`}
                  />
                </View>
              </View>
              <Button
                label={t('group.meeting.open')}
                variant="tertiary"
                onPress={() => openEvent(m.event.id, m.occurrenceKey)}
                testID={`meeting-open-${m.event.id}`}
              />
            </Card>
          );
        })
      )}
      <Button
        label={t('group.meeting.plan')}
        variant="secondary"
        onPress={() => {
          haptic('light');
          router.push({ pathname: '/editor', params: { kind: 'social', group: group.id } });
        }}
        testID="group-plan"
      />
    </View>
  );
}
