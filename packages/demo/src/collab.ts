import {
  addDays,
  dayKeyOf,
  emptyCollab,
  zonedWallTimeToInstant,
  type CalendarEvent,
  type EventCollab,
  type Invitation,
  type LocalizedText,
  type Poll,
  type RsvpAnswer,
  type SimulatedAction,
  type VoteValue,
} from '@nowish/domain';

/**
 * Collaboration part of the demo world (ADR 0010, ADR 0012) and the rules simulated people follow.
 * Rules are deterministic (hash of ids), so the same action always gets the same reaction – nothing
 * random at runtime, and every simulated person is fictional and labelled "Demo" in the UI.
 */

const VIEWER = 'chris';
/** Child profiles have no account and never act on their own (family.md). */
const PASSIVE = new Set(['lena', 'paul']);

/** FNV-1a – small, stable string hash for the simulation rules. */
export function stableHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const seconds = (now: Date, s: number) => new Date(now.getTime() + s * 1000);

/** Invitees answer after 5–25 s: 60 % yes, 25 % maybe, 15 % no (by hash of event + person). */
export function simulateInviteReplies(eventId: string, personIds: readonly string[], now: Date): SimulatedAction[] {
  return personIds
    .filter((p) => p !== VIEWER && !PASSIVE.has(p))
    .map((personId) => {
      const h = stableHash(`${eventId}:${personId}`);
      const pick = h % 100;
      const answer: RsvpAnswer = pick < 60 ? 'yes' : pick < 85 ? 'maybe' : 'no';
      return { at: seconds(now, 5 + (h % 21)), personId, type: 'rsvp', answer };
    });
}

/** Everyone except the viewer, children and people who declined votes after 6–30 s. */
export function simulatePollVotes(c: EventCollab, pollId: string, now: Date): SimulatedAction[] {
  const poll = c.polls.find((p) => p.id === pollId);
  if (!poll) return [];
  const voters = [c.hostId, ...c.invitations.filter((i) => i.answer !== 'no').map((i) => i.personId)];
  return voters
    .filter((p) => p !== VIEWER && !PASSIVE.has(p) && poll.votes[p] === undefined)
    .map((personId) => {
      const votes: Record<string, VoteValue> = {};
      for (const o of poll.options) {
        const h = stableHash(`${pollId}:${o.id}:${personId}`) % 10;
        votes[o.id] = h < 5 ? 'yes' : h < 8 ? 'if-needed' : 'no';
      }
      return {
        at: seconds(now, 6 + (stableHash(`${pollId}:${personId}`) % 25)),
        personId,
        type: 'vote',
        pollId,
        votes,
      };
    });
}

const REPLIES: readonly LocalizedText[] = [
  { de: 'Klingt gut! 👍', en: 'Sounds good! 👍' },
  { de: 'Bin dabei 🙌', en: 'Count me in 🙌' },
  { de: 'Super, danke fürs Organisieren!', en: 'Great, thanks for organising!' },
  { de: 'Passt mir 😊', en: 'Works for me 😊' },
  { de: 'Haha, perfekt 😄', en: 'Haha, perfect 😄' },
];

/**
 * One demo person answers a chat message from the viewer after 4–8 s. At most one reply is queued at a
 * time, so the chat never floods.
 */
export function simulateChatReply(c: EventCollab, now: Date): SimulatedAction[] {
  if (c.pending.some((a) => a.type === 'message')) return [];
  const candidates = [c.hostId, ...c.invitations.filter((i) => i.answer === 'yes').map((i) => i.personId)].filter(
    (p) => p !== VIEWER && !PASSIVE.has(p),
  );
  if (candidates.length === 0) return [];
  const h = stableHash(`${c.eventId}:${c.messages.length}`);
  const personId = candidates[h % candidates.length] as string;
  const body = REPLIES[h % REPLIES.length] as LocalizedText;
  return [{ at: seconds(now, 4 + (h % 5)), personId, type: 'message', body }];
}

