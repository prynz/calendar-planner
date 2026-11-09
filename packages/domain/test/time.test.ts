import { describe, expect, it } from 'vitest';

import {
  addDays,
  compareAgenda,
  dayKeyOf,
  eventStatus,
  humanizeMinutes,
  occursOnDay,
  parseDayKey,
  startOfDay,
  zonedWallTimeToInstant,
  zoneOffsetMinutes,
} from '../src';

const BERLIN = 'Europe/Berlin';
const NY = 'America/New_York';

describe('zone offsets', () => {
  it('knows Berlin winter and summer time', () => {
    expect(zoneOffsetMinutes(new Date('2026-01-15T12:00:00Z'), BERLIN)).toBe(60);
    expect(zoneOffsetMinutes(new Date('2026-07-15T12:00:00Z'), BERLIN)).toBe(120);
    expect(zoneOffsetMinutes(new Date('2026-07-15T12:00:00Z'), NY)).toBe(-240);
  });
});

describe('zonedWallTimeToInstant', () => {
  it('converts normal wall times', () => {
    expect(zonedWallTimeToInstant('2026-11-09', 19, 0, BERLIN).toISOString()).toBe('2026-11-09T18:00:00.000Z');
    expect(zonedWallTimeToInstant('2026-07-01', 9, 30, NY).toISOString()).toBe('2026-07-01T13:30:00.000Z');
  });

  it('handles the spring-forward gap (02:30 does not exist on 2026-03-29 in Berlin)', () => {
    const d = zonedWallTimeToInstant('2026-03-29', 2, 30, BERLIN);
    // shifted forward by the 1 h gap → 03:30 CEST
    expect(d.toISOString()).toBe('2026-03-29T01:30:00.000Z');
  });

  it('picks the earlier instant for repeated autumn times', () => {
    const d = zonedWallTimeToInstant('2026-10-25', 2, 30, BERLIN);
    expect(d.toISOString()).toBe('2026-10-25T00:30:00.000Z');
  });

  it('rejects invalid input', () => {
    expect(() => zonedWallTimeToInstant('2026-02-30', 10, 0, BERLIN)).toThrow();
    expect(() => zonedWallTimeToInstant('2026-02-10', 24, 0, BERLIN)).toThrow();
    expect(() => parseDayKey('09.11.2026')).toThrow();
  });
});

describe('day keys', () => {
  it('uses the zone, not UTC', () => {
    const lateEvening = new Date('2026-11-09T23:30:00Z');
    expect(dayKeyOf(lateEvening, BERLIN)).toBe('2026-11-10');
    expect(dayKeyOf(lateEvening, NY)).toBe('2026-11-09');
  });

  it('adds days across months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('a DST day in Berlin has 23 hours', () => {
    const len = startOfDay('2026-03-30', BERLIN).getTime() - startOfDay('2026-03-29', BERLIN).getTime();
    expect(len).toBe(23 * 3600_000);
  });
});

describe('event status & agenda', () => {
  const at = (iso: string) => new Date(iso);
  const evening = { start: at('2026-11-09T18:00:00Z'), end: at('2026-11-09T22:00:00Z'), allDay: false };

  it('derives upcoming / running / done', () => {
    expect(eventStatus(evening, at('2026-11-09T16:30:00Z'))).toEqual({ kind: 'upcoming', minutesUntil: 90 });
    expect(eventStatus(evening, at('2026-11-09T19:00:00Z'))).toEqual({ kind: 'running' });
    expect(eventStatus(evening, at('2026-11-09T22:00:00Z'))).toEqual({ kind: 'done' });
    expect(eventStatus({ ...evening, allDay: true }, at('2026-11-09T19:00:00Z'))).toEqual({ kind: 'all-day' });
  });

  it('shows items that cross midnight on both days', () => {
    const party = { start: at('2026-11-09T21:00:00Z'), end: at('2026-11-10T01:00:00Z'), allDay: false };
    expect(occursOnDay(party, '2026-11-09', BERLIN)).toBe(true);
    expect(occursOnDay(party, '2026-11-10', BERLIN)).toBe(true);
    expect(occursOnDay(party, '2026-11-11', BERLIN)).toBe(false);
  });

  it('respects all-day ranges', () => {
    const trip = {
      start: at('2026-11-12T00:00:00Z'),
      end: at('2026-11-15T00:00:00Z'),
      allDay: true,
      allDayRange: { first: '2026-11-12', last: '2026-11-14' },
    };
    expect(occursOnDay(trip, '2026-11-14', BERLIN)).toBe(true);
    expect(occursOnDay(trip, '2026-11-15', BERLIN)).toBe(false);
  });

  it('sorts all-day first, then by start', () => {
    const a = { start: at('2026-11-09T08:00:00Z'), end: at('2026-11-09T09:00:00Z'), allDay: false };
    const b = { start: at('2026-11-09T00:00:00Z'), end: at('2026-11-10T00:00:00Z'), allDay: true };
    expect([evening, a, b].sort(compareAgenda)).toEqual([b, a, evening]);
  });

  it('humanizes durations', () => {
    expect(humanizeMinutes(45)).toEqual({ unit: 'minutes', value: 45 });
    expect(humanizeMinutes(150)).toEqual({ unit: 'hours', value: 3 });
    expect(humanizeMinutes(3 * 24 * 60)).toEqual({ unit: 'days', value: 3 });
    expect(() => humanizeMinutes(-1)).toThrow();
  });
});
