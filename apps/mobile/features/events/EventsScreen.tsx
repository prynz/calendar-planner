import { View } from 'react-native';

import { upcomingSocialEvents } from '@nowish/demo';
import { noonOf, dayKeyOf } from '@nowish/domain';
import { formatLongDate } from '@nowish/i18n';
import { Badge, Card, EmptyState, EventCard, Gutter, Screen, ScreenHeader, space, Text } from '@nowish/ui';

import { useNow } from '@/providers/clock';
import { useDemoWorld } from '@/providers/demo-world';
import { useI18n } from '@/providers/i18n';

import { eventCardProps } from '../agenda/presenters';

export function EventsScreen() {
  const world = useDemoWorld();
  const now = useNow();
  const { locale, t } = useI18n();
  const events = upcomingSocialEvents(world, now);

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
      <Gutter gap={5}>
        {events.length === 0 ? (
          <EmptyState title={t('events.empty.title')} body={t('events.empty.body')} testID="events-empty" />
        ) : (
          events.map((e) => (
            <View key={e.id} style={{ gap: space[2] }}>
              <Text variant="label" color="textSecondary">
                {formatLongDate(noonOf(dayKeyOf(e.start, world.timeZone), world.timeZone), locale, world.timeZone)}
              </Text>
              <EventCard {...eventCardProps(e, world, now, locale, t)} />
              {e.rsvp ? (
                <Text variant="label" color="textSecondary" testID={`rsvp-${e.id}`}>
                  {t('events.rsvp', { yes: e.rsvp.yes, maybe: e.rsvp.maybe, open: e.rsvp.open })}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </Gutter>
    </Screen>
  );
}
