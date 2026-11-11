import { addDays, parseDayKey, wallParts, zonedWallTimeToInstant, dayKeyOf, type DayKey } from './time';

/**
 * RFC 5545 subset (docs/product/features/calendar.md): FREQ, INTERVAL, BYDAY (weekly, and monthly with one
 * ordinal such as `1FR` / `-1MO`), COUNT, UNTIL, EXDATE.
 * Occurrences keep the event's local wall-clock time in its zone, so a 19:00 weekly appointment stays at
 * 19:00 across daylight saving changes.
 */

export const RECURRENCE_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

/** 0 = Monday … 6 = Sunday (ISO order, DACH week start). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const NTH_WEEKS = [1, 2, 3, 4, -1] as const;
export type NthWeek = (typeof NTH_WEEKS)[number];

export interface Recurrence {
  freq: RecurrenceFrequency;
  /** Every n-th period, 1–99. */
  interval: number;
  /** Weekly only; empty/absent = the weekday of the first occurrence. */
  byWeekday?: readonly Weekday[];
  /**
   * Monthly only: the n-th weekday of the month (`nth` 1–4, or -1 = last), e.g. "every 1st Friday"
   * (groups.md GRP-04). Absent = the day of month of the first occurrence.
   */
  byNthWeekday?: { weekday: Weekday; nth: NthWeek };
  /** Last day (inclusive) on which an occurrence may start. */
  until?: DayKey;
  /** Total number of occurrences including the first. */
  count?: number;
  /** Days whose occurrence was deleted ("only this one"). */
  exdates?: readonly DayKey[];
}

export interface RecurringSource {
  start: Date;
  end: Date;
  timeZone: string;
  allDay: boolean;
  recurrence?: Recurrence;
}

export interface Occurrence {
  /** Day key of this occurrence's start in the event zone – stable id for exceptions. */
  key: DayKey;
  start: Date;
  end: Date;
}

/** Safety cap: no view needs more; prevents runaway loops on bad data. */
const MAX_ITERATIONS = 20_000;

export function weekdayOf(day: DayKey): Weekday {
  const { year, month, dayOfMonth } = parseDayKey(day);
  // getUTCDay: 0 = Sunday → shift to Monday = 0.
  return ((new Date(Date.UTC(year, month - 1, dayOfMonth)).getUTCDay() + 6) % 7) as Weekday;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const pad = (n: number) => String(n).padStart(2, '0');
const dayKey = (y: number, m: number, d: number): DayKey => `${y}-${pad(m)}-${pad(d)}`;

/** Day of the n-th (or last, -1) `weekday` in a month; null when the month has no such day (5th never asked). */
export function nthWeekdayOfMonth(year: number, month: number, weekday: Weekday, nth: NthWeek): DayKey | null {
  if (nth === -1) {
    const last = dayKey(year, month, daysInMonth(year, month));
    const back = (weekdayOf(last) - weekday + 7) % 7;
    return addDays(last, -back);
  }
  const firstOfMonth = dayKey(year, month, 1);
  const offset = (weekday - weekdayOf(firstOfMonth) + 7) % 7;
  const d = 1 + offset + (nth - 1) * 7;
  return d <= daysInMonth(year, month) ? dayKey(year, month, d) : null;
}

/** The ordinal of `day` within its month as used by "every n-th weekday" (5th weekday → last). */
export function nthOfDay(day: DayKey): { weekday: Weekday; nth: NthWeek } {
  const { dayOfMonth } = parseDayKey(day);
  const n = Math.ceil(dayOfMonth / 7);
  // A 5th weekday does not exist every month; "last" keeps the series monthly instead of skipping months.
  const nth: NthWeek = n >= 5 ? -1 : (n as 1 | 2 | 3 | 4);
  return { weekday: weekdayOf(day), nth };
}

/** Candidate start days in chronological order (before COUNT/UNTIL/EXDATE filtering). */
function* candidateDays(first: DayKey, r: Recurrence): Generator<DayKey> {
  const { year, month, dayOfMonth } = parseDayKey(first);
  switch (r.freq) {
    case 'daily':
      for (let i = 0; ; i++) yield addDays(first, i * r.interval);
    case 'weekly': {
      const days = [...new Set(r.byWeekday && r.byWeekday.length > 0 ? r.byWeekday : [weekdayOf(first)])].sort();
      const weekStart = addDays(first, -weekdayOf(first));
      for (let w = 0; ; w++) {
        const monday = addDays(weekStart, w * 7 * r.interval);
        for (const wd of days) {
          const d = addDays(monday, wd);
          if (d >= first) yield d;
        }
      }
    }
    case 'monthly':
      for (let i = 0; ; i++) {
        const total = month - 1 + i * r.interval;
        const y = year + Math.floor(total / 12);
        const m = (total % 12) + 1;
        if (r.byNthWeekday) {
          const d = nthWeekdayOfMonth(y, m, r.byNthWeekday.weekday, r.byNthWeekday.nth);
          if (d !== null && d >= first) yield d;
          continue;
        }
        // RFC 5545: months without that day (31st, 30 Feb) are skipped, not clamped.
        if (dayOfMonth <= daysInMonth(y, m)) yield dayKey(y, m, dayOfMonth);
      }
    case 'yearly':
      for (let i = 0; ; i++) {
        const y = year + i * r.interval;
        if (dayOfMonth <= daysInMonth(y, month)) yield dayKey(y, month, dayOfMonth);
      }
  }
}

/** Occurrences that overlap [rangeStart, rangeEnd). Non-recurring sources yield at most one. */
export function expandOccurrences(source: RecurringSource, rangeStart: Date, rangeEnd: Date): Occurrence[] {
  const duration = source.end.getTime() - source.start.getTime();
  const firstDay = dayKeyOf(source.start, source.timeZone);
  const overlaps = (s: number) => s < rangeEnd.getTime() && s + duration > rangeStart.getTime();
  if (!source.recurrence) {
    return overlaps(source.start.getTime()) ? [{ key: firstDay, start: source.start, end: source.end }] : [];
  }
  const r = source.recurrence;
  if (!Number.isInteger(r.interval) || r.interval < 1) throw new Error(`Invalid recurrence interval ${r.interval}`);
  const wall = wallParts(source.start, source.timeZone);
  const exdates = new Set(r.exdates ?? []);
  const out: Occurrence[] = [];
  let produced = 0;
  let iterations = 0;
  for (const day of candidateDays(firstDay, r)) {
    if (++iterations > MAX_ITERATIONS) break;
    if (r.until !== undefined && day > r.until) break;
    if (r.count !== undefined && produced >= r.count) break;
    produced++; // COUNT includes deleted occurrences (RFC 5545 EXDATE semantics)
    const start = source.allDay
      ? zonedWallTimeToInstant(day, 0, 0, source.timeZone)
      : zonedWallTimeToInstant(day, wall.hour, wall.minute, source.timeZone);
    if (start.getTime() >= rangeEnd.getTime()) break;
    if (exdates.has(day)) continue;
    if (overlaps(start.getTime())) out.push({ key: day, start, end: new Date(start.getTime() + duration) });
  }
  return out;
}
