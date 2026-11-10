import { agendaBetween, personName, type AgendaItem } from '@nowish/demo';
import {
  addDays,
  computeLeavePlan,
  dayKeyOf,
  displayLocation,
  displayTitle,
  eventStatus,
  HERO_WINDOW_MIN,
  humanizeMinutes,
  leaveState,
  noonOf,
  parseDayKey,
  showLeaveHero,
  weekdayOf,
  type CalendarEvent,
  type DayKey,
  type LeavePlan,
} from '@nowish/domain';
import { formatDayNumber, formatLongDate, formatTime, formatWeekday, type Locale, type Translate } from '@nowish/i18n';
import {
  categoryColors,
  type DateStripDay,
  type EventCardProps,
  type LeaveHeroProps,
  type MonthCell,
} from '@nowish/ui';

/** Pure view-model mapping: stored events → UI component props. Unit-tested without React. */

export const VIEWER_ID = 'chris';

export function duration(minutes: number, t: Translate): string {
  const { unit, value } = humanizeMinutes(Math.max(0, minutes));
  return t(`duration.${unit}`, { n: value });
}

export function statusLabel(item: AgendaItem, now: Date, t: Translate): string {
  const status = eventStatus(item, now);
  switch (status.kind) {
    case 'all-day':
      return t('event.status.allDay');
    case 'running':
      return t('event.status.running');
    case 'done':
      return t('event.status.done');
    case 'upcoming':
      return t('event.status.in', { duration: duration(status.minutesUntil, t) });
  }
}

export function timeLabel(item: AgendaItem, locale: Locale, t: Translate): string {
  if (item.allDay) return t('event.time.allDay');
  const tz = item.event.timeZone;
  return t('event.time.range', { start: formatTime(item.start, locale, tz), end: formatTime(item.end, locale, tz) });
}

/** Leave plan for one occurrence – only when a travel time is set (no travel, no leave time). */
export function leavePlanFor(event: CalendarEvent, start: Date, bufferMinutes: number): LeavePlan | null {
  if (!event.travel || event.allDay) return null;
  return computeLeavePlan({
    start,
    travelMinutes: event.travel.minutes,
    bufferMinutes,
    prepMinutes: event.prepMinutes,
    arrivalMarginMinutes: event.arrivalMarginMinutes,
  });
}

export function eventCardProps(
  item: AgendaItem,
  now: Date,
  locale: Locale,
  t: Translate,
  bufferMinutes: number,
): Omit<EventCardProps, 'onPress'> {
  const e = item.event;
  const others = e.participantIds.filter((id) => id !== VIEWER_ID).map(personName);
  const location = displayLocation(e, locale);
  const subtitleParts = [
    location || undefined,
    e.hostId && e.hostId !== VIEWER_ID ? t('event.hostedBy', { host: personName(e.hostId) }) : undefined,
  ].filter((x): x is string => typeof x === 'string');
  const plan = leavePlanFor(e, item.start, bufferMinutes);
  const upcoming = item.end.getTime() > now.getTime();
  return {
    title: displayTitle(e, locale),
    timeLabel: timeLabel(item, locale, t),
    category: e.category,
    statusLabel: statusLabel(item, now, t),
    testID: `event-${e.id}`,
    openHint: t('event.openHint'),
    ...(plan && upcoming
      ? { leaveLabel: t('leave.compact', { time: formatTime(plan.leaveAt, locale, e.timeZone) }) }
      : {}),
    ...(subtitleParts.length > 0 ? { subtitle: subtitleParts.join(' · ') } : {}),
    ...(others.length > 0
      ? {
          people: {
            names: others,
            accessibilityLabel: t('event.people', { count: others.length, names: others.join(', ') }),
          },
        }
      : {}),
  };
}

export interface HeroModel extends Omit<LeaveHeroProps, 'onPress' | 'openHint'> {
  eventId: string;
}

/** The next occurrence whose leave time is within the hero window (design-system.md §12), if any. */
export function leaveHero(
  events: readonly CalendarEvent[],
  now: Date,
  locale: Locale,
  t: Translate,
  bufferMinutes: number,
  timeZone: string,
): HeroModel | null {
  const today = dayKeyOf(now, timeZone);
  for (const item of agendaBetween(events, today, addDays(today, 2), timeZone)) {
    const plan = leavePlanFor(item.event, item.start, bufferMinutes);
    if (!plan || !showLeaveHero(plan, item.start, now)) continue;
    const e = item.event;
    const tz = e.timeZone;
    const state = leaveState(plan, item.start, now);
    const status =
      state.kind === 'relaxed'
        ? t('leave.state.relaxed', { duration: duration(state.minutesUntilPrep, t) })
        : state.kind === 'get-ready'
          ? t('leave.state.getReady', { duration: duration(state.minutesUntilLeave, t) })
          : state.kind === 'late'
            ? t('leave.state.late', { minutes: state.minutesLate })
            : t('leave.state.leaveNow');
    const windowStart = plan.leaveAt.getTime() - HERO_WINDOW_MIN * 60_000;
    const travel = e.travel;
    return {
      eventId: e.id,
      headline: t('leave.hero.big', { time: formatTime(plan.leaveAt, locale, tz) }),
      label: t('leave.hero.label', { title: displayTitle(e, locale), start: formatTime(item.start, locale, tz) }),
      breakdown: travel
        ? t('leave.hero.breakdown', {
            travel: travel.minutes,
            mode: t(`leave.mode.${travel.mode}`),
            buffer: bufferMinutes,
          })
        : '',
      status,
      progress: (now.getTime() - windowStart) / (plan.leaveAt.getTime() - windowStart),
      testID: 'leave-hero',
    };
  }
  return null;
}