const LATE_REPLIES: readonly LocalizedText[] = [
  { de: 'Kein Stress, bis gleich! 🙂', en: 'No stress, see you soon! 🙂' },
  { de: 'Danke fürs Bescheid sagen 👍', en: 'Thanks for letting us know 👍' },
  { de: 'Alles gut, wir fangen schon mal an.', en: 'All good, we’ll get started.' },
];

/** After "I'm running late", the host (or someone who is coming) answers kindly after 4–8 s. */
export function simulateLateReply(c: EventCollab, now: Date): SimulatedAction[] {
  const candidates = [c.hostId, ...c.invitations.filter((i) => i.answer === 'yes').map((i) => i.personId)].filter(
    (p) => p !== VIEWER && !PASSIVE.has(p),
  );
  const personId = candidates[0];
  if (!personId) return [];
  const h = stableHash(`${c.eventId}:late:${c.messages.length}`);
  return [
    {
      at: seconds(now, 4 + (h % 5)),
      personId,
      type: 'message',
      body: LATE_REPLIES[h % LATE_REPLIES.length] as LocalizedText,
    },
  ];
}

// ---------------------------------------------------------------------------------------------- seed

type Answers = Record<string, RsvpAnswer | null>;

function invitations(answers: Answers, now: Date, plusOnes: readonly string[] = []): Invitation[] {
  return Object.entries(answers).map(([personId, answer]) => ({
    personId,
    plusOne: plusOnes.includes(personId),
    ...(answer ? { answer, answeredAt: new Date(now.getTime() - 86_400_000) } : {}),
  }));
}

const msg = (id: string, at: Date, authorId: string, body: LocalizedText) =>
  ({ id, at, type: 'text', authorId, body: body.de, bodyI18n: body }) as const;

const hoursAgo = (now: Date, h: number) => new Date(now.getTime() - h * 3_600_000);

