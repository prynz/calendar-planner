import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  choresFor,
  familyWeek,
  FULL_DAY,
  householdMemberIds,
  localized,
  newHousehold,
  noonOf,
  rideGapCount,
  rideSlots,
  sortedShopping,
} from '@nowish/domain';
import { formatLongDate, formatWeekday } from '@nowish/i18n';
import { Button, Card, EmptyState, Gutter, MemberAvatar, SectionTitle, space, Text, WeekBars } from '@nowish/ui';

import { haptic } from '@/services/haptics';

import { ChoreRow } from './ChoreRow';
import { dotColor, memberColor, memberName } from './names';
import { useFamily, type FamilyContext } from './use-family';

/** Family overview in the "Together" tab (family.md): members, week, rides, today's chores, shopping. */
export function FamilySection() {
  const ctx = useFamily();
  const { household, store, t, now, viewerId, error, showError } = ctx;
  const router = useRouter();
  const go = (section: 'rides' | 'shopping' | 'chores' | 'members') => {
    haptic('light');
    router.push({ pathname: '/family/[section]', params: { section } });
  };

  if (!household) {
    return (
      <Gutter>
        <EmptyState
          title={t('family.empty.title')}
          body={t('family.empty.body')}
          action={{
            label: t('family.create'),
            testID: 'family-create',
            onPress: () => {
              store
                .saveHousehold(
                  newHousehold(`home-${now.getTime().toString(36)}`, t('family.defaultName'), viewerId, now),
                )
                .then(() => haptic('success'))
                .catch((e: unknown) => {
                  console.warn('[family] create failed', e instanceof Error ? e.message : 'unknown');
                  showError(t('family.error.save'));
                });
            },
          }}
          testID="family-empty"
        />
        {error ? (
          <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </Gutter>
    );
  }

  const slots = rideSlots(household, ctx.week);
  const gaps = rideGapCount(slots);
  const open = sortedShopping(household).filter((i) => !i.doneAt);

  return (
    <Gutter gap={4}>
      {error ? (
        <Text variant="bodyM" color="dangerText" accessibilityRole="alert" testID="family-error">
          {error}
        </Text>
      ) : null}
      <Card testID="family-members">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionTitle>{t('family.members')}</SectionTitle>
          <Button label={t('family.manage')} variant="tertiary" onPress={() => go('members')} testID="family-manage" />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[4] }}>
          {householdMemberIds(household).map((id) => (
            <View key={id} style={{ alignItems: 'center', gap: space[1] }}>
              <MemberAvatar
                name={memberName(household, id, t)}
                color={memberColor(household, id)}
                emoji={household.kids.find((k) => k.id === id)?.emoji}
              />
              <Text variant="label">{memberName(household, id, t)}</Text>
            </View>
          ))}
        </View>
      </Card>

      <WeekCard ctx={ctx} />

      <Card testID="family-rides-card">
        <SectionTitle>{t('family.rides')}</SectionTitle>
        <Text variant="titleM" testID="family-rides-summary">
          {slots.length === 0 ? t('family.rides.none') : t('family.rides.summary', { open: gaps })}
        </Text>
        {slots.length > 0 ? (
          <Button
            label={t('family.rides.open')}
            variant={gaps > 0 ? 'primary' : 'secondary'}
            onPress={() => go('rides')}
            testID="family-rides"
          />
        ) : null}
      </Card>

      <ChoresCard ctx={ctx} onAll={() => go('chores')} />

      <Card testID="family-shopping-card">
        <SectionTitle>{t('family.shopping')}</SectionTitle>
        <Text variant="titleM">{t('family.shopping.summary', { open: open.length })}</Text>
        {open.slice(0, 3).map((i) => (
          <Text key={i.id} variant="bodyM" color="textSecondary">
            {`• ${localized(i.title, i.titleI18n, ctx.locale)}${i.note ? ` (${i.note})` : ''}`}
          </Text>
        ))}
        <Button
          label={t('family.shopping.open')}
          variant="secondary"
          onPress={() => go('shopping')}
          testID="family-shopping"
        />
      </Card>
    </Gutter>
  );
}

function WeekCard({ ctx }: { ctx: FamilyContext }) {
  const { household, week, today, store, locale, t } = ctx;
  if (!household) return null;
  const tz = store.timeZone;
  const days = familyWeek(household, week, today, tz).map((d) => {
    const ids = Object.entries(d.byMember).flatMap(([id, n]) => Array.from({ length: n }, () => id));
    const full = d.total >= FULL_DAY;
    const date = noonOf(d.day, tz);
    return {
      key: d.day,
      label: formatWeekday(date, locale, 'short', tz),
      dots: ids.map((id) => dotColor(household, id)),
      full,
      today: d.day === today,
      accessibilityLabel: `${t('family.week.day', { day: formatLongDate(date, locale, tz), count: d.total })}${
        full ? `, ${t('family.week.full')}` : ''
      }`,
    };
  });
  return (
    <Card testID="family-week">
      <SectionTitle>{t('family.week')}</SectionTitle>
      <WeekBars days={days} />
      <Text variant="label" color="textSecondary">
        {t('family.week.hint')}
      </Text>
    </Card>
  );
}

function ChoresCard({ ctx, onAll }: { ctx: FamilyContext; onAll: () => void }) {
  const { household, today, t } = ctx;
  if (!household) return null;
  const due = choresFor(household, today);
  return (
    <Card testID="family-chores">
      <SectionTitle>{t('family.chores')}</SectionTitle>
      {due.length === 0 ? (
        <Text variant="bodyM" color="textSecondary">
          {t('family.chores.none')}
        </Text>
      ) : (
        due.map(({ chore, turn, done }) => (
          <ChoreRow key={chore.id} ctx={ctx} chore={chore} day={today} turn={turn} done={done} />
        ))
      )}
      <Button label={t('family.chores.all')} variant="tertiary" onPress={onAll} testID="family-chores-all" />
    </Card>
  );
}