/** Day pills from yesterday to two weeks ahead. */
export function dateStripDays(
  events: readonly CalendarEvent[],
  today: DayKey,
  timeZone: string,
  locale: Locale,
  t: Translate,
  from = -1,
  to = 20,
): DateStripDay[] {
  const busy = new Set(
    agendaBetween(events, addDays(today, from), addDays(today, to + 1), timeZone).flatMap((i) =>
      daysCovered(i, timeZone),
    ),
  );
  const days: DateStripDay[] = [];
  for (let offset = from; offset <= to; offset++) {
    const key = addDays(today, offset);
    const noon = noonOf(key, timeZone);
    const hasEvents = busy.has(key);
    days.push({
      key,
      dayNumber: formatDayNumber(noon, locale, timeZone),
      weekday: formatWeekday(noon, locale, 'short', timeZone),
      hasEvents,
      accessibilityLabel: t('today.dayA11y', {
        date: formatLongDate(noon, locale, timeZone),
        isToday: key === today,
        hasEvents,
      }),
    });
  }
  return days;
}

/** Local days an occurrence touches (multi-day items count on each day). */
export function daysCovered(item: AgendaItem, timeZone: string): DayKey[] {
  const first = dayKeyOf(item.start, timeZone);
  const last = dayKeyOf(new Date(item.end.getTime() - 1), timeZone);
  const out: DayKey[] = [];
  for (let d = first; d <= last && out.length < 62; d = addDays(d, 1)) out.push(d);
  return out;
}

export function dayHeading(
  day: DayKey,
  today: DayKey,
  timeZone: string,
  locale: Locale,
  t: Translate,
): { eyebrow: string; title: string } {
  const noon = noonOf(day, timeZone);
  return {
    eyebrow: t('today.eyebrow', { date: formatLongDate(noon, locale, timeZone) }),
    title: t('today.title', { isToday: day === today, weekday: formatWeekday(noon, locale, 'long', timeZone) }),
  };
}

/** First day of the month containing `day`. */
export function monthStart(day: DayKey): DayKey {
  const { year, month } = parseDayKey(day);
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export function addMonths(day: DayKey, n: number): DayKey {
  const { year, month } = parseDayKey(monthStart(day));
  const total = year * 12 + (month - 1) + n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}-01`;
}

/** 6 × 7 grid (Monday first) for the month of `anchor`, with category dots per day. */
export function monthRows(
  anchor: DayKey,
  today: DayKey,
  events: readonly CalendarEvent[],
  timeZone: string,
  locale: Locale,
  t: Translate,
): MonthCell[][] {
  const first = monthStart(anchor);
  const gridStart = addDays(first, -weekdayOf(first));
  const gridEnd = addDays(gridStart, 42);
  const dotsByDay = new Map<DayKey, string[]>();
  for (const item of agendaBetween(events, gridStart, gridEnd, timeZone)) {
    for (const d of daysCovered(item, timeZone)) {
      const list = dotsByDay.get(d) ?? [];
      list.push(categoryColors[item.event.category]);
      dotsByDay.set(d, list);
    }
  }
  const { month } = parseDayKey(first);
  const rows: MonthCell[][] = [];
  for (let r = 0; r < 6; r++) {
    const row: MonthCell[] = [];
    for (let c = 0; c < 7; c++) {
      const key = addDays(gridStart, r * 7 + c);
      const noon = noonOf(key, timeZone);
      const dots = dotsByDay.get(key) ?? [];
      row.push({
        key,
        dayNumber: formatDayNumber(noon, locale, timeZone),
        inMonth: parseDayKey(key).month === month,
        isToday: key === today,
        dots,
        accessibilityLabel: `${t('today.dayA11y', { date: formatLongDate(noon, locale, timeZone), isToday: key === today, hasEvents: dots.length > 0 })}${dots.length > 0 ? `, ${t('today.count', { count: dots.length })}` : ''}`,
      });
    }
    rows.push(row);
  }
  return rows;
}

/** Short weekday names, Monday first. */
export function weekdayLabels(locale: Locale, timeZone: string): string[] {
  const monday = '2026-11-09';
  return Array.from({ length: 7 }, (_, i) =>
    formatWeekday(noonOf(addDays(monday, i), timeZone), locale, 'short', timeZone),
  );
}

/** Agenda grouped by day for list/week views; days without items are kept only when `includeEmpty`. */
export function groupByDay(
  items: readonly AgendaItem[],
  from: DayKey,
  toExclusive: DayKey,
  timeZone: string,
  includeEmpty: boolean,
): { day: DayKey; items: AgendaItem[] }[] {
  const groups: { day: DayKey; items: AgendaItem[] }[] = [];
  for (let d = from; d < toExclusive; d = addDays(d, 1)) {
    const dayItems = items.filter((i) => daysCovered(i, timeZone).includes(d));
    if (dayItems.length > 0 || includeEmpty) groups.push({ day: d, items: dayItems });
  }
  return groups;
}
