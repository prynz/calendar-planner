import {
  COLLAB_LIMITS,
  CollabError,
  nextId,
  type EventCollab,
  type Poll,
  type PollOption,
  type VoteValue,
} from './model';
import { memberIds } from './rsvp';

export const isPollOpen = (p: Poll, now: Date) => !p.chosenOptionId && now.getTime() < p.deadline.getTime();

export interface OptionTally {
  optionId: string;
  yes: number;
  ifNeeded: number;
  no: number;
  /** yes = 2 points, "if needed" = 1 point (POL-02: swipe up = works if necessary). */
  score: number;
}

export function pollTally(p: Poll): OptionTally[] {
  return p.options.map((o) => {
    const t: OptionTally = { optionId: o.id, yes: 0, ifNeeded: 0, no: 0, score: 0 };
    for (const ballot of Object.values(p.votes)) {
      const v = ballot[o.id];
      if (v === 'yes') t.yes += 1;
      else if (v === 'if-needed') t.ifNeeded += 1;
      else if (v === 'no') t.no += 1;
    }
    t.score = t.yes * 2 + t.ifNeeded;
    return t;
  });
}

export type PollOutcome =
  | { kind: 'open' }
  | { kind: 'decided'; optionId: string }
  /** Deadline passed and the majority is clear, but the host still confirms. */
  | { kind: 'leading'; optionId: string }
  /** Tie or host decision pending – the host must pick, never chance (polls.md). */
  | { kind: 'host-decides'; optionIds: string[] }
  | { kind: 'no-votes' };

export function pollOutcome(p: Poll, now: Date): PollOutcome {
  if (p.chosenOptionId) return { kind: 'decided', optionId: p.chosenOptionId };
  if (isPollOpen(p, now)) return { kind: 'open' };
  const tally = pollTally(p);
  const best = Math.max(0, ...tally.map((t) => t.score));
  if (best === 0) return { kind: 'no-votes' };
  const top = tally.filter((t) => t.score === best).map((t) => t.optionId);
  if (top.length === 1 && p.decision === 'majority') return { kind: 'leading', optionId: top[0] as string };
  return { kind: 'host-decides', optionIds: top };
}

export function hasVoted(p: Poll, personId: string): boolean {
  const ballot = p.votes[personId];
  return ballot !== undefined && p.options.every((o) => ballot[o.id] !== undefined);
}

/** People who can vote but have not voted on every option yet. */
export const nonVoters = (c: EventCollab, p: Poll) => memberIds(c).filter((id) => !hasVoted(p, id));

export interface NewPoll {
  question: string;
  options: ({ type: 'time'; start: Date; end: Date } | { type: 'text'; label: string })[];
  deadline: Date;
  decision: Poll['decision'];
}

export function createPoll(c: EventCollab, actorId: string, input: NewPoll, now: Date): EventCollab {
  if (actorId !== c.hostId) throw new CollabError('not-host');
  const question = input.question.trim();
  const valid =
    question.length > 0 &&
    question.length <= COLLAB_LIMITS.question &&
    input.options.length >= 2 &&
    input.options.length <= COLLAB_LIMITS.options &&
    input.deadline.getTime() > now.getTime() &&
    input.options.every((o) =>
      o.type === 'time'
        ? o.end.getTime() > o.start.getTime()
        : o.label.trim().length > 0 && o.label.length <= COLLAB_LIMITS.title,
    );
  if (!valid) throw new CollabError('invalid-input');
  const id = nextId('poll', c.polls, now);
  const options: PollOption[] = input.options.map((o, i) =>
    o.type === 'time' ? { id: `${id}-o${i}`, ...o } : { id: `${id}-o${i}`, type: 'text', label: o.label.trim() },
  );
  const poll: Poll = { id, question, options, votes: {}, deadline: input.deadline, decision: input.decision };
  return {
    ...c,
    polls: [...c.polls, poll],
    messages: [...c.messages, { id: `sys-${id}`, at: now, type: 'system', note: { kind: 'poll-created', pollId: id } }],
  };
}

/** Set one or more votes of a person. Votes after the deadline are rejected. */
export function vote(
  c: EventCollab,
  pollId: string,
  personId: string,
  votes: Record<string, VoteValue>,
  now: Date,
): EventCollab {
  const poll = c.polls.find((p) => p.id === pollId);
  if (!poll) throw new CollabError('not-found');
  if (!memberIds(c).includes(personId)) throw new CollabError('not-invited');
  if (!isPollOpen(poll, now)) throw new CollabError('poll-closed');
  if (Object.keys(votes).some((k) => !poll.options.some((o) => o.id === k))) throw new CollabError('invalid-input');
  const next: Poll = { ...poll, votes: { ...poll.votes, [personId]: { ...poll.votes[personId], ...votes } } };
  return { ...c, polls: c.polls.map((p) => (p.id === pollId ? next : p)) };
}

/** Host picks the winner – before or after the deadline (POL-06, tie-break). */
export function decidePoll(c: EventCollab, actorId: string, pollId: string, optionId: string, now: Date): EventCollab {
  if (actorId !== c.hostId) throw new CollabError('not-host');
  const poll = c.polls.find((p) => p.id === pollId);
  if (!poll) throw new CollabError('not-found');
  if (!poll.options.some((o) => o.id === optionId)) throw new CollabError('invalid-input');
  return {
    ...c,
    polls: c.polls.map((p) => (p.id === pollId ? { ...p, chosenOptionId: optionId } : p)),
    messages: [
      ...c.messages,
      { id: `sys-dec-${pollId}`, at: now, type: 'system', note: { kind: 'poll-decided', pollId } },
    ],
  };
}
