import { describe, expect, it } from 'vitest';

import { findConflicts, freeGaps, parseQuickEntry, zonedWallTimeToInstant, type PlannedItem } from '../src';

const TZ = 'Europe/Berlin';
const DAY = '2026-11-12'; // Thursday
const at = (h: number, m = 0, day = DAY) => zonedWallTimeToInstant(day, h, m, TZ);
const item = (key: string, from: [number, number], to: [number, number], extra: Partial<PlannedItem> = {}) => ({
  key,
  start: at(...from),
  end: at(...to),
  allDay: false,
  bufferMinutes: 0,
  ...extra,
});

describe('findConflicts', () => {
  it('finds a tight transition and offers to shift or to skip the buffer', () => {
    const dentist = item('dentist', [11, 0], [12, 0]);
    // Lunch 12:30, 30 min travel + 8 min buffer → leave 11:52, 8 minutes before the dentist ends.
    const lunch = item('lunch', [12, 30], [13, 30], { leaveAt: at(11, 52), bufferMinutes: 8 });
    expect(findConflicts([lunch, dentist])).toEqual([
      {
        kind: 'tight',
        first: 'dentist',
        second: 'lunch',
        minutes: 8,
        fixes: [
          { kind: 'shift', key: 'lunch', minutes: 10 },
          { kind: 'skip-buffer', key: 'lunch', minutes: 8 },
        ],
      },
    ]);
  });

  it('does not offer to skip the buffer when that would not be enough', () => {
    const a = item('a', [9, 0], [10, 0]);
    const b = item('b', [10, 15], [11, 0], { leaveAt: at(9, 40), bufferMinutes: 5 });
    const [c] = findConflicts([a, b]);
    expect(c?.minutes).toBe(20);
    expect(c?.fixes).toEqual([{ kind: 'shift', key: 'b', minutes: 20 }]);
  });

  it('finds overlaps, including more than one later item', () => {
    const long = item('long', [9, 0], [12, 0]);
    const x = item('x', [10, 0], [10, 30]);
    const y = item('y', [11, 30], [13, 0]);
    const conflicts = findConflicts([long, x, y]);
    expect(conflicts.map((c) => [c.kind, c.first, c.second, c.minutes])).toEqual([
      ['overlap', 'long', 'x', 30],
      ['overlap', 'long', 'y', 30],
    ]);
    expect(conflicts[0]?.fixes).toEqual([{ kind: 'shift', key: 'x', minutes: 120 }]);
  });

  it('is quiet when plans fit, and ignores all-day items', () => {
    const a = item('a', [9, 0], [10, 0]);
    const b = item('b', [11, 0], [12, 0], { leaveAt: at(10, 30), bufferMinutes: 5 });
    const allDay = { ...item('trip', [0, 0], [23, 59]), allDay: true };
    expect(findConflicts([a, b, allDay])).toEqual([]);
  });

  it('a back-to-back meeting without travel is fine', () => {
    expect(findConflicts([item('a', [9, 0], [10, 0]), item('b', [10, 0], [11, 0])])).toEqual([]);
  });
});

describe('freeGaps', () => {
  it('returns real free time: travel counts as busy, short gaps are left out', () => {
    const run = item('run', [7, 30], [8, 0]);
    const dentist = item('dentist', [11, 0], [12, 0], { leaveAt: at(10, 38) });
    const lunch = item('lunch', [12, 30], [13, 30], { leaveAt: at(12, 10) });
    const gaps = freeGaps([lunch, run, dentist], at(7, 0), at(15, 0));
    expect(gaps.map((g) => [g.after ?? '-', g.minutes])).toEqual([
      ['run', 158],
      ['lunch', 90],
    ]);
    expect(gaps[0]?.from).toEqual(at(8, 0));
    expect(gaps[0]?.to).toEqual(at(10, 38));
  });

  it('copes with overlapping items and an empty day', () => {
    const a = item('a', [9, 0], [12, 0]);
    const b = item('b', [10, 0], [11, 0]);
    expect(freeGaps([a, b], at(8, 0), at(14, 0)).map((g) => g.minutes)).toEqual([60, 120]);
    expect(freeGaps([], at(8, 0), at(9, 0))).toEqual([{ from: at(8, 0), to: at(9, 0), minutes: 60 }]);
  });
});

describe('parseQuickEntry', () => {
  it.each([
    ['Freitag 19 Uhr Grillen bei Tom', { title: 'Grillen', day: '2026-11-13', startMinute: 1140, location: 'bei Tom' }],
    ['Morgen 8:15 Zahnarzt', { title: 'Zahnarzt', day: '2026-11-13', startMinute: 495 }],
    ['Brunch am Samstag um 10 bei Oma', { title: 'Brunch', day: '2026-11-14', startMinute: 600, location: 'bei Oma' }],
    ['heute 18.30 Laufen am Fluss', { title: 'Laufen', day: '2026-11-12', startMinute: 1110, location: 'am Fluss' }],
    ['Übermorgen Kino', { title: 'Kino', day: '2026-11-14' }],
    ['Dinner with Sam on Monday at 7pm', { title: 'Dinner with Sam', day: '2026-11-16', startMinute: 1140 }],
    [
      'tomorrow 9am dentist at Main St',
      { title: 'dentist', day: '2026-11-13', startMinute: 540, location: 'at Main St' },
    ],
    [
      'Elternabend 26.11. 19:30 in der Schule',
      { title: 'Elternabend', day: '2026-11-26', startMinute: 1170, location: 'in der Schule' },
    ],
    ['Steuererklärung', { title: 'Steuererklärung' }],
  ])('%s', (input, expected) => {
    expect(parseQuickEntry(input, DAY)).toEqual(expected);
  });

  it('takes today for the same weekday and next year for a date already past', () => {
    expect(parseQuickEntry('Donnerstag Yoga', DAY).day).toBe('2026-11-12');
    expect(parseQuickEntry('Konzert 3.2.', DAY).day).toBe('2027-02-03');
  });

  it('ignores impossible dates and keeps short weekday words without a time in the title', () => {
    expect(parseQuickEntry('Party 31.11.', DAY)).toEqual({ title: 'Party 31.11.' });
    expect(parseQuickEntry('so müde', DAY)).toEqual({ title: 'so müde' });
  });
});
