import { addDays, dayKeyOf, parseDayKey, startOfDay, type DayKey } from './time';

/** Minimal time shape shared by appointments and social events (ADR 0006). */
export interface TimedItem {
  start: Date;
  end: Date;
  allDay: boolean;
  /** For all-day items: first and last day (inclusive) in the item's zone. */
  allDayRange?: { first: DayKey; last: DayKey };
}

export type EventStatus =
  { kind: 'all-day' } | { kind: 'running' } | { kind: 'done' } | { kind: 'upcoming'; minutesUntil: number };

export function eventStatus(item: TimedItem, now: Date): EventStatus {
  if (item.allDay) return { kind: 'all-day' };
  const t = now.getTime();
  if (t >= item.end.getTime()) return { kind: 'done' };
  if (t >= item.start.getTime()) return { kind: 'running' };
  return { kind: 'upcoming', minutesUntil: Math.ceil((item.start.getTime() - t) / 60_000) };
}

/** True if the item touches `day` in `timeZone` (multi-day items appear on every day they cover). */
export function occursOnDay(item: TimedItem, day: DayKey, timeZone: string): boolean {
  if (item.allDay) {
    const range = item.allDayRange ?? { first: dayKeyOf(item.start, timeZone), last: dayKeyOf(item.start, timeZone) };
    return day >= range.first && day <= range.last;
  }
  const dayStart = startOfDay(day, timeZone).getTime();
  const dayEnd = startOfDay(addDays(day, 1), timeZone).getTime();
  return item.start.getTime() < dayEnd && item.end.getTime() > dayStart;
}

/** All-day items first, then by start time, then by end time. Stable for equal keys. */
export function compareAgenda(a: TimedItem, b: TimedItem): number {
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
  return a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime();
}

/** Splits a duration in minutes into the largest sensible unit for "in …" labels. */
export function humanizeMinutes(minutes: number): { unit: 'minutes' | 'hours' | 'days'; value: number } {
  if (minutes < 0) throw new Error('minutes must be ≥ 0');
  if (minutes < 60) return { unit: 'minutes', value: minutes };
  if (minutes < 48 * 60) return { unit: 'hours', value: Math.round(minutes / 60) };
  return { unit: 'days', value: Math.round(minutes / (24 * 60)) };
}

export { parseDayKey };
