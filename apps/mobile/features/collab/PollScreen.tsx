import { View } from 'react-native';

import {
  dayKeyOf,
  decidePoll,
  eventToDraft,
  isPollOpen,
  localized,
  nonVoters,
  pollOutcome,
  pollTally,
  vote,
  VOTE_VALUES,
  wallParts,
  type Poll,
  type PollOption,
  type VoteValue,
} from '@nowish/domain';
import { formatLongDate, formatTime } from '@nowish/i18n';
import {
  Button,
  Card,
  ChipGroup,
  EmptyState,
  ProgressBar,
  SectionTitle,
  space,
  SwipeDeck,
  Text,
  type SwipeChoice,
} from '@nowish/ui';

import { CollabShell } from './CollabShell';
import { PollCreate } from './PollCreate';
import { optionLabel } from './text';
import { useCollab, type CollabContext } from './use-collab';

/** Poll: swipe to vote (with equal buttons), live results, outcome and host decision (POL-01…09). */
export function PollScreen({ eventId }: { eventId: string }) {
  const ctx = useCollab(eventId);
  const { collab, t, isHost } = ctx;
  const poll = collab?.polls[collab.polls.length - 1];
  return (
    <CollabShell ctx={ctx} title={t('poll.title')} testID="screen-poll">
      {collab ? (
        poll ? (
          <PollView poll={poll} ctx={ctx} />
        ) : isHost ? (
          <PollCreate ctx={ctx} />
        ) : (
          <EmptyState title={t('poll.empty.title')} body={t('poll.empty.guest')} testID="poll-empty" />
        )
      ) : null}
    </CollabShell>
  );
}

function PollView({ poll, ctx }: { poll: Poll; ctx: CollabContext }) {
  const { collab, event, t, locale, now, viewerId, run, name } = ctx;
  if (!collab || !event) return null;
  const tz = event.timeZone;
  const open = isPollOpen(poll, now);
  const ballot = poll.votes[viewerId] ?? {};
  const pending = open ? poll.options.filter((o) => ballot[o.id] === undefined) : [];
  const tally = pollTally(poll);
  const best = Math.max(1, ...tally.map((x) => x.score));
  const label = (o: PollOption) => optionLabel(o, locale, tz);
  const detail = (o: PollOption) =>
    o.type === 'time'
      ? `${formatLongDate(o.start, locale, tz)} · ${formatTime(o.start, locale, tz)}–${formatTime(o.end, locale, tz)}`
      : undefined;
  const cast = (optionId: string, value: VoteValue) =>
    void run((c, at) => vote(c, poll.id, viewerId, { [optionId]: value }, at), 'selection');

  return (
    <>
      <Card>
        <Text variant="titleL">{localized(poll.question, poll.questionI18n, locale)}</Text>
        <Text variant="bodyM" color="textSecondary" testID="poll-deadline-text">
          {open
            ? t('poll.until', {
                date: `${formatLongDate(poll.deadline, locale, tz)} ${formatTime(poll.deadline, locale, tz)}`,
              })
            : t('poll.ended')}
        </Text>
        <Text variant="label" color="textSecondary">
          {poll.decision === 'majority'
            ? t('poll.decision.majority')
            : t('poll.decision.host', { host: name(collab.hostId) })}
        </Text>
      </Card>

      {pending.length > 0 ? (
        <View style={{ gap: space[2] }}>
          <Text variant="label" color="textSecondary" align="center">
            {t('poll.progress', { n: poll.options.length - pending.length + 1, total: poll.options.length })}
          </Text>
          <SwipeDeck
            cards={pending.map((o) => {
              const d = detail(o);
              return {
                key: o.id,
                title: o.type === 'time' ? formatTime(o.start, locale, tz) : label(o),
                ...(d ? { detail: d } : {}),
              };
            })}
            onChoose={(key, choice: SwipeChoice) => cast(key, choice)}
            labels={{ yes: t('poll.vote.yes'), 'if-needed': t('poll.vote.if-needed'), no: t('poll.vote.no') }}
            gestureHint={t('poll.gestureHint')}
            testID="poll-deck"
          />
        </View>
      ) : null}

      <Card testID="poll-results">
        <SectionTitle>{open ? t('poll.results') : t('poll.ended')}</SectionTitle>
        <Text variant="label" color="textSecondary">
          {t('poll.nonVoters', { count: nonVoters(collab, poll).length })}
        </Text>
        {poll.options.map((o) => {
          const x = tally.find((y) => y.optionId === o.id);
          return (
            <View key={o.id} style={{ gap: space[2] }} testID={`poll-option-${o.id}`}>
              <Text variant="bodyL">{label(o)}</Text>
              <ProgressBar value={(x?.score ?? 0) / best} />
              <Text variant="label" color="textSecondary">
                {t('poll.tally', { yes: x?.yes ?? 0, ifNeeded: x?.ifNeeded ?? 0, no: x?.no ?? 0 })}
              </Text>
              {open && ballot[o.id] !== undefined ? (
                <ChipGroup<VoteValue>
                  options={VOTE_VALUES.map((v) => ({ value: v, label: t(`poll.vote.${v}`) }))}
                  selected={[ballot[o.id] as VoteValue]}
                  onToggle={(v) => cast(o.id, v)}
                  accessibilityLabel={`${t('poll.changeVote')}: ${label(o)}`}
                  testIDPrefix={`poll-change-${o.id}`}
                />
              ) : null}
            </View>
          );
        })}
      </Card>

      <Outcome poll={poll} ctx={ctx} label={label} />
    </>
  );
}

