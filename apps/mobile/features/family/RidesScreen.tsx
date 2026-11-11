import { View } from 'react-native';

import { simulateRideAnswer } from '@nowish/demo';
import {
  dayKeyOf,
  displayTitle,
  noonOf,
  openLegs,
  requestRide,
  RIDE_LEGS,
  rideConflict,
  rideSlots,
  setDriver,
  type RideLeg,
  type RideSlot,
} from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import { Button, Card, EmptyState, MemberAvatar, space, Text } from '@nowish/ui';

import { FamilyShell } from './FamilyShell';
import { memberColor, memberName, namesOf } from './names';
import { useFamily, type FamilyContext } from './use-family';

/** FAM-04/05: who brings and who collects, with gaps and conflicts visible. */
export function RidesScreen() {
  const ctx = useFamily();
  const { household, week, t } = ctx;
  const slots = household ? rideSlots(household, week) : [];
  return (
    <FamilyShell ctx={ctx} title={t('rides.title')} testID="screen-rides">
      <Text variant="bodyM" color="textSecondary">
        {t('rides.hint')}
      </Text>
      {slots.length === 0 ? (
        <EmptyState title={t('rides.empty.title')} body={t('rides.empty.body')} testID="rides-empty" />
      ) : (
        slots.map((s) => <SlotCard key={`${s.item.event.id}|${s.item.occurrenceKey}`} slot={s} ctx={ctx} />)
      )}
    </FamilyShell>
  );
}

function SlotCard({ slot, ctx }: { slot: RideSlot; ctx: FamilyContext }) {
  const { household, locale, t } = ctx;
  if (!household) return null;
  const tz = slot.item.event.timeZone;
  const day = formatLongDate(noonOf(dayKeyOf(slot.item.start, tz), tz), locale, tz);
  const time = `${formatTime(slot.item.start, locale, tz)} – ${formatTime(slot.item.end, locale, tz)}`;
  const gaps = openLegs(slot).length;
  return (
    <Card testID={`ride-${slot.item.event.id}`}>
      <Text variant="label" color="textSecondary">{`${day} · ${time}`}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View style={{ flexDirection: 'row', gap: space[1] }}>
          {slot.kidIds.map((id) => (
            <MemberAvatar
              key={id}
              size="sm"
              name={memberName(household, id, t)}
              color={memberColor(household, id)}
              emoji={household.kids.find((k) => k.id === id)?.emoji}
            />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="titleM">{displayTitle(slot.item.event, locale)}</Text>
          <Text variant="bodyM" color="textSecondary">
            {`${slot.item.event.location} · ${t('rides.for', { names: namesOf(household, slot.kidIds, t) })}`}
          </Text>
        </View>
      </View>
      {RIDE_LEGS.map((leg) => (
        <LegRow key={leg} slot={slot} leg={leg} ctx={ctx} />
      ))}
      {gaps === 0 ? null : (
        <Text variant="label" color="textSecondary" accessibilityLiveRegion="polite">
          {t('family.rides.summary', { open: gaps })}
        </Text>
      )}
    </Card>
  );
}

function LegRow({ slot, leg, ctx }: { slot: RideSlot; leg: RideLeg; ctx: FamilyContext }) {
  const { household, run, viewerId, week, locale, t } = ctx;
  if (!household) return null;
  const ride = slot.legs[leg];
  const { event, occurrenceKey } = slot.item;
  const other = household.adultIds.find((a) => a !== viewerId);
  const status = ride.driverId
    ? ride.driverId === viewerId
      ? t('rides.byYou')
      : t('rides.by', { name: memberName(household, ride.driverId, t) })
    : ride.requestedId
      ? t('rides.requested', { name: memberName(household, ride.requestedId, t) })
      : t('rides.open');
  const conflictFor = ride.driverId ?? viewerId;
  const conflict = rideConflict(slot, leg, conflictFor, week);
  const conflictText = conflict
    ? t(conflictFor === viewerId ? 'rides.conflictYou' : 'rides.conflict', {
        name: memberName(household, conflictFor, t),
        title: displayTitle(conflict.event, locale),
        time: formatTime(conflict.start, locale, conflict.event.timeZone),
      })
    : null;
  const id = `${event.id}-${leg}`;
  return (
    <View style={{ gap: space[2] }} testID={`ride-leg-${id}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space[2] }}>
        <Text variant="bodyL">{t(`rides.leg.${leg}`)}</Text>
        <Text variant="bodyL" color={ride.driverId ? 'textPrimary' : 'textSecondary'} testID={`ride-status-${id}`}>
          {status}
        </Text>
      </View>
      {conflictText && (!ride.driverId || ride.driverId === viewerId) ? (
        <Text variant="bodyM" color="dangerText" testID={`ride-conflict-${id}`}>
          {conflictText}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        {ride.driverId === viewerId ? (
          <View style={{ flex: 1 }}>
            <Button
              label={t('rides.giveBack')}
              variant="tertiary"
              onPress={() => void run((h) => setDriver(h, viewerId, event.id, occurrenceKey, leg, null))}
              testID={`ride-giveback-${id}`}
            />
          </View>
        ) : ride.driverId ? null : (
          <>
            <View style={{ flex: 1 }}>
              <Button
                label={t('rides.take')}
                variant="secondary"
                onPress={() =>
                  void run((h) => setDriver(h, viewerId, event.id, occurrenceKey, leg, viewerId), 'success')
                }
                testID={`ride-take-${id}`}
              />
            </View>
            {other && !ride.requestedId ? (
              <View style={{ flex: 1 }}>
                <Button
                  label={t('rides.ask', { name: memberName(household, other, t) })}
                  variant="secondary"
                  onPress={() =>
                    void run((h, now) => {
                      const next = requestRide(h, viewerId, event.id, occurrenceKey, leg, other);
                      return {
                        household: next,
                        simulate: simulateRideAnswer(next, week, event.id, occurrenceKey, leg, other, now),
                      };
                    })
                  }
                  testID={`ride-ask-${id}`}
                />
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}
