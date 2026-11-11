import {
  addDays,
  attendanceKey,
  dayKeyOf,
  expandOccurrences,
  rideConflict,
  rideSlots,
  startOfDay,
  type CalendarEvent,
  type DayKey,
  type FamilyAction,
  type Group,
  type GroupAction,
  type GroupMessage,
  type Household,
  type LocalizedText,
  type RideLeg,
  weekdayOf,
} from '@nowish/domain';

import { stableHash } from './collab';

/**
 * Demo family and groups (ADR 0010, ADR 0014). Everything is fictional, relative to "today" and marked
 * "Demo" in the UI. Simulated people follow fixed rules: a family adult takes a ride when free, group
 * members answer meetings and the chat after a few seconds.
 */

const VIEWER = 'chris';
const KIDS = new Set(['lena', 'paul']);
const seconds = (now: Date, s: number) => new Date(now.getTime() + s * 1000);
const minutesAgo = (now: Date, m: number) => new Date(now.getTime() - m * 60_000);

/** First occurrence of a demo event on or after today. */
function nextOccurrence(e: CalendarEvent | undefined, now: Date): { key: DayKey; start: Date; end: Date } | undefined {
  if (!e) return undefined;
  const today = dayKeyOf(now, e.timeZone);
  return expandOccurrences(e, startOfDay(today, e.timeZone), startOfDay(addDays(today, 62), e.timeZone))[0];
}

export function buildDemoHousehold(events: readonly CalendarEvent[], now: Date): Household {
  const byId = (id: string) => events.find((e) => e.id === `demo-${id}`);
  const swim = nextOccurrence(byId('swim'), now);
  const today = dayKeyOf(now, events[0]?.timeZone ?? 'Europe/Berlin');
  const assignments: Household['assignments'] = {};
  const assign = (id: string, members: string[]) => {
    if (byId(id)) assignments[`demo-${id}`] = members;
  };
  assign('swim', ['lena']);
  assign('paul-doctor', ['paul']);
  assign('brunch', ['chris', 'sam', 'lena', 'paul']);
  assign('football', ['chris']);
  return {
    id: 'demo-home',
    name: 'Zuhause',
    nameI18n: { de: 'Zuhause', en: 'Home' },
    adminId: VIEWER,
    adultIds: [VIEWER, 'sam'],
    invitedIds: [],
    kids: [
      { id: 'lena', name: 'Lena', color: 'sport', emoji: '🦊' },
      { id: 'paul', name: 'Paul', color: 'celebration', emoji: '🐢' },
    ],
    assignments,
    rides: swim ? [{ eventId: 'demo-swim', occurrenceKey: swim.key, leg: 'drop-off', driverId: VIEWER }] : [],
    shopping: [
      {
        id: 'buy-1',
        title: 'Milch',
        titleI18n: { de: 'Milch', en: 'Milk' },
        note: '2 l',
        addedBy: 'sam',
        createdAt: minutesAgo(now, 90),
      },
      {
        id: 'buy-2',
        title: 'Haferflocken',
        titleI18n: { de: 'Haferflocken', en: 'Oats' },
        addedBy: VIEWER,
        createdAt: minutesAgo(now, 60),
      },
      {
        id: 'buy-3',
        title: 'Bananen',
        titleI18n: { de: 'Bananen', en: 'Bananas' },
        addedBy: 'sam',
        createdAt: minutesAgo(now, 30),
      },
      {
        id: 'buy-4',
        title: 'Kaffee',
        titleI18n: { de: 'Kaffee', en: 'Coffee' },
        addedBy: VIEWER,
        createdAt: minutesAgo(now, 300),
        doneAt: minutesAgo(now, 120),
        doneBy: 'sam',
      },
    ],
    chores: [
      {
        id: 'chore-dishes',
        title: 'Spülmaschine ausräumen',
        titleI18n: { de: 'Spülmaschine ausräumen', en: 'Empty the dishwasher' },
        emoji: '🍽️',
        every: 'daily',
        startDay: addDays(today, -3),
        rotation: ['lena', 'sam', 'paul', VIEWER],
        done: {},
      },
      {
        id: 'chore-bins',
        title: 'Müll rausbringen',
        titleI18n: { de: 'Müll rausbringen', en: 'Take out the bins' },
        emoji: '🗑️',
        every: 'weekly',
        weekday: weekdayOf(today),
        startDay: addDays(today, -7),
        rotation: [VIEWER, 'sam'],
        done: {},
      },
      {
        id: 'chore-plants',
        title: 'Pflanzen gießen',
        titleI18n: { de: 'Pflanzen gießen', en: 'Water the plants' },
        emoji: '🌱',
        every: 'weekly',
        weekday: 6,
        startDay: addDays(today, (6 - weekdayOf(today) + 7) % 7),
        rotation: ['paul', 'lena'],
        done: {},
      },
    ],
    pending: [],
    createdAt: minutesAgo(now, 60 * 24 * 30),
  };
}

