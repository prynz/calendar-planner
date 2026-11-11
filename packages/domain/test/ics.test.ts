import { describe, expect, it } from 'vitest';

import {
  exportIcs,
  expandOccurrences,
  foldIcsLine,
  icsEventId,
  parseIcs,
  zonedWallTimeToInstant,
  type CalendarEvent,
  type IcsEntry,
} from '../src';

const TZ = 'Europe/Berlin';
const NOW = new Date('2026-11-11T08:00:00Z');
const at = (day: string, h: number, m = 0) => zonedWallTimeToInstant(day, h, m, TZ);

function event(over: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'evt-1',
    kind: 'social',
    title: 'Stammtisch; mit, Freunden',
    location: 'Zum Löwen',
    category: 'social',
    start: at('2026-12-04', 19, 30),
    end: at('2026-12-04', 22),
    allDay: false,
    timeZone: TZ,
    prepMinutes: 0,
    arrivalMarginMinutes: 0,
    participantIds: ['chris'],
    isDemo: false,
    createdAt: NOW,
    updatedAt: NOW,
    ...over,
  };
}

const ok = (e: IcsEntry | undefined) => {
  if (!e || !e.ok) throw new Error(`expected ok entry, got ${JSON.stringify(e)}`);
  return e;
};

const wrap = (...vevent: string[]) =>
  ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', ...vevent, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');

describe('ICS export', () => {
  it('writes a valid calendar with zone, escaping, rule and exceptions', () => {
    const ics = exportIcs(
      [
        event({
          recurrence: {
            freq: 'monthly',
            interval: 1,
            byNthWeekday: { weekday: 4, nth: 1 },
            exdates: ['2027-01-01'],
            until: '2027-06-30',
          },
        }),
      ],
      NOW,
      'de',
    );
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('UID:evt-1@nowish.app');
    expect(ics).toContain('SUMMARY:Stammtisch\\; mit\\, Freunden');
    expect(ics).toContain('DTSTART;TZID=Europe/Berlin:20261204T193000');
    expect(ics).toContain('RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=1FR;UNTIL=20270630T215900Z');
    expect(ics).toContain('EXDATE;TZID=Europe/Berlin:20270101T193000');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });

  it('round-trips through the parser and maps back to the same id', () => {
    const original = event({ recurrence: { freq: 'weekly', interval: 2, byWeekday: [0, 2], count: 10 } });
    const parsed = parseIcs(
      exportIcs(
        [original, event({ id: 'day', allDay: true, start: at('2026-12-24', 0), end: at('2026-12-27', 0) })],
        NOW,
        'de',
      ),
      'UTC',
    );
    if (!parsed.ok) throw new Error(parsed.error);
    const [a, b] = parsed.entries.map(ok);
    expect(icsEventId(a!.uid)).toBe('evt-1');
    expect(a!.event).toMatchObject({ title: original.title, location: 'Zum Löwen', timeZone: TZ, allDay: false });
    expect(a!.event.start).toEqual(original.start);
    expect(a!.event.recurrence).toEqual({ freq: 'weekly', interval: 2, byWeekday: [0, 2], count: 10 });
    expect(b!.event).toMatchObject({ allDay: true, timeZone: 'UTC' });
    expect(b!.event.end.getTime() - b!.event.start.getTime()).toBe(3 * 86_400_000);
  });

  it('folds long lines at 75 octets without splitting characters', () => {
    const line = `SUMMARY:${'ä'.repeat(60)}`;
    const folded = foldIcsLine(line);
    for (const part of folded.split('\r\n')) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    expect(folded.replace(/\r\n /g, '')).toBe(line);
  });
});

