import { useRouter } from 'expo-router';
import { Target } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { agendaForDay } from '@nowish/demo';
import {
  Badge,
  Button,
  Card,
  DateStrip,
  EmptyState,
  EventCard,
  FadeIn,
  Gutter,
  IconButton,
  LeaveHero,
  Screen,
  ScreenHeader,
  space,
  Text,
} from '@nowish/ui';

import { agendaBetweenFor } from '../leave/hero-item';
import { LeavePanel } from '../leave/LeavePanel';
import { dateStripDays, dayHeading, eventCardProps, leaveHero, leavePlanFor } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { haptic } from '@/services/haptics';

export function TodayScreen() {
  const { store, now, locale, t, today, openEvent, createEvent, buffer } = useAgendaContext();
  const [selected, setSelected] = useState(today);
  const tz = store.timeZone;
  const items = agendaForDay(store.events, selected, tz);
  const heading = dayHeading(selected, today, tz, locale, t);
  const router = useRouter();
  const hero = selected === today ? leaveHero(store.events, now, locale, t, buffer, tz) : null;
  const heroItem = hero ? agendaBetweenFor(store.events, hero.eventId, hero.occurrenceKey, tz) : null;
  const heroPlan = heroItem ? leavePlanFor(heroItem.event, heroItem.start, buffer) : null;

  const select = (key: string) => {
    haptic('selection');
    setSelected(key);
  };

  return (
    <Screen testID="screen-today">
      <ScreenHeader
        eyebrow={heading.eyebrow}
        title={heading.title}
        trailing={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <IconButton
              icon={(c) => <Target color={c} size={20} />}
              onPress={() => {
                haptic('light');
                router.push('/focus');
              }}
              accessibilityLabel={t('today.focus')}
              testID="open-focus"
            />
            <Badge label={t('demo.badge')} tone="demo" testID="demo-badge" />
          </View>
        }
      />
      <StoreGate>
        {hero ? (
          <Gutter>
            <FadeIn>
              <LeaveHero {...hero} openHint={t('event.openHint')} onPress={() => openEvent(hero.eventId, today)} />
            </FadeIn>
            {heroItem && heroPlan ? (
              <LeavePanel
                event={heroItem.event}
                occurrenceKey={heroItem.occurrenceKey}
                start={heroItem.start}
                plan={heroPlan}
                compact
              />
            ) : null}
          </Gutter>
        ) : (
          <Gutter>
            <Card testID="demo-banner">
              <Text variant="bodyM" color="textSecondary">
                {t('demo.banner')}
              </Text>
            </Card>
          </Gutter>
        )}
        <DateStrip days={dateStripDays(store.events, today, tz, locale, t)} selectedKey={selected} onSelect={select} />
        <Gutter gap={4}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: space[12],
            }}
          >
            <Text variant="label" color="textSecondary" testID="today-count">
              {t('today.count', { count: items.length })}
            </Text>
            {selected !== today ? (
              <Button
                label={t('today.backToToday')}
                variant="tertiary"
                onPress={() => select(today)}
                testID="back-to-today"
              />
            ) : null}
          </View>
          {items.length === 0 ? (
            <EmptyState
              title={t('today.empty.title')}
              body={t('today.empty.body')}
              action={{ label: t('today.addEvent'), onPress: () => createEvent(selected), testID: 'today-add' }}
              testID="today-empty"
            />
          ) : (
            items.map((item, i) => (
              <FadeIn key={`${item.event.id}-${item.occurrenceKey}`} delay={i * 40}>
                <EventCard
                  {...eventCardProps(item, now, locale, t, buffer)}
                  onPress={() => openEvent(item.event.id, item.occurrenceKey)}
                />
              </FadeIn>
            ))
          )}
        </Gutter>
      </StoreGate>
    </Screen>
  );
}