function Outcome({ poll, ctx, label }: { poll: Poll; ctx: CollabContext; label: (o: PollOption) => string }) {
  const { collab, event, t, now, isHost, viewerId, run, name, store, locale, showError } = ctx;
  if (!collab || !event) return null;
  const outcome = pollOutcome(poll, now);
  const optText = (id: string) => {
    const o = poll.options.find((x) => x.id === id);
    return o ? label(o) : '';
  };
  const text =
    outcome.kind === 'decided'
      ? t('poll.outcome.decided', { option: optText(outcome.optionId) })
      : outcome.kind === 'leading'
        ? t('poll.outcome.leading', { option: optText(outcome.optionId) })
        : outcome.kind === 'host-decides'
          ? t('poll.outcome.hostDecides', { host: name(collab.hostId) })
          : outcome.kind === 'no-votes'
            ? t('poll.outcome.noVotes')
            : null;

  /** Host picks an option; a date option also moves the event (POL-09). */
  const choose = async (o: PollOption) => {
    const ok = await run((c, at) => decidePoll(c, viewerId, poll.id, o.id, at), 'success');
    if (!ok || o.type !== 'time') return;
    const wall = wallParts(o.start, event.timeZone);
    const startMinute = wall.hour * 60 + wall.minute;
    const length = Math.round((o.end.getTime() - o.start.getTime()) / 60_000);
    await store.update(event.id, {
      ...eventToDraft(event, locale),
      allDay: false,
      day: dayKeyOf(o.start, event.timeZone),
      startMinute,
      endMinute: Math.min(startMinute + length, 24 * 60),
    });
  };

  const choosable = isHost && outcome.kind !== 'decided';
  if (!text && !choosable) return null;
  return (
    <Card testID="poll-outcome">
      {text ? <Text variant="titleM">{text}</Text> : null}
      {choosable
        ? poll.options.map((o) => (
            <Button
              key={o.id}
              label={`${o.type === 'time' ? t('poll.applyTime') : t('poll.choose')}: ${label(o)}`}
              variant={outcome.kind === 'leading' && outcome.optionId === o.id ? 'primary' : 'secondary'}
              onPress={() => {
                choose(o).catch((error: unknown) => {
                  console.warn('[poll] moving the event failed', error instanceof Error ? error.message : 'unknown');
                  showError(t('collab.error.save'));
                });
              }}
              testID={`poll-choose-${o.id}`}
            />
          ))
        : null}
    </Card>
  );
}
