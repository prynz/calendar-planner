import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { upcomingSocial, type AgendaItem } from '@nowish/demo';
import { dayKeyOf, invitationOf, noonOf, rsvpState, rsvpSummary, type RsvpState } from '@nowish/domain';
import { formatLongDate } from '@nowish/i18n';
import { Button, EmptyState, EventCard, FadeIn, Gutter, SectionTitle, space, Text } from '@nowish/ui';

import { eventCardProps, VIEWER_ID } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { haptic } from '@/services/haptics';

type ViewerRole = RsvpState | 'host' | null;

/** Upcoming social events: open invitations first, then everything else (EVT-01, EVT-04). */
export function EventsSection() {
  const ctx = useAgendaContext();
  const { store, now, t } = ctx;
  const router = useRouter();
  const items = upcomingSocial(store.events, now, store.timeZone);
  const roleOf = (eventId: string): ViewerRole => {
    const c = store.getCollab(eventId);
    if (!c) return null;
    if (c.hostId === VIEWER_ID) return 'host';
    const inv = invitationOf(c, VIEWER_ID);
    return inv ? rsvpState(inv, c.maybeDeadline, now) : null;
  };
  const needsAnswer = (i: AgendaItem) => {
    const r = roleOf(i.event.id);
    return r === 'pending' || r === 'expired';
  };
  const invitations = items.filter(needsAnswer);
  const upcoming = items.filter((i) => !needsAnswer(i));
  const go = (pathname: '/editor' | '/templates') => {
    haptic('light');
    router.push(pathname === '/editor' ? { pathname, params: { kind: 'social' } } : { pathname });
  };

  return (
    <>
      <Gutter>
        <View style={{ flexDirection: 'row', gap: space[3] }}>
          <View style={{ flex: 1 }}>
            <Button label={t('events.create')} onPress={() => go('/editor')} testID="events-create" />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={t('events.fromTemplate')}
              variant="secondary"
              onPress={() => go('/templates')}
              testID="events-templates"
            />
          </View>
        </View>
      </Gutter>
      <StoreGate>
        <Gutter gap={5}>
          {items.length === 0 ? (
            <EmptyState title={t('events.empty.title')} body={t('events.empty.body')} testID="events-empty" />
          ) : (
            <>
              {invitations.length > 0 ? (
                <View style={{ gap: space[4] }} testID="events-invitations">
                  <SectionTitle>{t('events.invitations')}</SectionTitle>
                  {invitations.map((item, i) => (
                    <EventRow key={item.event.id} item={item} index={i} role={roleOf(item.event.id)} ctx={ctx} />
                  ))}
                </View>
              ) : null}
              <View style={{ gap: space[4] }}>
                {invitations.length > 0 ? <SectionTitle>{t('events.upcoming')}</SectionTitle> : null}
                {upcoming.map((item, i) => (
                  <EventRow key={item.event.id} item={item} index={i} role={roleOf(item.event.id)} ctx={ctx} />
                ))}
              </View>
            </>
          )}
        </Gutter>
      </StoreGate>
    </>
  );
}

function EventRow({
  item,
  index,
  role,
  ctx,
}: {
  item: AgendaItem;
  index: number;
  role: ViewerRole;
  ctx: ReturnType<typeof useAgendaContext>;
}) {
  const { store, now, locale, t, openEvent, buffer } = ctx;
  const tz = store.timeZone;
  const collab = store.getCollab(item.event.id);
  return (
    <FadeIn delay={index * 40}>
      <View style={{ gap: space[2] }}>
        <Text variant="label" color="textSecondary">
          {formatLongDate(noonOf(dayKeyOf(item.start, tz), tz), locale, tz)}
        </Text>
        <EventCard
          {...eventCardProps(item, now, locale, t, buffer)}
          onPress={() => openEvent(item.event.id, item.occurrenceKey)}
        />
        {collab ? (
          <Text variant="label" color="textSecondary" testID={`rsvp-${item.event.id}`}>
            {[
              role === 'host' ? t('rsvp.hosting') : role ? t(`rsvp.state.${role}`) : null,
              t('events.rsvp', { ...rsvpSummary(collab, now) }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        ) : null}
      </View>
    </FadeIn>
  );
}
