import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { personName, upcomingSocial, type AgendaItem } from '@nowish/demo';
import { addDays, dayKeyOf, invitationOf, noonOf, rsvpState, rsvpSummary, type RsvpState } from '@nowish/domain';
import { formatShortDate, formatWeekday } from '@nowish/i18n';
import {
  Button,
  categoryColors,
  EmptyState,
  FadeIn,
  Gutter,
  initialsOf,
  ListCard,
  ListRow,
  SectionHeader,
  space,
} from '@nowish/ui';

import { eventCardProps, VIEWER_ID } from '../agenda/presenters';
import { StoreGate } from '../agenda/StoreGate';
import { useAgendaContext } from '../agenda/use-agenda';
import { HouseAd } from '../premium/HouseAd';
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
  const weekEnd = addDays(dayKeyOf(now, store.timeZone), 7);
  const thisWeek = upcoming.filter((i) => i.occurrenceKey < weekEnd);
  const later = upcoming.filter((i) => i.occurrenceKey >= weekEnd);
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
            // Phase 9: three calm sections instead of one long stack of cards.
            [
              { key: 'invitations', title: t('events.invitations'), list: invitations },
              { key: 'week', title: t('events.thisWeek'), list: thisWeek },
              { key: 'later', title: t('events.later'), list: later },
            ]
              .filter((section) => section.list.length > 0)
              .map((section) => (
                <View key={section.key} style={{ gap: space[3] }} testID={`events-${section.key}`}>
                  <SectionHeader title={`${section.title} · ${section.list.length}`} />
                  <FadeIn>
                    <ListCard>
                      {section.list.map((item) => (
                        <EventRow key={item.event.id} item={item} role={roleOf(item.event.id)} ctx={ctx} />
                      ))}
                    </ListCard>
                  </FadeIn>
                </View>
              ))
          )}
          <HouseAd slot="events_overview_banner" surface="events" />
        </Gutter>
      </StoreGate>
    </>
  );
}

function EventRow({
  item,
  role,
  ctx,
}: {
  item: AgendaItem;
  role: ViewerRole;
  ctx: ReturnType<typeof useAgendaContext>;
}) {
  const { store, now, locale, t, openEvent, buffer } = ctx;
  const tz = store.timeZone;
  const collab = store.getCollab(item.event.id);
  const card = eventCardProps(item, now, locale, t, buffer);
  const host = item.event.hostId && item.event.hostId !== VIEWER_ID ? personName(item.event.hostId) : null;
  const when = `${formatWeekday(item.start, locale, 'short', tz)}, ${formatShortDate(noonOf(dayKeyOf(item.start, tz), tz), locale, tz)} · ${card.timeLabel}`;
  const meta = collab
    ? [
        role === 'host' ? t('rsvp.hosting') : role ? t(`rsvp.state.${role}`) : null,
        t('events.rsvp', { ...rsvpSummary(collab, now) }),
      ]
        .filter(Boolean)
        .join(' · ')
    : null;
  const open = role === 'pending' || role === 'expired';
  return (
    <ListRow
      avatar={{ initials: initialsOf(host ?? t('family.you')), color: categoryColors[item.event.category] }}
      title={card.title}
      subtitle={when}
      {...(meta ? { meta: { text: meta, testID: `rsvp-${item.event.id}` } } : {})}
      {...(open ? { note: t('events.answerOpen') } : {})}
      onPress={() => openEvent(item.event.id, item.occurrenceKey)}
      accessibilityLabel={[card.title, when, card.subtitle, meta, open ? t('events.answerOpen') : null]
        .filter(Boolean)
        .join(', ')}
      {...(card.testID ? { testID: card.testID } : {})}
    />
  );
}