describe('ICS import', () => {
  it('reads UTC, floating and folded values', () => {
    const r = parseIcs(
      wrap(
        'UID:a',
        'SUMMARY:Arzt',
        'DTSTART:20261120T080000Z',
        'DTEND:20261120T090000Z',
        'LOCATION:Praxis\\, 2. Stock',
        ' (Aufzug)',
      ),
      TZ,
    );
    if (!r.ok) throw new Error(r.error);
    const e = ok(r.entries[0]).event;
    expect(e.start.toISOString()).toBe('2026-11-20T08:00:00.000Z');
    expect(e.location).toBe('Praxis, 2. Stock(Aufzug)');
    expect(e.timeZone).toBe(TZ);
  });

  it('maps Windows zones, assumes the default for unknown ones and says so', () => {
    const r = parseIcs(
      [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:w',
        'SUMMARY:Outlook',
        'DTSTART;TZID=W. Europe Standard Time:20261120T100000',
        'DURATION:PT1H30M',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:x',
        'SUMMARY:Fremd',
        'DTSTART;TZID=Custom/Zone:20261120T100000',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\n'),
      TZ,
    );
    if (!r.ok) throw new Error(r.error);
    const [w, x] = r.entries.map(ok);
    expect(w!.event.timeZone).toBe('Europe/Berlin');
    expect(w!.event.end.getTime() - w!.event.start.getTime()).toBe(90 * 60_000);
    expect(x!.warnings).toEqual(['timezone-assumed', 'no-end']);
  });

  it('reports bad entries one by one instead of stopping', () => {
    const r = parseIcs(
      [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:1',
        'SUMMARY:Ohne Start',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:2',
        'DTSTART:20261120T100000Z',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:3',
        'SUMMARY:Rückwärts',
        'DTSTART:20261120T100000Z',
        'DTEND:20261120T090000Z',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:4',
        'SUMMARY:Abgesagt',
        'STATUS:CANCELLED',
        'DTSTART:20261120T100000Z',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:5',
        'SUMMARY:Gut',
        'DTSTART;VALUE=DATE:20261224',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n'),
      TZ,
    );
    if (!r.ok) throw new Error(r.error);
    expect(r.skippedCancelled).toBe(1);
    expect(r.entries.map((e) => (e.ok ? 'ok' : e.error))).toEqual(['no-start', 'no-title', 'end-before-start', 'ok']);
  });

  it('simplifies rules it cannot represent and applies changed occurrences as exceptions', () => {
    const r = parseIcs(
      [
        'BEGIN:VCALENDAR',
        'BEGIN:VEVENT',
        'UID:s',
        'SUMMARY:Serie',
        'DTSTART;TZID=Europe/Berlin:20261102T180000',
        'DTEND;TZID=Europe/Berlin:20261102T190000',
        'RRULE:FREQ=WEEKLY;BYDAY=MO',
        'EXDATE;TZID=Europe/Berlin:20261109T180000',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:s',
        'RECURRENCE-ID;TZID=Europe/Berlin:20261116T180000',
        'SUMMARY:Serie (verschoben)',
        'DTSTART;TZID=Europe/Berlin:20261117T180000',
        'DTEND;TZID=Europe/Berlin:20261117T190000',
        'END:VEVENT',
        'BEGIN:VEVENT',
        'UID:h',
        'SUMMARY:Stündlich',
        'DTSTART:20261120T100000Z',
        'DTEND:20261120T110000Z',
        'RRULE:FREQ=HOURLY',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n'),
      TZ,
    );
    if (!r.ok) throw new Error(r.error);
    const [series, moved, hourly] = r.entries.map(ok);
    expect(series!.event.recurrence).toEqual({
      freq: 'weekly',
      interval: 1,
      byWeekday: [0],
      exdates: ['2026-11-09', '2026-11-16'],
    });
    expect(moved!.uid).toBe('s#20261116T180000');
    expect(moved!.event.recurrence).toBeUndefined();
    expect(hourly!.warnings).toEqual(['recurrence-simplified']);
    expect(hourly!.event.recurrence).toBeUndefined();
    const days = expandOccurrences({ ...series!.event }, at('2026-11-01', 0), at('2026-11-30', 0)).map((o) => o.key);
    expect(days).toEqual(['2026-11-02', '2026-11-23']);
  });

  it('rejects files that are not calendars or empty', () => {
    expect(parseIcs('hello', TZ)).toEqual({ ok: false, error: 'not-calendar' });
    expect(parseIcs('BEGIN:VCALENDAR\r\nEND:VCALENDAR', TZ)).toEqual({ ok: false, error: 'empty' });
  });

  it('gives foreign UIDs stable, distinct ids', () => {
    expect(icsEventId('abc@google.com')).toBe(icsEventId('abc@google.com'));
    expect(icsEventId('abc@google.com')).not.toBe(icsEventId('abd@google.com'));
    expect(icsEventId('abc@google.com')).toMatch(/^ics-/);
  });
});
