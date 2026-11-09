import { useState } from 'react';
import { View } from 'react-native';

import { agendaForDay } from '@nowish/demo';
import { Badge, Button, Card, DateStrip, EmptyState, EventCard, Gutter, Screen, ScreenHeader, Text } from '@nowish/ui';

import { useNow } from '@/providers/clock';
import { useDemoWorld } from '@/providers/demo-world';
import { useI18n } from '@/providers/i18n';
import { haptic } from '@/services/haptics';

import { dateStripDays, dayHeading, eventCardProps } from '../agenda/presenters';

export function TodayScreen() {
  const world = useDemoWorld();
  const now = useNow();
  const { locale, t } = useI18n();
  const [selected, setSelected] = useState(world.today);

  const day = selected;
  const events = agendaForDay(world, day);
  const heading = dayHeading(world, day, locale, t);

  const select = (key: string) => {
    haptic('selection');
    setSelected(key);
  };

  return (
    <Screen testID="screen-today">
      <ScreenHeader
        eyebrow={heading.eyebrow}
        title={heading.title}
        trailing={<Badge label={t('demo.badge')} tone="demo" testID="demo-badge" />}
      />
      <Gutter>
        <Card testID="demo-banner">
          <Text variant="bodyM" color="textSecondary">
            {t('demo.banner')}
          </Text>
        </Card>
      </Gutter>
      <DateStrip days={dateStripDays(world, locale, t)} selectedKey={day} onSelect={select} />
      <Gutter gap={4}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text variant="label" color="textSecondary" testID="today-count">
            {t('today.count', { count: events.length })}
          </Text>
          {day !== world.today ? (
            <Button
              label={t('today.backToToday')}
              variant="tertiary"
              onPress={() => select(world.today)}
              testID="back-to-today"
            />
          ) : null}
        </View>
        {events.length === 0 ? (
          <EmptyState title={t('today.empty.title')} body={t('today.empty.body')} testID="today-empty" />
        ) : (
          events.map((e) => <EventCard key={e.id} {...eventCardProps(e, world, now, locale, t)} />)
        )}
      </Gutter>
    </Screen>
  );
}
