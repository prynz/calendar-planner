import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { assignedTo, RIDE_LEGS, rideSlots, type CalendarEvent, type DayKey } from '@nowish/domain';
import { Button, Card, MemberAvatar, SectionTitle, space, Text } from '@nowish/ui';

import { VIEWER_ID } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { haptic } from '@/services/haptics';

import { memberColor, memberName, namesOf } from './names';

/** In the event detail: who in the family it is for and, for children, the ride status (FAM-03/04). */
export function FamilyPanel({
  event,
  occurrenceKey,
  start,
  end,
}: {
  event: CalendarEvent;
  occurrenceKey: DayKey;
  start: Date;
  end: Date;
}) {
  const { store, t } = useAgendaContext();
  const router = useRouter();
  const h = store.household;
  if (!h) return null;
  const members = assignedTo(h, event.id);
  if (members.length === 0) return null;
  const slot = rideSlots(h, [{ event, occurrenceKey, start, end }])[0];
  return (
    <Card testID="detail-family">
      <SectionTitle>{t('family.title')}</SectionTitle>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View style={{ flexDirection: 'row', gap: space[1] }}>
          {members.map((id) => (
            <MemberAvatar
              key={id}
              size="sm"
              name={memberName(h, id, t)}
              color={memberColor(h, id)}
              emoji={h.kids.find((k) => k.id === id)?.emoji}
            />
          ))}
        </View>
        <Text variant="bodyL">{t('family.for', { names: namesOf(h, members, t) })}</Text>
      </View>
      {slot
        ? RIDE_LEGS.map((leg) => {
            const r = slot.legs[leg];
            const status = r.driverId
              ? r.driverId === VIEWER_ID
                ? t('rides.byYou')
                : t('rides.by', { name: memberName(h, r.driverId, t) })
              : r.requestedId
                ? t('rides.requested', { name: memberName(h, r.requestedId, t) })
                : t('rides.open');
            return (
              <Text key={leg} variant="bodyM" color="textSecondary">
                {`${t(`rides.leg.${leg}`)}: ${status}`}
              </Text>
            );
          })
        : null}
      {slot ? (
        <Button
          label={t('rides.title')}
          variant="secondary"
          onPress={() => {
            haptic('light');
            router.push({ pathname: '/family/[section]', params: { section: 'rides' } });
          }}
          testID="detail-family-rides"
        />
      ) : null}
    </Card>
  );
}
