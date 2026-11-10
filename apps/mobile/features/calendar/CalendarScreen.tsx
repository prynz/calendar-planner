import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { agendaBetween, agendaForDay, type AgendaItem } from '@nowish/demo';
import { addDays, noonOf, weekdayOf, type DayKey } from '@nowish/domain';
import { formatLongDate, formatMonthYear, formatShortDate } from '@nowish/i18n';
import {
  Button,
  EmptyState,
  EventCard,
  FadeIn,
  Gutter,
  IconButton,
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

  const cards = (items: AgendaItem[]) =>
    items.map((item, i) => (
      <FadeIn key={`${item.event.id}-${item.occurrenceKey}`} delay={i * 30}>
        <EventCard
          {...eventCardProps(item, ctx.now, locale, t, ctx.buffer)}
          onPress={() => ctx.openEvent(item.event.id, item.occurrenceKey)}
        />
      </FadeIn>
    ));

  const dayTitle = (d: DayKey) => (
    <Text variant="label" color={d === today ? 'accentText' : 'textSecondary'} accessibilityRole="header">
      {formatLongDate(noonOf(d, tz), locale, tz)}
    </Text>
  );

  let body: React.ReactNode = null;
  if (mode === 'month') {
    const items = agendaForDay(store.events, selected, tz);
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
          rows={monthRows(monthAnchor, today, store.events, tz, locale, t)}
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
            action={{ label: t('today.addEvent'), onPress: () => ctx.createEvent(selected), testID: 'cal-add' }}
          />
        ) : (
          cards(items)
        )}
      </Gutter>
    );
  } else if (mode === 'week') {
    const end = addDays(weekStart, 7);
    const groups = groupByDay(agendaBetween(store.events, weekStart, end, tz), weekStart, end, tz, true);
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
    const groups = groupByDay(agendaBetween(store.events, today, end, tz), today, end, tz, false);
    body = (
      <Gutter gap={5}>
        {groups.length === 0 ? (
          <EmptyState
            title={t('calendar.free')}
            body={t('calendar.list.empty')}
            action={{ label: t('today.addEvent'), onPress: () => ctx.createEvent(), testID: 'list-add' }}
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
      <StoreGate>{body}</StoreGate>
    </Screen>
  );
}
