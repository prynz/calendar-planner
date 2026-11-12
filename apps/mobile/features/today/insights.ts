import { agendaBetween, agendaForDay, type AgendaItem } from '@nowish/demo';
import {
  addDays,
  dayKeyOf,
  findConflicts,
  freeGaps,
  invitationOf,
  punctuality,
  rsvpState,
  weekdayOf,
  zonedWallTimeToInstant,
  type CalendarEvent,
  type Conflict,
  type DayKey,
  type EventCollab,
  type FreeGap,
  type Household,
  type Journey,
  type PlannedItem,
} from '@nowish/domain';

import type { WeekTile } from '@/providers/settings';

import { leavePlanFor, VIEWER_ID } from '../agenda/presenters';

/** Planning window for free time: people rarely want 06:00 or 23:00 suggested. */
const DAY_FROM_HOUR = 7;
const DAY_TO_HOUR = 22;

export const itemKey = (i: Pick<AgendaItem, 'event' | 'occurrenceKey'>) => `${i.event.id}@${i.occurrenceKey}`;

export function plannedItems(items: readonly AgendaItem[], bufferMinutes: number): PlannedItem[] {
  return items.map((i) => {
    const plan = leavePlanFor(i.event, i.start, bufferMinutes);
    return {
      key: itemKey(i),
      start: i.start,
      end: i.end,
      allDay: i.allDay,
      bufferMinutes: plan ? bufferMinutes : 0,
      ...(plan ? { leaveAt: plan.leaveAt } : {}),
    };
  });
}

export interface DayInsights {
  items: AgendaItem[];
  conflicts: Conflict[];
  gaps: FreeGap[];
  /** Keys of items that are the late half of a conflict. */
  tight: Set<string>;
}

/** Everything the helper knows about one day. For today, free time starts now. */
export function dayInsights(
  events: readonly CalendarEvent[],
  day: DayKey,
  timeZone: string,
  now: Date,
  bufferMinutes: number,
): DayInsights {
  const items = agendaForDay(events, day, timeZone);
  const planned = plannedItems(items, bufferMinutes);
  // Past conflicts are history, not something to fix.
  const conflicts = findConflicts(planned).filter((c) => {
    const second = planned.find((p) => p.key === c.second);
    return second ? second.end.getTime() > now.getTime() : false;
  });
  const windowStart = new Date(
    Math.max(zonedWallTimeToInstant(day, DAY_FROM_HOUR, 0, timeZone).getTime(), now.getTime()),
  );
  const windowEnd = zonedWallTimeToInstant(day, DAY_TO_HOUR, 0, timeZone);
  const gaps = windowStart < windowEnd ? freeGaps(planned, windowStart, windowEnd, 60) : [];
  return { items, conflicts, gaps, tight: new Set(conflicts.map((c) => c.second)) };
}

export const mondayOf = (day: DayKey): DayKey => addDays(day, -weekdayOf(day));

export interface WeekData {
  events: readonly CalendarEvent[];
  collabs: readonly EventCollab[];
  journeys: readonly Journey[];
  household: Household | null;
}

/** Values for the "This week" tiles (null = no data, shown as "–"). */
export function weekTileValues(
  data: WeekData,
  today: DayKey,
  timeZone: string,
  now: Date,
  weekdayShort: (day: DayKey) => string,
): Record<WeekTile, string | null> {
  const from = mondayOf(today);
  const to = addDays(from, 7);
  const items = agendaBetween(data.events, from, to, timeZone);

  let freeEvenings = 0;
  let busiest: { day: DayKey; count: number } | null = null;
  for (let d = from; d < to; d = addDays(d, 1)) {
    const evStart = zonedWallTimeToInstant(d, 18, 0, timeZone).getTime();
    const evEnd = zonedWallTimeToInstant(d, DAY_TO_HOUR, 0, timeZone).getTime();
    const dayItems = items.filter((i) => !i.allDay && dayKeyOf(i.start, timeZone) === d);
    if (d >= today && !items.some((i) => !i.allDay && i.start.getTime() < evEnd && i.end.getTime() > evStart)) {
      freeEvenings += 1;
    }
    if (dayItems.length > 0 && (!busiest || dayItems.length > busiest.count))
      busiest = { day: d, count: dayItems.length };
  }

  const report = punctuality(data.journeys, from, to, timeZone);
  const rides = (data.household?.rides ?? []).filter(
    (r) => r.driverId === VIEWER_ID && r.occurrenceKey >= from && r.occurrenceKey < to,
  ).length;
  const open = data.collabs.filter((c) => {
    const inv = invitationOf(c, VIEWER_ID);
    return inv ? rsvpState(inv, c.maybeDeadline, now) === 'pending' : false;
  }).length;

  return {
    events: String(items.length),
    free: String(freeEvenings),
    punctual: report.total > 0 ? `${Math.round((report.onTime / report.total) * 100)} %` : null,
    rides: `${rides}×`,
    open: String(open),
    busiest: busiest ? weekdayShort(busiest.day) : null,
  };
}
