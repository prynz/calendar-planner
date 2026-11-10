import { useRouter } from 'expo-router';
import { CheckSquare, MessageCircle, ShoppingBasket, Users, Vote } from 'lucide-react-native';
import { View } from 'react-native';

import {
  bringProgress,
  hasVoted,
  invitationOf,
  isPollOpen,
  lastMessage,
  respond,
  rsvpState,
  rsvpSummary,
  taskProgress,
  RSVP_ANSWERS,
  type RsvpAnswer,
} from '@nowish/domain';
import { formatLongDate } from '@nowish/i18n';
import {
  AvatarStack,
  Card,
  ChipGroup,
  FadeIn,
  ProgressBar,
  SectionTitle,
  space,
  SwitchRow,
  Text,
  Tile,
} from '@nowish/ui';

import type { CollabSection } from '../collab/CollabRoute';
import { messagePreview } from '../collab/text';
import { useCollab } from '../collab/use-collab';
import { haptic } from '@/services/haptics';

/**
 * Social part of the event detail: the viewer's own answer (EVT-04) and the bento overview (EVT-08).
 * Every tile opens its section.
 */
export function SocialPanel({ eventId }: { eventId: string }) {
  const ctx = useCollab(eventId);
  const router = useRouter();
  const { collab, event, t, locale, now, isHost, viewerId, run, name, error } = ctx;
  if (!collab || !event) return null;

  const open = (section: CollabSection) => {
    haptic('light');
    router.push({ pathname: '/event/[id]/[section]', params: { id: eventId, section } });
  };
  const summary = rsvpSummary(collab, now);
  const going = [collab.hostId, ...collab.invitations.filter((i) => i.answer === 'yes').map((i) => i.personId)];
  const mine = invitationOf(collab, viewerId);
  const poll = collab.polls[collab.polls.length - 1];
  const bring = bringProgress(collab.bring);
  const tasks = taskProgress(collab.tasks);
  const last = lastMessage(collab);
  const hint = (section: string) => t('tile.hint', { section });

  const pollValue = !poll
    ? t('tile.poll.none')
    : !isPollOpen(poll, now)
      ? t('tile.poll.closed')
      : hasVoted(poll, viewerId)
        ? t('tile.poll.voted')
        : t('tile.poll.vote');

  return (
    <>
      {mine ? (
        <FadeIn delay={90}>
          <Card testID="rsvp-card">
            <SectionTitle>{t('rsvp.invitedBy', { host: name(collab.hostId) })}</SectionTitle>
            <Text variant="label" color="textSecondary">
              {t('rsvp.yourAnswer')}
              {mine.answer ? ` · ${t(`rsvp.state.${rsvpState(mine, collab.maybeDeadline, now)}`)}` : ''}
            </Text>
            <ChipGroup<RsvpAnswer>
              options={RSVP_ANSWERS.map((a) => ({ value: a, label: t(`rsvp.answer.${a}`) }))}
              selected={mine.answer ? [mine.answer] : []}
              onToggle={(a) => void run((c, at) => respond(c, viewerId, a, at), a === 'yes' ? 'success' : 'selection')}
              accessibilityLabel={t('rsvp.yourAnswer')}
              testIDPrefix="rsvp"
            />
            {mine.answer === 'yes' || mine.answer === 'maybe' ? (
              <SwitchRow
                label={t('rsvp.plusOne')}
                value={mine.plusOne}
                onChange={(v) => {
                  const answer = mine.answer;
                  if (answer) void run((c, at) => respond(c, viewerId, answer, at, v), 'selection');
                }}
                testID="rsvp-plus-one"
              />
            ) : null}
            {collab.maybeDeadline ? (
              <Text variant="label" color="textSecondary">
                {t('rsvp.maybeDeadline', { date: formatLongDate(collab.maybeDeadline, locale, event.timeZone) })}
              </Text>
            ) : null}
            {error ? (
              <Text variant="bodyM" color="dangerText" accessibilityRole="alert">
                {error}
              </Text>
            ) : null}
          </Card>
        </FadeIn>
      ) : null}

      <FadeIn delay={120}>
        <View style={{ gap: space[3] }} testID="bento">
          {isHost ? (
            <Text variant="label" color="accentText">
              {t('rsvp.hosting')}
            </Text>
          ) : null}
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <Tile
              title={t('tile.guests')}
              value={t('rsvp.headcount', { count: summary.headcount })}
              detail={t('events.rsvp', { ...summary })}
              icon={(c) => <Users color={c} size={16} />}
              onPress={() => open('guests')}
              hint={hint(t('tile.guests'))}
              testID="tile-guests"
            >
              <AvatarStack names={going.map(name)} max={4} accessibilityLabel={going.map(name).join(', ')} />
            </Tile>
            <Tile
              title={t('tile.poll')}
              value={pollValue}
              {...(!poll && isHost ? { detail: t('tile.poll.start') } : {})}
              icon={(c) => <Vote color={c} size={16} />}
              onPress={() => open('poll')}
              hint={hint(t('tile.poll'))}
              testID="tile-poll"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <Tile
              title={t('tile.bring')}
              value={bring.total ? t('bring.progress', bring) : t('tile.empty')}
              icon={(c) => <ShoppingBasket color={c} size={16} />}
              onPress={() => open('bring')}
              hint={hint(t('tile.bring'))}
              testID="tile-bring"
            >
              {bring.total ? <ProgressBar value={bring.covered / bring.total} /> : null}
            </Tile>
            <Tile
              title={t('tile.tasks')}
              value={tasks.total ? t('tasks.progress', tasks) : t('tile.empty')}
              icon={(c) => <CheckSquare color={c} size={16} />}
              onPress={() => open('tasks')}
              hint={hint(t('tile.tasks'))}
              testID="tile-tasks"
            >
              {tasks.total ? <ProgressBar value={tasks.done / tasks.total} /> : null}
            </Tile>
          </View>
          <Tile
            title={t('tile.chat')}
            value={t('chat.count', { count: collab.messages.length })}
            {...(last ? { detail: messagePreview(last, collab, t, locale, event.timeZone) } : {})}
            icon={(c) => <MessageCircle color={c} size={16} />}
            onPress={() => open('chat')}
            hint={hint(t('tile.chat'))}
            testID="tile-chat"
          />
        </View>
      </FadeIn>
    </>
  );
}
