import { useState } from 'react';
import { View } from 'react-native';

import type { AgendaItem } from '@nowish/demo';
import { displayLocation, displayTitle, type DayKey, type FreeGap } from '@nowish/domain';
import { formatTime } from '@nowish/i18n';
import {
  Button,
  categoryColors,
  EmptyState,
  FadeIn,
  FilterChips,
  Gutter,
  ListCard,
  ListRow,
  SectionHeader,
  space,
  Text,
  type EventCategory,
  type FilterChipOption,
} from '@nowish/ui';

import { categoryIcon } from '../agenda/category-icons';
import { duration, leavePlanFor, timeLabel } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { useQuickAdd } from '../quick-add/QuickAddProvider';
import { itemKey } from './insights';

/** Rows shown before "See all" – keeps the page calm (PO feedback, Phase 8). */
const COLLAPSED = 3;

type Filter = EventCategory | 'all';

export function DaySection({
  day,
  title,
  items,
  gaps,
  tight,
  dense,
}: {
  day: DayKey;
  title: string;
  items: readonly AgendaItem[];
  gaps: readonly FreeGap[];
  tight: ReadonlySet<string>;
  dense: boolean;
}) {
  const { t, locale, now, openEvent, buffer, store } = useAgendaContext();
  const quick = useQuickAdd();
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState(false);
  const tz = store.timeZone;

  const present = [...new Set(items.map((i) => i.event.category))];
  const activeFilter: Filter = filter !== 'all' && !present.includes(filter) ? 'all' : filter;
  const filtered = items.filter((i) => activeFilter === 'all' || i.event.category === activeFilter);
  const visible = expanded ? filtered : filtered.slice(0, COLLAPSED);

  const chips: FilterChipOption<Filter>[] = [
    { value: 'all', label: t('day.filter.all'), icon: (c) => categoryIcon('all', c) },
    ...present.map((c) => ({ value: c, label: t(`category.${c}`), icon: (col: string) => categoryIcon(c, col) })),
  ];

  const gapRow = (g: FreeGap) => {
    const hour = Number(formatTime(g.from, 'de', tz).slice(0, 2));
    const idea = hour < 11 ? 'morning' : hour < 17 ? 'midday' : 'evening';
    const length = duration(g.minutes, t);
    return (
      <ListRow
        key={`gap-${g.from.toISOString()}`}
        marker="dashed"
        title={t('gap.free', { duration: length })}
        subtitle={t(`gap.idea.${idea}`)}
        accessibilityLabel={t('gap.free', { duration: length })}
        testID={`gap-${formatTime(g.from, 'de', tz).replace(':', '')}`}
        action={
          <Button
            label={t('gap.plan')}
            variant="secondary"
            onPress={() => quick.open(day)}
            accessibilityHint={t('gap.planA11y', { duration: length, time: formatTime(g.from, locale, tz) })}
            testID={`gap-plan-${formatTime(g.from, 'de', tz).replace(':', '')}`}
          />
        }
      />
    );
  };

  const rows: React.JSX.Element[] = [];
  const showGaps = activeFilter === 'all';
  if (showGaps) gaps.filter((g) => !g.after).forEach((g) => rows.push(gapRow(g)));
  visible.forEach((item) => {
    const e = item.event;
    const key = itemKey(item);
    const plan = leavePlanFor(e, item.start, buffer);
    const upcoming = item.end.getTime() > now.getTime();
    const place = displayLocation(e, locale);
    const leave = plan && upcoming ? formatTime(plan.leaveAt, locale, e.timeZone) : null;
    const time = timeLabel(item, locale, t);
    const isTight = tight.has(key);
    rows.push(
      <ListRow
        key={key}
        marker={{ color: categoryColors[e.category] }}
        title={displayTitle(e, locale)}
        subtitle={[place || null, leave ? t('day.leave', { time: leave }) : null].filter(Boolean).join(' · ')}
        trailing={item.allDay ? time : formatTime(item.start, locale, e.timeZone)}
        {...(isTight ? { note: t('day.tight') } : {})}
        onPress={() => openEvent(e.id, item.occurrenceKey)}
        accessibilityLabel={
          t('day.row', { title: displayTitle(e, locale), time, place: place || 'none', leave: leave ?? 'none' }) +
          (isTight ? `, ${t('day.tight')}` : '')
        }
        testID={`event-${e.id}`}
      />,
    );
    if (showGaps) gaps.filter((g) => g.after === key).forEach((g) => rows.push(gapRow(g)));
  });

  return (
    <Gutter gap={dense ? 3 : 4}>
      <SectionHeader
        title={title}
        {...(filtered.length > COLLAPSED
          ? {
              action: {
                label: expanded ? t('day.less') : t('day.all', { count: filtered.length }),
                onPress: () => setExpanded((x) => !x),
                testID: 'day-all',
              },
            }
          : {})}
      />
      <Text variant="label" color="textSecondary" testID="today-count">
        {t('today.count', { count: items.length })}
      </Text>
      {items.length === 0 ? (
        <EmptyState
          title={t('today.empty.title')}
          body={t('today.empty.body')}
          action={{ label: t('today.addEvent'), onPress: () => quick.open(day), testID: 'today-add' }}
          testID="today-empty"
        />
      ) : (
        <>
          {present.length > 1 ? (
            <View style={{ marginHorizontal: -space[5] }}>
              <FilterChips
                options={chips}
                value={activeFilter}
                onChange={(v) => {
                  setFilter(v);
                  setExpanded(false);
                }}
                accessibilityLabel={t('day.filter')}
                testIDPrefix="day-filter"
              />
            </View>
          ) : null}
          <FadeIn>
            {filtered.length === 0 ? (
              <Text variant="bodyM" color="textSecondary">
                {t('day.filter.empty')}
              </Text>
            ) : (
              <ListCard testID="day-list">{rows}</ListCard>
            )}
          </FadeIn>
        </>
      )}
    </Gutter>
  );
}
