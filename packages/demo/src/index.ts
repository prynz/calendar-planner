import {
  addDays,
  compareAgenda,
  dayKeyOf,
  occursOnDay,
  startOfDay,
  zonedWallTimeToInstant,
  type DayKey,
  type TimedItem,
} from '@nowish/domain';

/**
 * Demo world (ADR 0008). Every person and plan is fictional and marked "Demo" in the UI.
 * Dates are generated relative to "today" so the prototype always looks alive.
 */

export const DEMO_TIME_ZONE = 'Europe/Berlin';

export type LocalizedText = { de: string; en: string };

/** Same values as the design token categories (`@nowish/ui` tokens); checked in a test. */
export const DEMO_CATEGORIES = ['social', 'family', 'health', 'work', 'sport', 'celebration'] as const;
export type DemoCategory = (typeof DEMO_CATEGORIES)[number];

export interface DemoPerson {
  id: string;
  name: string;
  /** `child` = child profile without account (docs/product/features/family.md). */
  kind: 'viewer' | 'friend' | 'family' | 'child' | 'guest';
}

export interface DemoEvent extends TimedItem {
  id: string;
  kind: 'appointment' | 'social';
  title: LocalizedText;
  location?: LocalizedText;
  category: DemoCategory;
  hostId?: string;
  participantIds: readonly string[];
  /** Social events only: answers of invited people (viewer included). */
  rsvp?: { yes: number; maybe: number; open: number };
}

export interface DemoWorld {
  timeZone: string;
  today: DayKey;
  viewer: DemoPerson;
  people: readonly DemoPerson[];
  events: readonly DemoEvent[];
}

export const DEMO_PEOPLE: readonly DemoPerson[] = [
  { id: 'chris', name: 'Chris', kind: 'viewer' },
  { id: 'olivia', name: 'Olivia', kind: 'friend' },
  { id: 'tom', name: 'Tom', kind: 'friend' },
  { id: 'mia', name: 'Mia', kind: 'friend' },
  { id: 'jonas', name: 'Jonas', kind: 'friend' },
  { id: 'alex', name: 'Alex', kind: 'friend' },
  { id: 'frank', name: 'Frank', kind: 'family' },
  { id: 'lena', name: 'Lena', kind: 'child' },
  { id: 'paul', name: 'Paul', kind: 'child' },
  { id: 'gabi', name: 'Gabi', kind: 'guest' },
];

interface Template {
  id: string;
  dayOffset: number;
  /** [hour, minute] in the demo zone; omitted → all day. */
  from?: [number, number];
  /** Duration in minutes, or for all-day items the number of days (default 1). */
  length?: number;
  kind: DemoEvent['kind'];
  title: LocalizedText;
  location?: LocalizedText;
  category: DemoCategory;
  hostId?: string;
  participantIds: string[];
  rsvp?: DemoEvent['rsvp'];
}

