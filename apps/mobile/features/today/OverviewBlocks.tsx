import { X } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { addDays, noonOf } from '@nowish/domain';
import { formatTime, formatWeekday } from '@nowish/i18n';
import {
  BottomSheet,
  Button,
  CheckRow,
  FadeIn,
  Gutter,
  IconButton,
  SectionHeader,
  SoftCard,
  space,
  StatTile,
  Text,
} from '@nowish/ui';

import { useSettings, MAX_WEEK_TILES, WEEK_TILES, type WeekTile } from '@/providers/settings';
import { haptic } from '@/services/haptics';

import { duration, leavePlanFor } from '../agenda/presenters';
import { useAgendaContext } from '../agenda/use-agenda';
import { dayInsights, weekTileValues } from './insights';

/** From this hour the overview looks at tomorrow instead of today (evening review). */
const EVENING_HOUR = 18;

/** "Your day in 10 seconds" (Phase 8): three numbers, hideable for the rest of the session. */
export function SummaryCard({ hour }: { hour: number }) {
  const { store, now, locale, t, today, buffer } = useAgendaContext();
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const evening = hour >= EVENING_HOUR;
  const day = evening ? addDays(today, 1) : today;
  const insight = dayInsights(store.events, day, store.timeZone, now, buffer);
  const leaves = insight.items
    .map((i) => leavePlanFor(i.event, i.start, buffer)?.leaveAt)
    .filter((d): d is Date => d instanceof Date && d.getTime() > now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  const freeMinutes = insight.gaps.reduce((sum, g) => sum + g.minutes, 0);
  const figures: [string, string][] = [
    [String(insight.items.length), t('summary.count', { count: insight.items.length })],
    evening
      ? [leaves[0] ? formatTime(leaves[0], locale, store.timeZone) : t('summary.none'), t('summary.firstLeave')]
      : [String(insight.conflicts.length), t('summary.tight', { count: insight.conflicts.length })],
    [freeMinutes > 0 ? duration(freeMinutes, t) : t('summary.none'), t('summary.free')],
  ];
  return (
    <Gutter>
      <FadeIn>
        <SoftCard testID="summary-card">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="label" color="textSecondary" accessibilityRole="header">
              {t(evening ? 'summary.title.evening' : 'summary.title.morning')}
            </Text>
            <IconButton
              icon={(c) => <X color={c} size={18} strokeWidth={2.5} />}
              onPress={() => {
                haptic('selection');
                setHidden(true);
              }}
              accessibilityLabel={t('summary.hide')}
              testID="summary-hide"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            {figures.map(([value, label]) => (
              <View
                key={label}
                style={{ flex: 1, gap: space[0.5] }}
                accessible
                accessibilityLabel={`${value} ${label}`}
              >
                <Text variant="titleM" tabular>
                  {value}
                </Text>
                <Text variant="label" color="textSecondary">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </SoftCard>
      </FadeIn>
    </Gutter>
  );
}

/** "This week": up to three tiles the user picks (Phase 8). */
export function WeekSection() {
  const { store, now, locale, t, today } = useAgendaContext();
  const { settings, set } = useSettings();
  const [sheet, setSheet] = useState(false);
  const tz = store.timeZone;
  const values = weekTileValues(
    { events: store.events, collabs: store.collabs, journeys: store.journeys, household: store.household },
    today,
    tz,
    now,
    (day) => formatWeekday(noonOf(day, tz), locale, 'short', tz),
  );
  const toggle = (tile: WeekTile) => {
    haptic('selection');
    const on = settings.weekTiles.includes(tile);
    if (on)
      set(
        'weekTiles',
        settings.weekTiles.filter((x) => x !== tile),
      );
    else if (settings.weekTiles.length < MAX_WEEK_TILES) set('weekTiles', [...settings.weekTiles, tile]);
  };
  return (
    <Gutter gap={4}>
      <SectionHeader
        title={t('week.title')}
        action={{ label: t('week.customize'), onPress: () => setSheet(true), testID: 'week-customize' }}
      />
      {settings.weekTiles.length > 0 ? (
        <View style={{ flexDirection: 'row', gap: space[3] }}>
          {settings.weekTiles.map((tile) => (
            <StatTile
              key={tile}
              value={values[tile] ?? t('summary.none')}
              label={t(`tile.${tile}`)}
              testID={`week-tile-${tile}`}
            />
          ))}
        </View>
      ) : null}
      <BottomSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={t('week.sheet')}
        closeLabel={t('common.close')}
        testID="week-sheet"
      >
        <Text variant="bodyM" color="textSecondary">
          {t('week.sheet.hint', { max: MAX_WEEK_TILES })}
        </Text>
        <View>
          {WEEK_TILES.map((tile) => {
            const on = settings.weekTiles.includes(tile);
            const full = !on && settings.weekTiles.length >= MAX_WEEK_TILES;
            const label = t(`tile.${tile}.long`);
            return (
              <CheckRow
                key={tile}
                label={full ? t('week.sheet.full', { label, max: MAX_WEEK_TILES }) : label}
                checked={on}
                onToggle={() => toggle(tile)}
                testID={`week-option-${tile}`}
              />
            );
          })}
        </View>
        <Button label={t('week.sheet.done')} size="lg" onPress={() => setSheet(false)} testID="week-sheet-done" />
      </BottomSheet>
    </Gutter>
  );
}
