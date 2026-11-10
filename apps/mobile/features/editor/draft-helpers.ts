import {
  computeLeavePlan,
  draftTimes,
  weekdayOf,
  type DayKey,
  type EventDraft,
  type Recurrence,
  type RecurrenceFrequency,
} from '@nowish/domain';

/** Defaults for a new plan on `day`: next full hour today, otherwise 09:00; one hour long. */
export function newDraft(day: DayKey, today: DayKey, nowMinuteOfDay: number): EventDraft {
  const start = day === today ? Math.min(23 * 60, (Math.floor(nowMinuteOfDay / 60) + 1) * 60) : 9 * 60;
  return {
    title: '',
    category: 'social',
    day,
    allDay: false,
    startMinute: start,
    endMinute: Math.min(start + 60, 24 * 60),
    days: 1,
    location: '',
    prepMinutes: 15,
    arrivalMarginMinutes: 0,
  };
}

/** Switching repeat type keeps sensible defaults (weekly → the plan's own weekday). */
export function withRepeat(d: EventDraft, freq: RecurrenceFrequency | 'none'): EventDraft {
  const { recurrence: _old, ...rest } = d;
  if (freq === 'none') return rest;
  const recurrence: Recurrence =
    freq === 'weekly' ? { freq, interval: 1, byWeekday: [weekdayOf(d.day)] } : { freq, interval: 1 };
  return { ...rest, recurrence };
}

/** Moving the start keeps the duration; end is capped at midnight. */
export function withStart(d: EventDraft, startMinute: number): EventDraft {
  const length = Math.max(15, d.endMinute - d.startMinute);
  return { ...d, startMinute, endMinute: Math.min(startMinute + length, 24 * 60) };
}

export const clampMinutes = (v: number, min = 0, max = 600) => Math.min(max, Math.max(min, v));

/** Live preview of the leave time while editing; null without travel or for all-day plans. */
export function previewLeaveAt(d: EventDraft, timeZone: string, bufferMinutes: number): Date | null {
  if (!d.travel || d.allDay || d.endMinute <= d.startMinute) return null;
  const { start } = draftTimes(d, timeZone);
  return computeLeavePlan({
    start,
    travelMinutes: d.travel.minutes,
    bufferMinutes,
    prepMinutes: d.prepMinutes,
    arrivalMarginMinutes: d.arrivalMarginMinutes,
  }).leaveAt;
}

/** Wall-clock helpers for the native pickers (they work with JS Dates in the device zone). */
export function minuteToDate(day: DayKey, minute: number): Date {
  const [y, m, dd] = day.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, dd, Math.floor(minute / 60), minute % 60);
}
export const dateToMinute = (d: Date) => d.getHours() * 60 + d.getMinutes();
export const dateToDay = (d: Date): DayKey =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
