import { personName, type DemoEvent, type DemoWorld } from '@nowish/demo';
import { addDays, eventStatus, humanizeMinutes, noonOf, occursOnDay, type DayKey } from '@nowish/domain';
import { formatDayNumber, formatLongDate, formatTime, formatWeekday, type Locale, type Translate } from '@nowish/i18n';
import type { DateStripDay, EventCardProps } from '@nowish/ui';

/** Pure view-model mapping: demo data → UI component props. Unit-tested without React. */

export function statusLabel(event: DemoEvent, now: Date, t: Translate): string {
  const status = eventStatus(event, now);
  switch (status.kind) {
    case 'all-day':
      return t('event.status.allDay');
    case 'running':
      return t('event.status.running');
    case 'done':
      return t('event.status.done');
    case 'upcoming': {
      const { unit, value } = humanizeMinutes(status.minutesUntil);
      return t('event.status.in', { duration: t(`duration.${unit}`, { n: value }) });
    }
  }
}

export function timeLabel(event: DemoEvent, locale: Locale, t: Translate, timeZone: string): string {
  if (event.allDay) return t('event.time.allDay');
  return t('event.time.range', {
    start: formatTime(event.start, locale, timeZone),
    end: formatTime(event.end, locale, timeZone),
  });
}

export function eventCardProps(
  event: DemoEvent,
  world: DemoWorld,
  now: Date,
  locale: Locale,
  t: Translate,
): EventCardProps {
  const others = event.participantIds.filter((id) => id !== world.viewer.id).map((id) => personName(world, id));
  const subtitleParts = [
    event.location?.[locale],
    event.hostId && event.hostId !== world.viewer.id
      ? t('event.hostedBy', { host: personName(world, event.hostId) })
      : undefined,
  ].filter((x): x is string => typeof x === 'string');
  return {
    title: event.title[locale],
    timeLabel: timeLabel(event, locale, t, world.timeZone),
    category: event.category,
    statusLabel: statusLabel(event, now, t),
    testID: `event-${event.id}`,
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

/** Day pills from yesterday to two weeks ahead. */
export function dateStripDays(world: DemoWorld, locale: Locale, t: Translate, from = -1, to = 13): DateStripDay[] {
  const days: DateStripDay[] = [];
  for (let offset = from; offset <= to; offset++) {
    const key = addDays(world.today, offset);
    const noon = noonOf(key, world.timeZone);
    const hasEvents = world.events.some((e) => occursOnDay(e, key, world.timeZone));
    days.push({
      key,
      dayNumber: formatDayNumber(noon, locale, world.timeZone),
      weekday: formatWeekday(noon, locale, 'short', world.timeZone),
      hasEvents,
      accessibilityLabel: t('today.dayA11y', {
        date: formatLongDate(noon, locale, world.timeZone),
        isToday: key === world.today,
        hasEvents,
      }),
    });
  }
  return days;
}

export function dayHeading(
  world: DemoWorld,
  day: DayKey,
  locale: Locale,
  t: Translate,
): { eyebrow: string; title: string } {
  const noon = noonOf(day, world.timeZone);
  return {
    eyebrow: t('today.eyebrow', { date: formatLongDate(noon, locale, world.timeZone) }),
    title: t('today.title', {
      isToday: day === world.today,
      weekday: formatWeekday(noon, locale, 'long', world.timeZone),
    }),
  };
}