/**
 * An adult asked for a ride answers after 3–7 s: yes when they have no own appointment during the ride,
 * otherwise a friendly no (the leg stays open).
 */
export function simulateRideAnswer(
  h: Household,
  calendar: Parameters<typeof rideConflict>[3],
  eventId: string,
  occurrenceKey: DayKey,
  leg: RideLeg,
  adultId: string,
  now: Date,
): FamilyAction[] {
  if (adultId === VIEWER) return [];
  const slot = rideSlots(h, calendar).find(
    (s) => s.item.event.id === eventId && s.item.occurrenceKey === occurrenceKey,
  );
  if (!slot) return [];
  const accept = !rideConflict(slot, leg, adultId, calendar);
  const hash = stableHash(`${eventId}:${occurrenceKey}:${leg}:${adultId}`);
  return [
    { at: seconds(now, 3 + (hash % 5)), personId: adultId, type: 'ride-answer', eventId, occurrenceKey, leg, accept },
  ];
}

const SHOPPING_TICKS = 0.5;

/** Sometimes the other adult ticks a freshly added item "on the way home" (about every second item, 8–14 s). */
export function simulateShoppingTick(h: Household, itemId: string, now: Date): FamilyAction[] {
  const other = h.adultIds.find((a) => a !== VIEWER);
  if (!other) return [];
  const hash = stableHash(`${h.id}:${itemId}`);
  if ((hash % 100) / 100 >= SHOPPING_TICKS) return [];
  return [{ at: seconds(now, 8 + (hash % 7)), personId: other, type: 'shopping-done', itemId }];
}

/** A newly invited adult accepts after 4–8 s. */
export function simulateFamilyJoin(personId: string, now: Date): FamilyAction[] {
  return [{ at: seconds(now, 4 + (stableHash(`join:${personId}`) % 5)), personId, type: 'join' }];
}

// ---------------------------------------------------------------------------------------------- groups

const GROUP_REPLIES: readonly LocalizedText[] = [
  { de: 'Bin dabei! 🙌', en: 'I’m in! 🙌' },
  { de: 'Klingt gut, bis dann!', en: 'Sounds good, see you then!' },
  { de: 'Ich bring gute Laune mit 😄', en: 'I’ll bring the good vibes 😄' },
  { de: 'Passt mir, danke fürs Organisieren!', en: 'Works for me, thanks for organising!' },
];

/** One member replies to the viewer in the group chat after 4–8 s (at most one queued reply). */
export function simulateGroupReply(g: Group, now: Date): GroupAction[] {
  if (g.pending.some((a) => a.type === 'message')) return [];
  const others = g.memberIds.filter((m) => m !== VIEWER && !KIDS.has(m));
  if (others.length === 0) return [];
  const hash = stableHash(`${g.id}:${g.messages.length}`);
  return [
    {
      at: seconds(now, 4 + (hash % 5)),
      personId: others[hash % others.length] as string,
      type: 'message',
      body: GROUP_REPLIES[hash % GROUP_REPLIES.length] as LocalizedText,
    },
  ];
}

