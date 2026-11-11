import type { TravelMode } from './anti-chaos';
import type { EventCategory, EventCover, EventDraft } from './event';
import type { Recurrence } from './recurrence';
import { addDays, dayKeyOf, wallParts, zonedWallTimeToInstant, type DayKey } from './time';

export type LocalizedText = { de: string; en: string };

/**
 * One calendar entry as stored on the device (ADR 0010) – personal appointment or social event in one
 * shape (ADR 0006). Field names follow docs/architecture/data-model.md so a server can take over later.
 */
export interface CalendarEvent {
  id: string;
  kind: 'appointment' | 'social';
  title: string;
  /** Demo content carries both languages; user content has only `title`. */
  titleI18n?: LocalizedText;
  location: string;
  locationI18n?: LocalizedText;
  category: EventCategory;
  start: Date;
  end: Date;
  allDay: boolean;
  timeZone: string;
  recurrence?: Recurrence;
  travel?: { mode: TravelMode; minutes: number };
  prepMinutes: number;
  arrivalMarginMinutes: number;
  /** Absent = category pastel. */
  cover?: EventCover;
  hostId?: string;
  participantIds: readonly string[];
  /** Part of the example world (shown with a "Demo" label). */
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Wall-clock draft → instants in `timeZone` (DST-safe). */
export function draftTimes(d: EventDraft, timeZone: string): { start: Date; end: Date } {
  if (d.allDay) {
    return {
      start: zonedWallTimeToInstant(d.day, 0, 0, timeZone),
      end: zonedWallTimeToInstant(addDays(d.day, d.days), 0, 0, timeZone),
    };
  }
  const endDay = d.endMinute === 24 * 60 ? addDays(d.day, 1) : d.day;
  const endMinute = d.endMinute % (24 * 60);
  return {
    start: zonedWallTimeToInstant(d.day, Math.floor(d.startMinute / 60), d.startMinute % 60, timeZone),
    end: zonedWallTimeToInstant(endDay, Math.floor(endMinute / 60), endMinute % 60, timeZone),
  };
}

/** Editor draft for an existing event (titles in the given locale for demo content). */
export function eventToDraft(e: CalendarEvent, locale: 'de' | 'en'): EventDraft {
  const day: DayKey = dayKeyOf(e.start, e.timeZone);
  const s = wallParts(e.start, e.timeZone);
  const durationMin = Math.round((e.end.getTime() - e.start.getTime()) / 60_000);
  const startMinute = s.hour * 60 + s.minute;
  return {
    title: e.titleI18n?.[locale] ?? e.title,
    category: e.category,
    day,
    allDay: e.allDay,
    startMinute: e.allDay ? 9 * 60 : startMinute,
    endMinute: e.allDay ? 10 * 60 : Math.min(startMinute + durationMin, 24 * 60),
    days: e.allDay ? Math.max(1, Math.round(durationMin / (24 * 60))) : 1,
    location: e.locationI18n?.[locale] ?? e.location,
    prepMinutes: e.prepMinutes,
    arrivalMarginMinutes: e.arrivalMarginMinutes,
    ...(e.recurrence ? { recurrence: e.recurrence } : {}),
    ...(e.travel ? { travel: e.travel } : {}),
    ...(e.cover ? { cover: e.cover } : {}),
  };
}

/**
 * Applies a validated draft. Editing localized demo text turns it into plain user text
 * (the edited language wins), so nothing silently reverts when switching languages.
 */
export function applyDraft(
  base: Omit<
    CalendarEvent,
    | 'title'
    | 'location'
    | 'category'
    | 'start'
    | 'end'
    | 'allDay'
    | 'prepMinutes'
    | 'arrivalMarginMinutes'
    | 'updatedAt'
  >,
  d: EventDraft,
  now: Date,
): CalendarEvent {
  const { start, end } = draftTimes(d, base.timeZone);
  const { titleI18n: _t, locationI18n: _l, recurrence: _r, travel: _tr, cover: _c, ...rest } = base;
  return {
    ...rest,
    title: d.title.trim(),
    location: d.location.trim(),
    category: d.category,
    start,
    end,
    allDay: d.allDay,
    prepMinutes: d.prepMinutes,
    arrivalMarginMinutes: d.arrivalMarginMinutes,
    ...(d.recurrence ? { recurrence: d.recurrence } : {}),
    ...(d.travel ? { travel: d.travel } : {}),
    ...(d.cover && d.cover !== 'category' ? { cover: d.cover } : {}),
    updatedAt: now,
  };
}

export function displayTitle(e: CalendarEvent, locale: 'de' | 'en'): string {
  return e.titleI18n?.[locale] ?? e.title;
}

export function displayLocation(e: CalendarEvent, locale: 'de' | 'en'): string {
  return e.locationI18n?.[locale] ?? e.location;
}
