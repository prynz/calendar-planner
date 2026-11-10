import { View } from 'react-native';

import { upcomingSocial } from '@nowish/demo';
import { dayKeyOf, noonOf } from '@nowish/domain';
import { formatLongDate } from '@nowish/i18n';
import { Badge, Card, EmptyState, EventCard, FadeIn, Gutter, Screen, ScreenHeader, space, Text } from '@nowish/ui';

import { eventCardProps } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';

export function EventsScreen() {
  const { store, now, locale, t, openEvent, buffer } = useAgendaContext();
  const tz = store.timeZone;
  const items = upcomingSocial(store.events, now, tz);

  return (
    <Screen testID="screen-events">
      <ScreenHeader
        eyebrow={t('events.eyebrow')}
        title={t('events.title')}
        trailing={<Badge label={t('demo.badge')} tone="demo" />}
      />
      <Gutter>
        <Card>
          <Text variant="bodyM" color="textSecondary">
            {t('events.readOnlyHint')}
          </Text>
        </Card>
      </Gutter>
      <StoreGate>
        <Gutter gap={5}>
          {items.length === 0 ? (
            <EmptyState title={t('events.empty.title')} body={t('events.empty.body')} testID="events-empty" />
          ) : (
            items.map((item, i) => (
              <FadeIn key={`${item.event.id}-${item.occurrenceKey}`} delay={i * 40}>
                <View style={{ gap: space[2] }}>
                  <Text variant="label" color="textSecondary">
                    {formatLongDate(noonOf(dayKeyOf(item.start, tz), tz), locale, tz)}
                  </Text>
                  <EventCard
                    {...eventCardProps(item, now, locale, t, buffer)}
                    onPress={() => openEvent(item.event.id, item.occurrenceKey)}
                  />
                  {item.event.rsvp ? (
                    <Text variant="label" color="textSecondary" testID={`rsvp-${item.event.id}`}>
                      {t('events.rsvp', {
                        yes: item.event.rsvp.yes,
                        maybe: item.event.rsvp.maybe,
                        open: item.event.rsvp.open,
                      })}
                    </Text>
                  ) : null}
                </View>
              </FadeIn>
            ))
          )}
        </Gutter>
      </StoreGate>
    </Screen>
  );
}