/** Collaboration documents for the demo events (`buildDemoEvents`), relative to `now`. */
export function buildDemoCollabs(events: readonly CalendarEvent[], now: Date): EventCollab[] {
  const byId = new Map(events.map((e) => [e.id.replace(/^demo-/, ''), e]));
  const out: EventCollab[] = [];
  const add = (key: string, build: (e: CalendarEvent, c: EventCollab) => EventCollab) => {
    const e = byId.get(key);
    if (!e?.hostId) return;
    out.push(build(e, emptyCollab(e.id, e.hostId)));
  };
  const at = (e: CalendarEvent, dayOffset: number, h: number, m = 0) =>
    zonedWallTimeToInstant(addDays(dayKeyOf(e.start, e.timeZone), dayOffset), h, m, e.timeZone);

  add('cinema', (_e, c) => ({ ...c, invitations: invitations({ chris: 'yes' }, now) }));
  add('lunch', (_e, c) => ({ ...c, invitations: invitations({ chris: 'yes' }, now) }));

  add('games', (e, c) => ({
    ...c,
    invitations: invitations({ chris: 'yes', tom: 'yes', mia: 'yes', jonas: 'maybe' }, now),
    bring: [
      {
        id: 'games-b1',
        title: 'Snacks',
        titleI18n: { de: 'Snacks', en: 'Snacks' },
        quantity: 3,
        claims: [{ personId: 'tom', quantity: 1 }],
      },
      {
        id: 'games-b2',
        title: 'Getränke',
        titleI18n: { de: 'Getränke', en: 'Drinks' },
        quantity: 4,
        claims: [{ personId: 'mia', quantity: 2 }],
      },
      {
        id: 'games-b3',
        title: 'Kartenspiel',
        titleI18n: { de: 'Kartenspiel', en: 'Card game' },
        quantity: 1,
        claims: [{ personId: 'jonas', quantity: 1 }],
      },
    ],
    tasks: [
      {
        id: 'games-t1',
        title: 'Spiele aussuchen',
        titleI18n: { de: 'Spiele aussuchen', en: 'Pick the games' },
        assigneeId: 'olivia',
        dueAt: at(e, -1, 18),
        doneAt: hoursAgo(now, 20),
      },
      {
        id: 'games-t2',
        title: 'Tisch ausziehen',
        titleI18n: { de: 'Tisch ausziehen', en: 'Extend the table' },
        assigneeId: 'olivia',
        dueAt: e.start,
      },
    ],
    messages: [
      msg('games-m1', hoursAgo(now, 26), 'olivia', {
        de: 'Freu mich auf heute! Bringt gern Snacks mit 🍿',
        en: 'Looking forward to tonight! Feel free to bring snacks 🍿',
      }),
      msg('games-m2', hoursAgo(now, 25), 'tom', { de: 'Ich bring Chips mit', en: 'I’ll bring crisps' }),
    ],
  }));

  add('tom-party', (e, c) => ({
    ...c,
    invitations: invitations({ chris: null, olivia: 'yes', mia: 'yes', jonas: 'yes', alex: 'maybe', gabi: null }, now, [
      'olivia',
    ]),
    maybeDeadline: at(e, -1, 12),
    bring: [
      {
        id: 'party-b1',
        title: 'Getränke',
        titleI18n: { de: 'Getränke', en: 'Drinks' },
        quantity: 6,
        claims: [{ personId: 'olivia', quantity: 2 }],
      },
      {
        id: 'party-b2',
        title: 'Kuchen',
        titleI18n: { de: 'Kuchen', en: 'Cake' },
        quantity: 1,
        claims: [{ personId: 'mia', quantity: 1 }],
      },
    ],
    tasks: [
      {
        id: 'party-t1',
        title: 'Gemeinsames Geschenk besorgen',
        titleI18n: { de: 'Gemeinsames Geschenk besorgen', en: 'Get the group present' },
        dueAt: at(e, -1, 18),
      },
      {
        id: 'party-t2',
        title: 'Deko mitbringen',
        titleI18n: { de: 'Deko mitbringen', en: 'Bring decorations' },
        assigneeId: 'jonas',
        dueAt: e.start,
      },
    ],
    messages: [
      msg('party-m1', hoursAgo(now, 30), 'tom', {
        de: 'Wer kommt alles? Sagt bitte bis zum Vortag Bescheid 🎉',
        en: 'Who’s coming? Please let me know by the day before 🎉',
      }),
    ],
  }));

  add('bbq', (e, c) => {
    const poll: Poll = {
      id: 'bbq-p1',
      question: 'Wann grillen wir?',
      questionI18n: { de: 'Wann grillen wir?', en: 'When shall we barbecue?' },
      options: [
        { id: 'bbq-p1-o0', type: 'time', start: e.start, end: e.end },
        { id: 'bbq-p1-o1', type: 'time', start: at(e, 1, 15), end: at(e, 1, 20) },
      ],
      votes: {
        olivia: { 'bbq-p1-o0': 'yes', 'bbq-p1-o1': 'yes' },
        tom: { 'bbq-p1-o0': 'yes', 'bbq-p1-o1': 'if-needed' },
      },
      deadline: new Date(now.getTime() + 2 * 86_400_000),
      decision: 'majority',
    };
    return {
      ...c,
      invitations: invitations({ chris: 'maybe', tom: 'yes', mia: null, gabi: 'maybe' }, now),
      maybeDeadline: at(e, -2, 20),
      polls: [poll],
      bring: [
        {
          id: 'bbq-b1',
          title: 'Würstchen',
          titleI18n: { de: 'Würstchen', en: 'Sausages' },
          quantity: 3,
          claims: [{ personId: 'tom', quantity: 1 }],
        },
        { id: 'bbq-b2', title: 'Salat', titleI18n: { de: 'Salat', en: 'Salad' }, quantity: 2, claims: [] },
        {
          id: 'bbq-b3',
          title: 'Grillkohle',
          titleI18n: { de: 'Grillkohle', en: 'Charcoal' },
          quantity: 1,
          claims: [{ personId: 'olivia', quantity: 1 }],
        },
        { id: 'bbq-b4', title: 'Getränke', titleI18n: { de: 'Getränke', en: 'Drinks' }, quantity: 6, claims: [] },
      ],
      messages: [
        msg('bbq-m1', hoursAgo(now, 5), 'olivia', {
          de: 'Stimmt bitte bis übermorgen ab, wann es passt 🙏',
          en: 'Please vote by the day after tomorrow 🙏',
        }),
      ],
    };
  });

  add('brunch', (_e, c) => ({ ...c, invitations: invitations({ chris: 'yes', lena: 'yes', paul: 'yes' }, now) }));
  add('stammtisch', (_e, c) => ({ ...c, invitations: invitations({ chris: 'yes', jonas: 'yes', alex: 'yes' }, now) }));
  add('run', (_e, c) => ({ ...c, invitations: invitations({ mia: 'yes', olivia: 'yes' }, now) }));
  add('concert', (_e, c) => ({ ...c, invitations: invitations({ chris: 'yes', mia: 'maybe' }, now) }));

  add('movie-night', (e, c) => {
    const poll: Poll = {
      id: 'movie-p1',
      question: 'Welcher Film?',
      questionI18n: { de: 'Welcher Film?', en: 'Which film?' },
      options: [
        { id: 'movie-p1-o0', type: 'text', label: 'Komödie', labelI18n: { de: 'Komödie', en: 'Comedy' } },
        {
          id: 'movie-p1-o1',
          type: 'text',
          label: 'Science-Fiction',
          labelI18n: { de: 'Science-Fiction', en: 'Sci-fi' },
        },
        { id: 'movie-p1-o2', type: 'text', label: 'Krimi', labelI18n: { de: 'Krimi', en: 'Crime thriller' } },
      ],
      votes: {
        olivia: { 'movie-p1-o0': 'if-needed', 'movie-p1-o1': 'yes', 'movie-p1-o2': 'no' },
        mia: { 'movie-p1-o0': 'yes', 'movie-p1-o1': 'if-needed', 'movie-p1-o2': 'yes' },
      },
      deadline: new Date(now.getTime() + 3 * 86_400_000),
      decision: 'host',
    };
    return {
      ...c,
      invitations: invitations({ olivia: 'yes', tom: null, mia: 'maybe', alex: null }, now),
      maybeDeadline: at(e, -2, 20),
      polls: [poll],
      bring: [
        {
          id: 'movie-b1',
          title: 'Snacks',
          titleI18n: { de: 'Snacks', en: 'Snacks' },
          quantity: 2,
          claims: [{ personId: 'olivia', quantity: 1 }],
        },
        { id: 'movie-b2', title: 'Getränke', titleI18n: { de: 'Getränke', en: 'Drinks' }, quantity: 4, claims: [] },
      ],
      tasks: [
        {
          id: 'movie-t1',
          title: 'Beamer testen',
          titleI18n: { de: 'Beamer testen', en: 'Test the projector' },
          assigneeId: VIEWER,
          dueAt: at(e, -1, 18),
        },
        {
          id: 'movie-t2',
          title: 'Popcorn kaufen',
          titleI18n: { de: 'Popcorn kaufen', en: 'Buy popcorn' },
          dueAt: at(e, -1, 18),
        },
        {
          id: 'movie-t3',
          title: 'Sitzkissen organisieren',
          titleI18n: { de: 'Sitzkissen organisieren', en: 'Sort out floor cushions' },
          assigneeId: 'mia',
          dueAt: e.start,
        },
      ],
      messages: [
        msg('movie-m1', hoursAgo(now, 3), 'olivia', { de: 'Ich bin für Science-Fiction! 🚀', en: 'I vote sci-fi! 🚀' }),
      ],
      // Shortly after the first start Tom and Alex answer – shows the simulation right away.
      pending: [
        { at: seconds(now, 12), personId: 'tom', type: 'rsvp', answer: 'yes' },
        { at: seconds(now, 30), personId: 'alex', type: 'rsvp', answer: 'no' },
        {
          at: seconds(now, 32),
          personId: 'alex',
          type: 'message',
          body: { de: 'Bin da leider unterwegs – nächstes Mal! 🙈', en: 'I’m away that day, sadly – next time! 🙈' },
        },
      ],
    };
  });

  return out;
}
