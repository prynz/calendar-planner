import { agendaBetween } from '@nowish/demo';
import {
  addDays,
  dayKeyOf,
  displayTitle,
  reminderStages,
  type CalendarEvent,
  type ReminderIntensity,
  type ReminderStageKind,
} from '@nowish/domain';
import { formatTime, type Locale, type Translate } from '@nowish/i18n';

import { leavePlanFor } from '../agenda/presenters';

/** iOS keeps at most 64 pending local notifications; we stay below with headroom (anti-chaos-engine.md §2). */
export const MAX_SCHEDULED = 48;
export const HORIZON_DAYS = 7;

export interface PlannedReminder {
  /** Stable id: event, occurrence and stage – rescheduling the same plan is idempotent. */
  id: string;
  eventId: string;
  stage: ReminderStageKind;
  at: Date;
  title: string;
  body: string;
}

/** All upcoming leave reminders for the next week, soonest first, capped at MAX_SCHEDULED. */
export function planReminders(
  events: readonly CalendarEvent[],
  now: Date,
  timeZone: string,
  intensity: ReminderIntensity,
  bufferMinutes: number,
  locale: Locale,
  t: Translate,
): PlannedReminder[] {
  const today = dayKeyOf(now, timeZone);
  const out: PlannedReminder[] = [];
  for (const item of agendaBetween(events, today, addDays(today, HORIZON_DAYS), timeZone)) {
    const plan = leavePlanFor(item.event, item.start, bufferMinutes);
    if (!plan) continue;
    const e = item.event;
    const fmt = (d: Date) => formatTime(d, locale, e.timeZone);
    const values = {
      title: displayTitle(e, locale),
      start: fmt(item.start),
      leave: fmt(plan.leaveAt),
      arrive: fmt(plan.arriveBy),
    };
    for (const stage of reminderStages(plan, intensity, now, e.prepMinutes)) {
      out.push({
        id: `${e.id}:${item.occurrenceKey}:${stage.kind}`,
        eventId: e.id,
        stage: stage.kind,
        at: stage.at,
        title: t(`notify.${stage.kind}.title`),
        body: t(`notify.${stage.kind}.body`, values),
      });
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX_SCHEDULED);
}