const TEMPLATES: readonly Template[] = [
  {
    id: 'cinema',
    dayOffset: -1,
    from: [20, 15],
    length: 140,
    kind: 'social',
    category: 'social',
    title: { de: 'Kino mit Mia', en: 'Movies with Mia' },
    location: { de: 'Kino am Markt', en: 'Market cinema' },
    hostId: 'mia',
    participantIds: ['chris', 'mia'],
    rsvp: { yes: 2, maybe: 0, open: 0 },
  },
  {
    id: 'dentist',
    dayOffset: 0,
    from: [8, 30],
    length: 45,
    kind: 'appointment',
    category: 'health',
    title: { de: 'Zahnarzt', en: 'Dentist' },
    location: { de: 'Praxis Dr. Sommer', en: 'Dr Sommer’s practice' },
    participantIds: ['chris'],
  },
  {
    id: 'lunch',
    dayOffset: 0,
    from: [12, 30],
    length: 60,
    kind: 'social',
    category: 'social',
    title: { de: 'Mittagessen mit Alex', en: 'Lunch with Alex' },
    location: { de: 'Café Lindner', en: 'Café Lindner' },
    hostId: 'alex',
    participantIds: ['chris', 'alex'],
    rsvp: { yes: 2, maybe: 0, open: 0 },
  },
  {
    id: 'games',
    dayOffset: 0,
    from: [19, 0],
    length: 240,
    kind: 'social',
    category: 'social',
    title: { de: 'Spieleabend bei Olivia', en: 'Game night at Olivia’s' },
    location: { de: 'Bei Olivia', en: 'Olivia’s place' },
    hostId: 'olivia',
    participantIds: ['chris', 'olivia', 'tom', 'mia', 'jonas'],
    rsvp: { yes: 4, maybe: 1, open: 0 },
  },
  {
    id: 'football',
    dayOffset: 1,
    from: [18, 30],
    length: 90,
    kind: 'appointment',
    category: 'sport',
    title: { de: 'Fußballtraining', en: 'Football practice' },
    location: { de: 'Sportplatz Nord', en: 'North sports ground' },
    participantIds: ['chris', 'jonas'],
  },
  {
    id: 'flat',
    dayOffset: 2,
    from: [10, 0],
    length: 45,
    kind: 'appointment',
    category: 'work',
    title: { de: 'Wohnungsbesichtigung', en: 'Flat viewing' },
    location: { de: 'Gartenstraße 12', en: '12 Garden Street' },
    participantIds: ['chris'],
  },
  {
    id: 'tom-bday',
    dayOffset: 3,
    kind: 'appointment',
    category: 'celebration',
    title: { de: 'Toms Geburtstag 🎂', en: 'Tom’s birthday 🎂' },
    participantIds: ['chris'],
  },
  {
    id: 'tom-party',
    dayOffset: 3,
    from: [19, 30],
    length: 270,
    kind: 'social',
    category: 'celebration',
    title: { de: 'Geburtstagsfeier von Tom', en: 'Tom’s birthday party' },
    location: { de: 'Bar Südlicht', en: 'Südlicht bar' },
    hostId: 'tom',
    participantIds: ['chris', 'tom', 'olivia', 'mia', 'jonas', 'alex', 'gabi'],
    rsvp: { yes: 4, maybe: 1, open: 2 },
  },
  {
    id: 'bbq',
    dayOffset: 5,
    from: [16, 0],
    length: 300,
    kind: 'social',
    category: 'social',
    title: { de: 'Grillabend am See', en: 'Lakeside barbecue' },
    location: { de: 'Badestelle Ost', en: 'East beach' },
    hostId: 'olivia',
    participantIds: ['chris', 'olivia', 'tom', 'mia', 'gabi'],
    rsvp: { yes: 2, maybe: 1, open: 2 },
  },
  {
    id: 'brunch',
    dayOffset: 6,
    from: [10, 30],
    length: 150,
    kind: 'social',
    category: 'family',
    title: { de: 'Familienbrunch bei Frank', en: 'Family brunch at Frank’s' },
    location: { de: 'Bei Frank', en: 'Frank’s place' },
    hostId: 'frank',
    participantIds: ['chris', 'frank', 'lena', 'paul'],
    rsvp: { yes: 4, maybe: 0, open: 0 },
  },
  {
    id: 'concert',
    dayOffset: 9,
    from: [20, 0],
    length: 180,
    kind: 'social',
    category: 'social',
    title: { de: 'Konzert im Park', en: 'Concert in the park' },
    location: { de: 'Stadtpark', en: 'City park' },
    hostId: 'jonas',
    participantIds: ['chris', 'jonas', 'mia'],
    rsvp: { yes: 2, maybe: 1, open: 0 },
  },
  {
    id: 'lisbon',
    dayOffset: 12,
    length: 4,
    kind: 'appointment',
    category: 'work',
    title: { de: 'Kurztrip Lissabon', en: 'Lisbon getaway' },
    participantIds: ['chris'],
  },
];

/** Builds the demo world for `now`. Deterministic for a given `now` and zone. */
export function buildDemoWorld(now: Date, timeZone: string = DEMO_TIME_ZONE): DemoWorld {
  const today = dayKeyOf(now, timeZone);
  const events = TEMPLATES.map((t): DemoEvent => {
    const day = addDays(today, t.dayOffset);
    const base = {
      id: `demo-${t.id}`,
      kind: t.kind,
      title: t.title,
      category: t.category,
      participantIds: t.participantIds,
      ...(t.location ? { location: t.location } : {}),
      ...(t.hostId ? { hostId: t.hostId } : {}),
      ...(t.rsvp ? { rsvp: t.rsvp } : {}),
    };
    if (!t.from) {
      const days = t.length ?? 1;
      const last = addDays(day, days - 1);
      return {
        ...base,
        allDay: true,
        start: startOfDay(day, timeZone),
        end: startOfDay(addDays(last, 1), timeZone),
        allDayRange: { first: day, last },
      };
    }
    const start = zonedWallTimeToInstant(day, t.from[0], t.from[1], timeZone);
    return { ...base, allDay: false, start, end: new Date(start.getTime() + (t.length ?? 60) * 60_000) };
  }).sort(compareAgenda);

  const viewer = DEMO_PEOPLE.find((p) => p.kind === 'viewer');
  if (!viewer) throw new Error('Demo world needs a viewer');
  return { timeZone, today, viewer, people: DEMO_PEOPLE, events };
}

/** Agenda of one day, sorted (all-day first). */
export function agendaForDay(world: DemoWorld, day: DayKey): DemoEvent[] {
  return world.events.filter((e) => occursOnDay(e, day, world.timeZone)).sort(compareAgenda);
}

/** Social events that have not ended yet, soonest first. */
export function upcomingSocialEvents(world: DemoWorld, now: Date): DemoEvent[] {
  return world.events.filter((e) => e.kind === 'social' && e.end.getTime() > now.getTime()).sort(compareAgenda);
}

export function personName(world: DemoWorld, id: string): string {
  const p = world.people.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown demo person "${id}"`);
  return p.name;
}
