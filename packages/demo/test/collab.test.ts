import { describe, expect, it } from 'vitest';

import { applyDueActions, isPollOpen, memberIds, remainingQuantity, rsvpSummary, schedule } from '@nowish/domain';

import {
  buildDemoCollabs,
  buildDemoEvents,
  DEMO_PEOPLE,
  DEMO_TIME_ZONE,
  simulateChatReply,
  simulateInviteReplies,
  simulatePollVotes,
  stableHash,
} from '../src';

const NOW = new Date('2026-11-10T09:00:00Z');
const events = buildDemoEvents(NOW, DEMO_TIME_ZONE);
const collabs = buildDemoCollabs(events, NOW);

describe('demo collaboration', () => {
  it('exists for every social event and matches its people', () => {
    const social = events.filter((e) => e.kind === 'social');
    expect(collabs.map((c) => c.eventId).sort()).toEqual(social.map((e) => e.id).sort());
    const people = new Set(DEMO_PEOPLE.map((p) => p.id));
    for (const c of collabs) {
      const e = events.find((x) => x.id === c.eventId);
      expect(e?.hostId).toBe(c.hostId);
      expect([...memberIds(c)].sort()).toEqual([...(e?.participantIds ?? [])].sort());
      for (const id of memberIds(c)) expect(people.has(id)).toBe(true);
      for (const item of c.bring) expect(remainingQuantity(item)).toBeGreaterThanOrEqual(0);
      for (const p of c.polls) expect(isPollOpen(p, NOW)).toBe(true);
    }
  });

  it('gives the viewer something to do: a pending invite, an open vote and a hosted event', () => {
    const party = collabs.find((c) => c.eventId === 'demo-tom-party');
    expect(party?.invitations.find((i) => i.personId === 'chris')?.answer).toBeUndefined();
    const bbq = collabs.find((c) => c.eventId === 'demo-bbq');
    expect(bbq?.polls[0]?.votes.chris).toBeUndefined();
    expect(collabs.find((c) => c.eventId === 'demo-movie-night')?.hostId).toBe('chris');
  });

  it('plays the seeded movie-night replies after a few seconds', () => {
    const movie = collabs.find((c) => c.eventId === 'demo-movie-night');
    if (!movie) throw new Error('missing');
    const later = applyDueActions(movie, new Date(NOW.getTime() + 60_000)).collab;
    expect(rsvpSummary(later, NOW)).toMatchObject({ yes: 2, no: 1, maybe: 1, open: 0 });
    expect(later.messages.at(-1)).toMatchObject({ authorId: 'alex' });
  });
});

describe('simulation rules', () => {
  it('are deterministic and never act for the viewer or children', () => {
    expect(stableHash('a')).toBe(stableHash('a'));
    const a = simulateInviteReplies('e1', ['chris', 'tom', 'lena', 'mia'], NOW);
    expect(a).toEqual(simulateInviteReplies('e1', ['chris', 'tom', 'lena', 'mia'], NOW));
    expect(a.map((x) => x.personId)).toEqual(['tom', 'mia']);
    for (const x of a) {
      const s = (x.at.getTime() - NOW.getTime()) / 1000;
      expect(s).toBeGreaterThanOrEqual(5);
      expect(s).toBeLessThanOrEqual(25);
    }
  });

  it('lets everyone but the viewer vote once', () => {
    const bbq = collabs.find((c) => c.eventId === 'demo-bbq');
    if (!bbq) throw new Error('missing');
    const votes = simulatePollVotes(bbq, 'bbq-p1', NOW);
    // olivia and tom voted already, chris is the viewer → mia and gabi
    expect(votes.map((v) => v.personId).sort()).toEqual(['gabi', 'mia']);
    const after = applyDueActions(schedule(bbq, votes), new Date(NOW.getTime() + 60_000)).collab;
    expect(Object.keys(after.polls[0]?.votes ?? {}).sort()).toEqual(['gabi', 'mia', 'olivia', 'tom']);
  });

  it('queues at most one chat reply at a time', () => {
    const games = collabs.find((c) => c.eventId === 'demo-games');
    if (!games) throw new Error('missing');
    const first = simulateChatReply(games, NOW);
    expect(first).toHaveLength(1);
    expect(first[0]?.personId).not.toBe('chris');
    expect(simulateChatReply(schedule(games, first), NOW)).toHaveLength(0);
  });
});