/** Members answer a meeting occurrence after 5–25 s: 70 % in, 30 % not this time. */
export function simulateMeetingAnswers(g: Group, eventId: string, occurrenceKey: DayKey, now: Date): GroupAction[] {
  const answered = g.attendance[attendanceKey(eventId, occurrenceKey)] ?? {};
  return g.memberIds
    .filter((m) => m !== VIEWER && !KIDS.has(m) && !answered[m])
    .map((personId) => {
      const hash = stableHash(`${eventId}:${occurrenceKey}:${personId}`);
      return {
        at: seconds(now, 5 + (hash % 21)),
        personId,
        type: 'attend' as const,
        eventId,
        occurrenceKey,
        answer: hash % 100 < 70 ? ('yes' as const) : ('no' as const),
      };
    });
}

const text = (id: string, at: Date, authorId: string, body: LocalizedText): GroupMessage => ({
  id,
  at,
  type: 'text',
  authorId,
  body: body.de,
  bodyI18n: body,
});

export function buildDemoGroups(events: readonly CalendarEvent[], now: Date): Group[] {
  const groups: Group[] = [];
  const stammtisch = events.find((e) => e.id === 'demo-stammtisch');
  const next = nextOccurrence(stammtisch, now);
  if (stammtisch && next) {
    const key = attendanceKey(stammtisch.id, next.key);
    groups.push({
      id: 'demo-group-regulars',
      name: 'Stammtisch',
      nameI18n: { de: 'Stammtisch', en: 'Regulars' },
      emoji: '🍻',
      adminIds: ['tom'],
      memberIds: ['tom', VIEWER, 'jonas', 'alex'],
      messages: [
        { id: 'sys-1', at: minutesAgo(now, 60 * 24 * 60), type: 'system', note: { kind: 'created', personId: 'tom' } },
        {
          id: 'sys-2',
          at: minutesAgo(now, 60 * 24 * 60),
          type: 'system',
          note: { kind: 'meeting', personId: 'tom', eventId: stammtisch.id },
        },
        text('msg-1', minutesAgo(now, 60 * 5), 'tom', {
          de: 'Tisch im Löwen ist reserviert 🍻',
          en: 'Table at the Lion is booked 🍻',
        }),
        text('msg-2', minutesAgo(now, 60 * 4), 'jonas', {
          de: 'Top, ich komm direkt vom Training.',
          en: 'Great, coming straight from practice.',
        }),
      ],
      meetingIds: [stammtisch.id],
      attendance: { [key]: { tom: 'yes', jonas: 'yes', alex: 'no' } },
      pending: [],
      createdAt: minutesAgo(now, 60 * 24 * 60),
    });
  }
  const run = events.find((e) => e.id === 'demo-run');
  const nextRun = nextOccurrence(run, now);
  if (run && nextRun) {
    groups.push({
      id: 'demo-group-run',
      name: 'Laufgruppe',
      nameI18n: { de: 'Laufgruppe', en: 'Running crew' },
      emoji: '🏃',
      adminIds: [VIEWER],
      memberIds: [VIEWER, 'mia', 'olivia'],
      messages: [
        { id: 'sys-1', at: minutesAgo(now, 60 * 24 * 20), type: 'system', note: { kind: 'created', personId: VIEWER } },
        {
          id: 'sys-2',
          at: minutesAgo(now, 60 * 24 * 20),
          type: 'system',
          note: { kind: 'meeting', personId: VIEWER, eventId: run.id },
        },
        text('msg-1', minutesAgo(now, 60 * 20), 'mia', { de: 'Samstag wieder 5 km?', en: 'Saturday 5 km again?' }),
      ],
      meetingIds: [run.id],
      attendance: { [attendanceKey(run.id, nextRun.key)]: { mia: 'yes' } },
      pending: [],
      createdAt: minutesAgo(now, 60 * 24 * 20),
    });
  }
  return groups;
}
