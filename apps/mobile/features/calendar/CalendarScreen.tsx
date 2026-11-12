import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { agendaBetween, agendaForDay, type AgendaItem } from '@nowish/demo';
import { addDays, noonOf, weekdayOf, type DayKey } from '@nowish/domain';
import { formatLongDate, formatMonthYear, formatShortDate } from '@nowish/i18n';
import {
  Button,
  categoryColors,
  EmptyState,
  FadeIn,
  FilterChips,
  Gutter,
  IconButton,
  ListCard,
  ListRow,
  MemberAvatar,
  MonthGrid,
  Screen,
  ScreenHeader,
  SegmentedControl,
  space,
  Text,
} from '@nowish/ui';

import { addMonths, eventCardProps, groupByDay, monthRows, monthStart, weekdayLabels } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { haptic } from '@/services/haptics';

import { categoryIcon } from '../agenda/category-icons';
import { dotColor, memberName } from '../family/names';
import { useQuickAdd } from '../quick-add/QuickAddProvider';
import { useRowActions } from '../today/row-actions';
import { calendarPeople, isFor, type PersonFilter } from './people';

type View_ = 'week' | 'month' | 'list';
const LIST_DAYS = 30;

export function CalendarScreen() {
  const ctx = useAgendaContext();
  const { store, locale, t, today } = ctx;
  const tz = store.timeZone;
  const [mode, setMode] = useState<View_>('month');
  const [selected, setSelected] = useState<DayKey>(today);
  const [monthAnchor, setMonthAnchor] = useState<DayKey>(monthStart(today));
  const [weekStart, setWeekStart] = useState<DayKey>(addDays(today, -weekdayOf(today)));
  const [person, setPerson] = useState<PersonFilter>('all');
  const quick = useQuickAdd();
  const actions = useRowActions();
  const household = store.household;
  const people = calendarPeople(household);
  const activePerson = person === 'all' || people.includes(person) ? person : 'all';
  const events = store.events.filter((e) => isFor(household, e, activePerson));

  const goToday = () => {
    haptic('selection');
    setSelected(today);
    setMonthAnchor(monthStart(today));
    setWeekStart(addDays(today, -weekdayOf(today)));
  };

  const pager = (label: string, onPrev: () => void, onNext: () => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
      <IconButton
        icon={(c) => <ChevronLeft color={c} size={22} />}
        onPress={onPrev}
        accessibilityLabel={t('calendar.prev')}
        testID="cal-prev"
      />
      <View style={{ flex: 1, alignItems: 'center' }} accessibilityLiveRegion="polite">
        <Text variant="titleM" testID="cal-label">
          {label}
        </Text>
      </View>
      <IconButton
        icon={(c) => <ChevronRight color={c} size={22} />}
        onPress={onNext}
        accessibilityLabel={t('calendar.next')}
        testID="cal-next"
      />
    </View>
  );

  // Phase 8: one calm white card per day with simple rows; Phase 10: tick off and swipe like on "Today".
  const cards = (items: AgendaItem[]) => (
    <FadeIn>
      <ListCard>
        {items.map((item) => {
          const card = eventCardProps(item, ctx.now, locale, t, ctx.buffer);
          const sub = [card.subtitle, card.leaveLabel].filter(Boolean).join(' · ');
          return actions.wrap(item, (x) => (
            <ListRow
              marker={{ color: categoryColors[item.event.category] }}
              title={card.title}
              {...(sub ? { subtitle: sub } : {})}
              trailing={card.timeLabel}
              onPress={() => ctx.openEvent(item.event.id, item.occurrenceKey)}
              accessibilityLabel={
                [card.title, card.timeLabel, sub, card.statusLabel].filter(Boolean).join(', ') + x.a11ySuffix
              }
              {...(card.testID ? { testID: card.testID } : {})}
              check={x.check}
            />
          ));
        })}
      </ListCard>
    </FadeIn>
  );

  const dayTitle = (d: DayKey) => (
    <Text variant="label" color={d === today ? 'accentText' : 'textSecondary'} accessibilityRole="header">
      {formatLongDate(noonOf(d, tz), locale, tz)}
    </Text>
  );

  let body: React.ReactNode = null;
  if (mode === 'month') {
    const items = agendaForDay(events, selected, tz);
    body = (
      <Gutter gap={4}>
        {pager(
          formatMonthYear(noonOf(monthAnchor, tz), locale, tz),
          () => {
            haptic('selection');
            setMonthAnchor(addMonths(monthAnchor, -1));
          },
          () => {
            haptic('selection');
            setMonthAnchor(addMonths(monthAnchor, 1));
          },
        )}
        <MonthGrid
          weekdayLabels={weekdayLabels(locale, tz)}
          rows={monthRows(monthAnchor, today, events, tz, locale, t)}
          selectedKey={selected}
          onSelect={(k) => {
            haptic('selection');
            setSelected(k);
          }}
        />
        {dayTitle(selected)}
        {items.length === 0 ? (
          <EmptyState
            title={t('calendar.free')}
            body={t('today.empty.body')}
            action={{ label: t('today.addEvent'), onPress: () => quick.open(selected), testID: 'cal-add' }}
          />
        ) : (
          cards(items)
        )}
      </Gutter>
    );
  } else if (mode === 'week') {
    const end = addDays(weekStart, 7);
    const groups = groupByDay(agendaBetween(events, weekStart, end, tz), weekStart, end, tz, true);
    body = (
      <Gutter gap={4}>
        {pager(
          t('calendar.range', {
            from: formatShortDate(noonOf(weekStart, tz), locale, tz),
            to: formatShortDate(noonOf(addDays(weekStart, 6), tz), locale, tz),
          }),
          () => {
            haptic('selection');
            setWeekStart(addDays(weekStart, -7));
          },
          () => {
            haptic('selection');
            setWeekStart(addDays(weekStart, 7));
          },
        )}
        {groups.map((g) => (
          <View key={g.day} style={{ gap: space[2] }}>
            {dayTitle(g.day)}
            {g.items.length === 0 ? (
              <Text variant="bodyM" color="textSecondary">
                {t('calendar.free')}
              </Text>
            ) : (
              cards(g.items)
            )}
          </View>
        ))}
      </Gutter>
    );
  } else {
    const end = addDays(today, LIST_DAYS);
    const groups = groupByDay(agendaBetween(events, today, end, tz), today, end, tz, false);
    body = (
      <Gutter gap={5}>
        {groups.length === 0 ? (
          <EmptyState
            title={t('calendar.free')}
            body={t('calendar.list.empty')}
            action={{ label: t('today.addEvent'), onPress: () => quick.open(), testID: 'list-add' }}
          />
        ) : (
          groups.map((g) => (
            <View key={g.day} style={{ gap: space[2] }}>
              {dayTitle(g.day)}
              {cards(g.items)}
            </View>
          ))
        )}
      </Gutter>
    );
  }

  return (
    <Screen testID="screen-calendar">
      <ScreenHeader
        title={t('calendar.title')}
        trailing={<Button label={t('calendar.today')} variant="secondary" onPress={goToday} testID="cal-today" />}
      />
      <Gutter>
        <SegmentedControl
          options={[
            { value: 'week', label: t('calendar.view.week') },
            { value: 'month', label: t('calendar.view.month') },
            { value: 'list', label: t('calendar.view.list') },
          ]}
          value={mode}
          onChange={(v) => {
            haptic('selection');
            setMode(v);
          }}
          accessibilityLabel={t('calendar.title')}
          testIDPrefix="cal-view"
        />
      </Gutter>
      {people.length > 1 ? (
        <FilterChips
          options={[
            { value: 'all', label: t('calendar.people.all'), icon: (c: string) => categoryIcon('all', c) },
            ...people.map((id) => ({
              value: id,
              label: memberName(household, id, t),
              icon: () => (
                <MemberAvatar
                  name={memberName(household, id, t)}
                  color={household ? dotColor(household, id) : undefined}
                  size="sm"
                />
              ),
            })),
          ]}
          value={activePerson}
          onChange={(v) => {
            haptic('selection');
            setPerson(v);
          }}
          accessibilityLabel={t('calendar.people')}
          testIDPrefix="cal-person"
        />
      ) : null}
      <StoreGate>{body}</StoreGate>
      {actions.sheet}
    </Screen>
  );
}
