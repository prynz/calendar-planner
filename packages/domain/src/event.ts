import type { TravelMode } from './anti-chaos';
import { NTH_WEEKS, type Recurrence } from './recurrence';
import { parseDayKey, type DayKey } from './time';

/** Categories match the design-token pastel set (`@nowish/ui` tokens). */
export const EVENT_CATEGORIES = ['social', 'family', 'health', 'work', 'sport', 'celebration'] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/**
 * What the editor produces. Wall-clock based: the user picks a day and times in their zone.
 * Converted to instants by the repository (time.ts), so DST is handled in one place.
 */
export interface EventDraft {
  title: string;
  category: EventCategory;
  day: DayKey;
  allDay: boolean;
  /** Minutes after local midnight. */
  startMinute: number;
  endMinute: number;
  /** All-day only: number of days, ≥ 1. */
  days: number;
  location: string;
  recurrence?: Recurrence;
  travel?: { mode: TravelMode; minutes: number };
  prepMinutes: number;
  arrivalMarginMinutes: number;
}

export type DraftField = 'title' | 'time' | 'days' | 'location' | 'travel' | 'prep' | 'arrival' | 'recurrence';
/** Error codes are i18n keys suffixes (`editor.error.<code>`), never user-facing strings. */
export type DraftError =
  'required' | 'too-long' | 'end-before-start' | 'out-of-range' | 'weekday-required' | 'until-before-start';

export const LIMITS = { title: 120, location: 200, minutes: 600, days: 31, interval: 99, count: 999 } as const;

export function validateDraft(d: EventDraft): Partial<Record<DraftField, DraftError>> {
  const errors: Partial<Record<DraftField, DraftError>> = {};
  const title = d.title.trim();
  if (title.length === 0) errors.title = 'required';
  else if (title.length > LIMITS.title) errors.title = 'too-long';
  if (d.location.length > LIMITS.location) errors.location = 'too-long';
  parseDayKey(d.day); // throws on malformed input – the editor never produces it
  if (d.allDay) {
    if (!Number.isInteger(d.days) || d.days < 1 || d.days > LIMITS.days) errors.days = 'out-of-range';
  } else {
    const inDay = (m: number) => Number.isInteger(m) && m >= 0 && m <= 24 * 60;
    if (!inDay(d.startMinute) || !inDay(d.endMinute)) errors.time = 'out-of-range';
    else if (d.endMinute <= d.startMinute) errors.time = 'end-before-start';
  }
  const inMinutes = (m: number) => Number.isInteger(m) && m >= 0 && m <= LIMITS.minutes;
  if (d.travel && !inMinutes(d.travel.minutes)) errors.travel = 'out-of-range';
  if (!inMinutes(d.prepMinutes)) errors.prep = 'out-of-range';
  if (!inMinutes(d.arrivalMarginMinutes)) errors.arrival = 'out-of-range';
  const r = d.recurrence;
  if (r) {
    if (!Number.isInteger(r.interval) || r.interval < 1 || r.interval > LIMITS.interval)
      errors.recurrence = 'out-of-range';
    else if (r.count !== undefined && (!Number.isInteger(r.count) || r.count < 1 || r.count > LIMITS.count))
      errors.recurrence = 'out-of-range';
    else if (r.freq === 'weekly' && r.byWeekday !== undefined && r.byWeekday.length === 0)
      errors.recurrence = 'weekday-required';
    else if (r.byNthWeekday && (r.freq !== 'monthly' || !NTH_WEEKS.includes(r.byNthWeekday.nth)))
      errors.recurrence = 'out-of-range';
    else if (r.until !== undefined && r.until < d.day) errors.recurrence = 'until-before-start';
  }
  return errors;
}

export const isDraftValid = (d: EventDraft) => Object.keys(validateDraft(d)).length === 0;
