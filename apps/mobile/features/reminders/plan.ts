import { agendaBetween } from '@nowish/demo';
import {
  addDays,
  dayKeyOf,
  displayTitle,
  journeyId,
  reminderStages,
  type CalendarEvent,
  type DayKey,
  type Journey,
  type ReminderIntensity,
  type ReminderStageKind,
  type ReminderTone,
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
  occurrenceKey: DayKey;
  /** Needed by the "on my way" action to record the departure without opening the app. */
  plannedLeaveAt: Date;
  stage: ReminderStageKind;
  at: Date;
  title: string;
  body: string;
}

export interface ReminderPlanInput {
  events: readonly CalendarEvent[];
  journeys: readonly Journey[];
  now: Date;
  timeZone: string;
  intensity: ReminderIntensity;
  tone: ReminderTone;
  bufferMinutes: number;
  locale: Locale;
  t: Translate;
}

/**
 * All upcoming leave reminders for the next week, soonest first, capped at MAX_SCHEDULED. Once the viewer
 * tapped "on my way", that occurrence gets no further reminders; an announced delay drops the check-in.
 */
export function planReminders(i: ReminderPlanInput): PlannedReminder[] {
  const today = dayKeyOf(i.now, i.timeZone);
  const byId = new Map(i.journeys.map((j) => [j.id, j]));
  const out: PlannedReminder[] = [];
  for (const item of agendaBetween(i.events, today, addDays(today, HORIZON_DAYS), i.timeZone)) {
    const plan = leavePlanFor(item.event, item.start, i.bufferMinutes);
    if (!plan) continue;
    const journey = byId.get(journeyId(item.event.id, item.occurrenceKey));
    if (journey?.leftAt) continue;
    const e = item.event;
    const fmt = (d: Date) => formatTime(d, i.locale, e.timeZone);
    const values = {
      title: displayTitle(e, i.locale),
      start: fmt(item.start),
      leave: fmt(plan.leaveAt),
      arrive: fmt(plan.arriveBy),
    };
    for (const stage of reminderStages(plan, i.intensity, i.now, e.prepMinutes)) {
      if (stage.kind === 'check-in' && journey?.lateMinutes !== undefined) continue;
      out.push({
        id: `${e.id}:${item.occurrenceKey}:${stage.kind}`,
        eventId: e.id,
        occurrenceKey: item.occurrenceKey,
        plannedLeaveAt: plan.leaveAt,
        stage: stage.kind,
        at: stage.at,
        title: i.t(`notify.${i.tone}.${stage.kind}.title`),
        body: i.t(`notify.${i.tone}.${stage.kind}.body`, values),
      });
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, MAX_SCHEDULED);
}
