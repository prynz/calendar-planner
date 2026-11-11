import { Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import {
  addChore,
  addDays,
  choresFor,
  choreTurn,
  householdMemberIds,
  localized,
  nextChoreDay,
  noonOf,
  removeChore,
  FAMILY_LIMITS,
  type Chore,
  type ChoreEvery,
  type Weekday,
} from '@nowish/domain';
import { formatShortDate } from '@nowish/i18n';
import {
  Button,
  Card,
  ChipGroup,
  EmptyState,
  IconButton,
  SectionTitle,
  SegmentedControl,
  space,
  Text,
  TextField,
} from '@nowish/ui';

import { weekdayLabels } from '../agenda/presenters';
import { confirm } from '@/services/confirm';

import { ChoreRow } from './ChoreRow';
import { FamilyShell } from './FamilyShell';
import { memberName, namesOf } from './names';
import { useFamily, type FamilyContext } from './use-family';

const EMOJIS = ['🍽️', '🗑️', '🌱', '🧺', '🐶', '🧹', '🛏️', '🚲'] as const;
const WEEKDAYS: readonly Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** FAM-07: chores with a fair, automatic rotation. */
export function ChoresScreen() {
  const ctx = useFamily();
  const { household, today, t } = ctx;
  const due = household ? choresFor(household, today) : [];
  return (
    <FamilyShell ctx={ctx} title={t('chores.title')} testID="screen-chores">
      <SectionTitle>{t('chores.today')}</SectionTitle>
      {due.length === 0 ? (
        <Text variant="bodyM" color="textSecondary">
          {t('family.chores.none')}
        </Text>
      ) : (
        due.map(({ chore, turn, done }) => (
          <ChoreRow key={chore.id} ctx={ctx} chore={chore} day={today} turn={turn} done={done} />
        ))
      )}
      <SectionTitle>{t('chores.all')}</SectionTitle>
      {household && household.chores.length === 0 ? (
        <EmptyState title={t('chores.empty.title')} body={t('chores.empty.body')} testID="chores-empty" />
      ) : (
        household?.chores.map((c) => <ChoreCard key={c.id} chore={c} ctx={ctx} />)
      )}
      <NewChore ctx={ctx} />
    </FamilyShell>
  );
}

function ChoreCard({ chore, ctx }: { chore: Chore; ctx: FamilyContext }) {
  const { household, today, locale, t, run, viewerId, store } = ctx;
  if (!household) return null;
  const tz = store.timeZone;
  const title = localized(chore.title, chore.titleI18n, locale);
  const nextDay = nextChoreDay(chore, addDays(today, 1));
  const weekday = chore.weekday !== undefined ? (weekdayLabels(locale, tz, 'long')[chore.weekday] ?? '') : '';
  return (
    <Card testID={`chore-card-${chore.id}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
        <View style={{ flex: 1 }}>
          <Text variant="titleM">{`${chore.emoji ? `${chore.emoji} ` : ''}${title}`}</Text>
        </View>
        <IconButton
          icon={(c) => <Trash2 color={c} size={18} />}
          accessibilityLabel={t('chores.remove')}
          onPress={() => {
            confirm(t('chores.remove.confirm', { title }), '', t('members.cancel'), [
              {
                label: t('chores.remove'),
                destructive: true,
                onPress: () => void run((h) => removeChore(h, viewerId, chore.id)),
              },
            ]);
          }}
          testID={`chore-remove-${chore.id}`}
        />
      </View>
      <Text variant="bodyM" color="textSecondary">
        {chore.every === 'daily' ? t('chores.every.daily') : t('chores.every.weekly', { weekday })}
      </Text>
      <Text variant="bodyM" color="textSecondary">
        {t('chores.rotation', { names: namesOf(household, chore.rotation, t) })}
      </Text>
      <Text variant="label" color="textSecondary">
        {choreTurn(chore, nextDay) === viewerId
          ? t('chores.nextYou', { day: formatShortDate(noonOf(nextDay, tz), locale, tz) })
          : t('chores.next', {
              name: memberName(household, choreTurn(chore, nextDay) ?? '', t),
              day: formatShortDate(noonOf(nextDay, tz), locale, tz),
            })}
      </Text>
    </Card>
  );
}

function NewChore({ ctx }: { ctx: FamilyContext }) {
  const { household, today, t, run, viewerId, locale, store } = ctx;
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState<string>(EMOJIS[0]);
  const [every, setEvery] = useState<ChoreEvery>('weekly');
  const [weekday, setWeekday] = useState<Weekday>(5);
  const [rotation, setRotation] = useState<string[]>([]);
  if (!household) return null;
  const tz = store.timeZone;
  const create = () =>
    void run(
      (h, now) =>
        addChore(
          h,
          viewerId,
          { title, emoji, every, ...(every === 'weekly' ? { weekday } : {}), rotation },
          today,
          now,
        ),
      'success',
    ).then((ok) => {
      if (ok) {
        setTitle('');
        setRotation([]);
      }
    });
  return (
    <Card testID="chore-new">
      <SectionTitle>{t('chores.new')}</SectionTitle>
      <TextField
        label={t('chores.name')}
        value={title}
        onChangeText={setTitle}
        maxLength={FAMILY_LIMITS.title}
        testID="chore-title"
      />
      <ChipGroup
        options={EMOJIS.map((e) => ({ value: e, label: e }))}
        selected={[emoji]}
        onToggle={setEmoji}
        accessibilityLabel={t('chores.emoji')}
        testIDPrefix="chore-emoji"
      />
      <SegmentedControl<ChoreEvery>
        options={[
          { value: 'daily', label: t('chores.every.daily') },
          { value: 'weekly', label: t('chores.every.weeklyShort') },
        ]}
        value={every}
        onChange={setEvery}
        accessibilityLabel={t('chores.how')}
        testIDPrefix="chore-every"
      />
      {every === 'weekly' ? (
        <ChipGroup
          options={WEEKDAYS.map((d) => ({ value: String(d), label: weekdayLabels(locale, tz)[d] ?? '' }))}
          selected={[String(weekday)]}
          onToggle={(v) => setWeekday(Number(v) as Weekday)} // values come from WEEKDAYS above
          accessibilityLabel={t('chores.weekday')}
          testIDPrefix="chore-weekday"
        />
      ) : null}
      <Text variant="label" color="textSecondary">
        {t('chores.who')}
      </Text>
      <ChipGroup
        multiple
        options={householdMemberIds(household).map((id) => ({ value: id, label: memberName(household, id, t) }))}
        selected={rotation}
        onToggle={(id) => setRotation((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]))}
        accessibilityLabel={t('chores.who')}
        testIDPrefix="chore-who"
      />
      <Button
        label={t('chores.add')}
        onPress={create}
        disabled={title.trim().length === 0 || rotation.length === 0}
        testID="chore-add"
      />
    </Card>
  );
}
