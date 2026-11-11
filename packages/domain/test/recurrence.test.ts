import { describe, expect, it } from 'vitest';

import {
  expandOccurrences,
  nthOfDay,
  nthWeekdayOfMonth,
  weekdayOf,
  zonedWallTimeToInstant,
  type RecurringSource,
} from '../src';

const TZ = 'Europe/Berlin';
const at = (day: string, h: number, m = 0) => zonedWallTimeToInstant(day, h, m, TZ);
const keys = (src: RecurringSource, from: string, to: string) =>
  expandOccurrences(src, at(from, 0), at(to, 0)).map((o) => o.key);
const evening = (day: string, recurrence?: RecurringSource['recurrence']): RecurringSource => ({
  start: at(day, 19),
  end: at(day, 20, 30),
  timeZone: TZ,
  allDay: false,
  ...(recurrence ? { recurrence } : {}),
});

describe('weekdayOf', () => {
  it('uses Monday = 0', () => {
    expect(weekdayOf('2026-11-09')).toBe(0); // Monday
    expect(weekdayOf('2026-11-15')).toBe(6); // Sunday
  });
});

describe('expandOccurrences', () => {
  it('returns a single event when it overlaps the range', () => {
    expect(keys(evening('2026-11-10'), '2026-11-09', '2026-11-16')).toEqual(['2026-11-10']);
    expect(keys(evening('2026-11-20'), '2026-11-09', '2026-11-16')).toEqual([]);
  });

  it('repeats daily with interval and count', () => {
    const src = evening('2026-11-09', { freq: 'daily', interval: 2, count: 3 });
    expect(keys(src, '2026-11-01', '2026-12-01')).toEqual(['2026-11-09', '2026-11-11', '2026-11-13']);
  });

  it('repeats weekly on several weekdays, every second week', () => {
    const src = evening('2026-11-10', { freq: 'weekly', interval: 2, byWeekday: [1, 3] }); // Tue + Thu
    expect(keys(src, '2026-11-09', '2026-12-07')).toEqual(['2026-11-10', '2026-11-12', '2026-11-24', '2026-11-26']);
  });

  it('keeps the wall-clock time across the DST change', () => {
    const src = evening('2026-10-20', { freq: 'weekly', interval: 1 });
    const [before, after] = expandOccurrences(src, at('2026-10-20', 0), at('2026-10-28', 0));
    expect(before?.start.toISOString()).toBe('2026-10-20T17:00:00.000Z'); // 19:00 CEST
    expect(after?.start.toISOString()).toBe('2026-10-27T18:00:00.000Z'); // 19:00 CET
  });

  it('skips months that lack the day (31st) instead of clamping', () => {
    const src = evening('2027-01-31', { freq: 'monthly', interval: 1, count: 4 });
    expect(keys(src, '2027-01-01', '2028-01-01')).toEqual(['2027-01-31', '2027-03-31', '2027-05-31', '2027-07-31']);
  });

  it('handles Feb 29 yearly only in leap years', () => {
    const src = evening('2028-02-29', { freq: 'yearly', interval: 1 });
    expect(keys(src, '2028-01-01', '2033-01-01')).toEqual(['2028-02-29', '2032-02-29']);
  });

  it('respects until (inclusive) and exdates', () => {
    const src = evening('2026-11-09', { freq: 'daily', interval: 1, until: '2026-11-12', exdates: ['2026-11-10'] });
    expect(keys(src, '2026-11-01', '2026-12-01')).toEqual(['2026-11-09', '2026-11-11', '2026-11-12']);
  });

  it('counts deleted occurrences towards COUNT (RFC 5545)', () => {
    const src = evening('2026-11-09', { freq: 'daily', interval: 1, count: 3, exdates: ['2026-11-10'] });
    expect(keys(src, '2026-11-01', '2026-12-01')).toEqual(['2026-11-09', '2026-11-11']);
  });

  it('finds occurrences far after the start without listing earlier ones', () => {
    const src = evening('2020-01-06', { freq: 'weekly', interval: 1 });
    expect(keys(src, '2026-11-09', '2026-11-16')).toEqual(['2026-11-09']);
  });

  it('expands all-day recurring items at local midnight', () => {
    const src: RecurringSource = {
      start: at('2026-11-09', 0),
      end: at('2026-11-10', 0),
      timeZone: TZ,
      allDay: true,
      recurrence: { freq: 'yearly', interval: 1 },
    };
    const [o] = expandOccurrences(src, at('2027-11-01', 0), at('2027-12-01', 0));
    expect(o?.key).toBe('2027-11-09');
    expect(o?.start.toISOString()).toBe('2027-11-08T23:00:00.000Z');
  });

  it('rejects invalid intervals', () => {
    expect(() => keys(evening('2026-11-09', { freq: 'daily', interval: 0 }), '2026-11-01', '2026-12-01')).toThrow();
  });
});

describe('monthly n-th weekday', () => {
  const TZ2 = 'Europe/Berlin';
  it('expands "every 1st Friday" and "last Monday"', () => {
    const start = zonedWallTimeToInstant('2026-11-06', 19, 0, TZ2);
    const src = { start, end: new Date(start.getTime() + 3_600_000), timeZone: TZ2, allDay: false };
    const first = expandOccurrences(
      { ...src, recurrence: { freq: 'monthly', interval: 1, byNthWeekday: { weekday: 4, nth: 1 } } },
      start,
      zonedWallTimeToInstant('2027-03-01', 0, 0, TZ2),
    ).map((o) => o.key);
    expect(first).toEqual(['2026-11-06', '2026-12-04', '2027-01-01', '2027-02-05']);
    const last = expandOccurrences(
      { ...src, recurrence: { freq: 'monthly', interval: 1, byNthWeekday: { weekday: 0, nth: -1 }, count: 3 } },
      start,
      zonedWallTimeToInstant('2027-06-01', 0, 0, TZ2),
    ).map((o) => o.key);
    expect(last).toEqual(['2026-11-30', '2026-12-28', '2027-01-25']);
  });

  it('derives the ordinal of a day', () => {
    expect(nthOfDay('2026-11-06')).toEqual({ weekday: 4, nth: 1 });
    expect(nthOfDay('2026-11-27')).toEqual({ weekday: 4, nth: 4 });
    expect(nthOfDay('2026-10-30')).toEqual({ weekday: 4, nth: -1 });
    expect(nthWeekdayOfMonth(2026, 2, 0, 4)).toBe('2026-02-23');
  });
});
