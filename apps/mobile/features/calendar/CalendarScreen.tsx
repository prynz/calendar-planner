import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { agendaBetween, agendaForDay, type AgendaItem } from '@nowish/demo';
import { addDays, noonOf, parseDayKey, weekdayOf, type DayKey } from '@nowish/domain';
import { formatLongDate, formatMonthYear, formatShortDate } from '@nowish/i18n';
import {
  Button,
  categoryColors,
  EmptyState,
  FadeIn,
  FilterChips,
  Gutter,
  HEAT_ALPHA,
  IconButton,
  ListCard,
  ListRow,
  MemberAvatar,
  MonthGrid,
  PressableScale,
  Screen,
  ScreenHeader,
  SegmentedControl,
  space,
  Text,
  touch,
  useTheme,
  withAlpha,
  YearGrid,
  ZoomStage,
} from '@nowish/ui';

import {
  addMonths,
  eventCardProps,
  groupByDay,
  monthRows,
  monthStart,
  weekdayLabels,
  yearMonths,
} from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { haptic } from '@/services/haptics';

import { categoryIcon } from '../agenda/category-icons';
import { dotColor, memberName } from '../family/names';
import { useQuickAdd } from '../quick-add/QuickAddProvider';
import { AccountButton } from '../shell/AccountButton';
import { useRowActions } from '../today/row-actions';
import { calendarPeople, isFor, type PersonFilter } from './people';

/** Zoom levels, widest first (Phase 12, ADR 0017). The deepest step – one plan – is the detail screen. */
const LEVELS = ['year', 'month', 'week', 'day'] as const;
type Level = (typeof LEVELS)[number];
const weekOf = (day: DayKey) => addDays(day, -weekdayOf(day));

export function CalendarScreen() {
  const ctx = useAgendaContext();
  const { store, locale, t, today } = ctx;
  const { colors } = useTheme();
  const tz = store.timeZone;
  const [mode, setMode] = useState<Level>('month');
  /** The focus day: it stays the anchor while zooming in and out. */
  const [selected, setSelected] = useState<DayKey>(today);
  const [monthAnchor, setMonthAnchor] = useState<DayKey>(monthStart(today));
  const [weekStart, setWeekStart] = useState<DayKey>(weekOf(today));
  const [year, setYear] = useState<number>(parseDayKey(today).year);
  const [person, setPerson] = useState<PersonFilter>('all');
  const quick = useQuickAdd();
  const actions = useRowActions();
  const household = store.household;
  const people = calendarPeople(household);
  const activePerson = person === 'all' || people.includes(person) ? person : 'all';
  const events = store.events.filter((e) => isFor(household, e, activePerson));

  /** Change the level around a focus day, so nobody gets lost while zooming. */
  const zoomTo = (next: Level, focus: DayKey = selected) => {
    haptic('selection');
    setSelected(focus);
    setMonthAnchor(monthStart(focus));
    setWeekStart(weekOf(focus));
    setYear(parseDayKey(focus).year);
    setMode(next);
  };
  const zoomBy = (direction: 1 | -1) => {
    const next = LEVELS[LEVELS.indexOf(mode) + direction];
    if (next) zoomTo(next);
  };

  const goToday = () => {
    haptic('selection');
    setSelected(today);
    setMonthAnchor(monthStart(today));
    setWeekStart(weekOf(today));
    setYear(parseDayKey(today).year);
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
  /** In the week, a day's heading zooms into that day. */
  const dayLink = (d: DayKey) => (
    <PressableScale
      onPress={() => zoomTo('day', d)}
      accessibilityRole="button"
      accessibilityLabel={t('calendar.openDay', { date: formatLongDate(noonOf(d, tz), locale, tz) })}
      testID={`week-day-${d}`}
      style={{ minHeight: touch.min, justifyContent: 'center' }}
    >
      <Text variant="label" color={d === today ? 'accentText' : 'textSecondary'}>
        {formatLongDate(noonOf(d, tz), locale, tz)}
      </Text>
    </PressableScale>
  );

  const legend = (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: space[1] }}
      accessible
      accessibilityLabel={t('calendar.heat.a11y')}
    >
      <Text variant="label" color="textSecondary">
        {t('calendar.heat.free')}
      </Text>
      {([0, 1, 2, 3, 4] as const).map((l) => (
        <View
          key={l}
          style={{
            width: space[5],
            height: space[3],
            borderRadius: space[1],
            backgroundColor: l === 0 ? colors.elevated : withAlpha(colors.secondaryFill, HEAT_ALPHA[l]),
          }}
        />
      ))}
      <Text variant="label" color="textSecondary">
        {t('calendar.heat.full')}
      </Text>
    </View>
  );

  let body: React.ReactNode = null;
  if (mode === 'year') {
    body = (
      <Gutter gap={4}>
        {pager(
          String(year),
          () => {
            haptic('selection');
            setYear(year - 1);
          },
          () => {
            haptic('selection');
            setYear(year + 1);
          },
        )}
        <YearGrid
          months={yearMonths(year, today, events, tz, locale, t)}
          onSelect={(key) => zoomTo('month', key === monthStart(selected) ? selected : key)}
        />
        {legend}
      </Gutter>
    );
  } else if (mode === 'month') {
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
        {legend}
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
          <View key={g.day} style={{ gap: space[1] }}>
            {dayLink(g.day)}
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
    const items = agendaForDay(events, selected, tz);
    body = (
      <Gutter gap={4}>
        {pager(
          formatLongDate(noonOf(selected, tz), locale, tz),
          () => zoomTo('day', addDays(selected, -1)),
          () => zoomTo('day', addDays(selected, 1)),
        )}
        {items.length === 0 ? (
          <EmptyState
            title={t('calendar.free')}
            body={t('today.empty.body')}
            action={{ label: t('today.addEvent'), onPress: () => quick.open(selected), testID: 'day-add' }}
          />
        ) : (
          cards(items)
        )}
      </Gutter>
    );
  }

  return (
    <Screen testID="screen-calendar">
      <ScreenHeader
        title={t('calendar.title')}
        trailing={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Button label={t('calendar.today')} variant="secondary" onPress={goToday} testID="cal-today" />
            <AccountButton />
          </View>
        }
      />
      <Gutter>
        <SegmentedControl
          options={[
            { value: 'year', label: t('calendar.view.year') },
            { value: 'month', label: t('calendar.view.month') },
            { value: 'week', label: t('calendar.view.week') },
            { value: 'day', label: t('calendar.view.day') },
          ]}
          value={mode}
          onChange={(v) => zoomTo(v)}
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
      <StoreGate>
        <ZoomStage level={LEVELS.indexOf(mode)} onZoom={zoomBy}>
          {body}
        </ZoomStage>
        <Gutter>
          <Text variant="label" color="textSecondary">
            {t('calendar.zoomHint')}
          </Text>
        </Gutter>
      </StoreGate>
      {actions.sheet}
    </Screen>
  );
}
