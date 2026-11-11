import {
  addDays,
  compareAgenda,
  dayKeyOf,
  expandOccurrences,
  startOfDay,
  zonedWallTimeToInstant,
  type CalendarEvent,
  type DayKey,
  type EventCategory,
  type LocalizedText,
  type Recurrence,
  type TravelMode,
} from '@nowish/domain';

/**
 * Demo world (ADR 0008, ADR 0010). Every person and plan is fictional and marked "Demo" in the UI.
 * Dates are generated relative to "today" so the prototype always looks alive. The app seeds its local
 * database from this once and on "reset example world".
 */

export const DEMO_TIME_ZONE = 'Europe/Berlin';

export interface DemoPerson {
  id: string;
  name: string;
  /** `child` = child profile without account (docs/product/features/family.md). */
  kind: 'viewer' | 'friend' | 'family' | 'child' | 'guest';
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

export const DEMO_VIEWER_ID = 'chris';

interface Template {
  id: string;
  dayOffset: number;
  /** [hour, minute] in the demo zone; omitted → all day. */
  from?: [number, number];
  /** Minutes, or for all-day items the number of days (default 1). */
  length?: number;
  kind: CalendarEvent['kind'];
  title: LocalizedText;
  location?: LocalizedText;
  category: EventCategory;
  hostId?: string;
  participantIds: string[];
  travel?: { mode: TravelMode; minutes: number };
  prep?: number;
  arrival?: number;
  recurrence?: Omit<Recurrence, 'until'> & { untilOffset?: number };
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
    travel: { mode: 'transit', minutes: 18 },
    prep: 15,
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
    travel: { mode: 'transit', minutes: 15 },
    prep: 15,
    arrival: 10,
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
    travel: { mode: 'walk', minutes: 12 },
    prep: 5,
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
    travel: { mode: 'bike', minutes: 22 },
    prep: 30,
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
    travel: { mode: 'bike', minutes: 10 },
    prep: 10,
    arrival: 5,
    recurrence: { freq: 'weekly', interval: 1 },
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
    travel: { mode: 'transit', minutes: 25 },
    prep: 20,
    arrival: 5,
  },
  {
    id: 'tom-bday',
    dayOffset: 3,
    kind: 'appointment',
    category: 'celebration',
    title: { de: 'Toms Geburtstag 🎂', en: 'Tom’s birthday 🎂' },
    participantIds: ['chris'],
    recurrence: { freq: 'yearly', interval: 1 },
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
    travel: { mode: 'transit', minutes: 20 },
    prep: 45,
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
    travel: { mode: 'bike', minutes: 30 },
    prep: 30,
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
    travel: { mode: 'car', minutes: 35 },
    prep: 20,
  },
  {
    id: 'movie-night',
    dayOffset: 8,
    from: [19, 30],
    length: 180,
    kind: 'social',
    category: 'social',
    title: { de: 'Filmabend bei mir', en: 'Movie night at mine' },
    location: { de: 'Bei mir', en: 'My place' },
    hostId: 'chris',
    participantIds: ['chris', 'olivia', 'tom', 'mia', 'alex'],
    prep: 30,
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
    travel: { mode: 'transit', minutes: 25 },
    prep: 30,
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

/** Example events for `now`. Deterministic for a given `now` and zone. */
export function buildDemoEvents(now: Date, timeZone: string = DEMO_TIME_ZONE): CalendarEvent[] {
  const today = dayKeyOf(now, timeZone);
  return TEMPLATES.map((t): CalendarEvent => {
    const day = addDays(today, t.dayOffset);
    const { untilOffset, ...rec } = t.recurrence ?? { freq: 'daily' as const, interval: 1 };
    const recurrence: Recurrence | undefined = t.recurrence
      ? { ...rec, ...(untilOffset !== undefined ? { until: addDays(today, untilOffset) } : {}) }
      : undefined;
    const times = t.from
      ? (() => {
          const start = zonedWallTimeToInstant(day, t.from[0], t.from[1], timeZone);
          return { allDay: false, start, end: new Date(start.getTime() + (t.length ?? 60) * 60_000) };
        })()
      : { allDay: true, start: startOfDay(day, timeZone), end: startOfDay(addDays(day, t.length ?? 1), timeZone) };
    return {
      id: `demo-${t.id}`,
      kind: t.kind,
      title: t.title.de,
      titleI18n: t.title,
      location: t.location?.de ?? '',
      ...(t.location ? { locationI18n: t.location } : {}),
      category: t.category,
      ...times,
      timeZone,
      prepMinutes: t.prep ?? 0,
      arrivalMarginMinutes: t.arrival ?? 0,
      participantIds: t.participantIds,
      ...(t.hostId ? { hostId: t.hostId } : {}),
      ...(t.travel ? { travel: t.travel } : {}),
      ...(recurrence ? { recurrence } : {}),
      isDemo: true,
      createdAt: now,
      updatedAt: now,
    };
  });
}

/** One concrete appearance of an event in the calendar (recurring events appear many times). */
export interface AgendaItem {
  event: CalendarEvent;
  /** Day key of the occurrence start – identifies the occurrence for "delete only this one". */
  occurrenceKey: DayKey;
  start: Date;
  end: Date;
  allDay: boolean;
}

/** All occurrences overlapping the local days [from, toExclusive), sorted (all-day first). */
export function agendaBetween(
  events: readonly CalendarEvent[],
  from: DayKey,
  toExclusive: DayKey,
  timeZone: string,
): AgendaItem[] {
  const rangeStart = startOfDay(from, timeZone);
  const rangeEnd = startOfDay(toExclusive, timeZone);
  return events
    .flatMap((event) =>
      expandOccurrences(event, rangeStart, rangeEnd).map((o) => ({
        event,
        occurrenceKey: o.key,
        start: o.start,
        end: o.end,
        allDay: event.allDay,
      })),
    )
    .sort(compareAgenda);
}

export const agendaForDay = (events: readonly CalendarEvent[], day: DayKey, timeZone: string) =>
  agendaBetween(events, day, addDays(day, 1), timeZone);

/** Social events that have not ended yet, soonest first (next occurrence for recurring ones). */
export function upcomingSocial(
  events: readonly CalendarEvent[],
  now: Date,
  timeZone: string,
  horizonDays = 60,
): AgendaItem[] {
  const today = dayKeyOf(now, timeZone);
  const seen = new Set<string>();
  return agendaBetween(
    events.filter((e) => e.kind === 'social'),
    today,
    addDays(today, horizonDays),
    timeZone,
  ).filter((i) => {
    if (i.end.getTime() <= now.getTime() || seen.has(i.event.id)) return false;
    seen.add(i.event.id);
    return true;
  });
}

export * from './collab';
export * from './journeys';

export function personName(id: string): string {
  const p = DEMO_PEOPLE.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown demo person "${id}"`);
  return p.name;
}
