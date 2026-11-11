/**
 * Anti-chaos engine – backward planning from the appointment (docs/product/features/anti-chaos-engine.md §1–2).
 *   arriveBy  = start − arrivalMargin
 *   leaveAt   = arriveBy − travel − dawdleBuffer
 *   prepStart = leaveAt − prep
 */

const MINUTE = 60_000;

export const TRAVEL_MODES = ['walk', 'bike', 'transit', 'car'] as const;
export type TravelMode = (typeof TRAVEL_MODES)[number];

export const REMINDER_INTENSITIES = ['gentle', 'normal', 'firm'] as const;
export type ReminderIntensity = (typeof REMINDER_INTENSITIES)[number];

/** Wording of reminders (anti-chaos-engine.md §2) – independent of how many stages are sent. */
export const REMINDER_TONES = ['soft', 'casual', 'firm'] as const;
export type ReminderTone = (typeof REMINDER_TONES)[number];

export interface LeavePlanInput {
  start: Date;
  travelMinutes: number;
  bufferMinutes: number;
  prepMinutes: number;
  arrivalMarginMinutes: number;
}

export interface LeavePlan {
  arriveBy: Date;
  leaveAt: Date;
  prepStart: Date;
}

const minutes = (n: number, name: string) => {
  if (!Number.isInteger(n) || n < 0 || n > 24 * 60) throw new Error(`${name} must be 0–1440 whole minutes, got ${n}`);
  return n * MINUTE;
};

export function computeLeavePlan(i: LeavePlanInput): LeavePlan {
  const arriveBy = i.start.getTime() - minutes(i.arrivalMarginMinutes, 'arrivalMarginMinutes');
  const leaveAt = arriveBy - minutes(i.travelMinutes, 'travelMinutes') - minutes(i.bufferMinutes, 'bufferMinutes');
  const prepStart = leaveAt - minutes(i.prepMinutes, 'prepMinutes');
  return { arriveBy: new Date(arriveBy), leaveAt: new Date(leaveAt), prepStart: new Date(prepStart) };
}

export const REMINDER_STAGES = ['get-ready', 'leave-soon', 'leave-now', 'check-in'] as const;
export type ReminderStageKind = (typeof REMINDER_STAGES)[number];

export interface ReminderStage {
  kind: ReminderStageKind;
  at: Date;
}

/** Which stages each intensity uses (anti-chaos-engine.md §2: tone and intensity are user settings). */
export const STAGES_BY_INTENSITY: Record<ReminderIntensity, readonly ReminderStageKind[]> = {
  gentle: ['get-ready', 'leave-now'],
  normal: ['get-ready', 'leave-soon', 'leave-now'],
  firm: ['get-ready', 'leave-soon', 'leave-now', 'check-in'],
};

const LEAVE_SOON_LEAD_MIN = 10;
const CHECK_IN_DELAY_MIN = 5;

/** Reminder times for a plan; stages already in the past (relative to `now`) are dropped. */
export function reminderStages(
  plan: LeavePlan,
  intensity: ReminderIntensity,
  now: Date,
  prepMinutes: number,
): ReminderStage[] {
  const at: Record<ReminderStageKind, number> = {
    'get-ready': plan.prepStart.getTime(),
    'leave-soon': plan.leaveAt.getTime() - LEAVE_SOON_LEAD_MIN * MINUTE,
    'leave-now': plan.leaveAt.getTime(),
    'check-in': plan.leaveAt.getTime() + CHECK_IN_DELAY_MIN * MINUTE,
  };
  return STAGES_BY_INTENSITY[intensity]
    .filter((k) => !(k === 'get-ready' && prepMinutes === 0)) // no "get ready" without preparation time
    .filter((k) => !(k === 'leave-soon' && prepMinutes > 0 && prepMinutes <= LEAVE_SOON_LEAD_MIN)) // would collide
    .map((kind) => ({ kind, at: new Date(at[kind]) }))
    .filter((s) => s.at.getTime() > now.getTime());
}

export type LeaveState =
  | { kind: 'relaxed'; minutesUntilPrep: number }
  | { kind: 'get-ready'; minutesUntilLeave: number }
  | { kind: 'leave-now' }
  | { kind: 'late'; minutesLate: number }
  | { kind: 'underway' };

/**
 * Where the user stands right now. `late` = past leave time (no "on my way" yet) but before the
 * appointment started; `underway` once the appointment started (we never nag after that).
 */
export function leaveState(plan: LeavePlan, start: Date, now: Date): LeaveState {
  const t = now.getTime();
  const toMin = (ms: number) => Math.ceil(ms / MINUTE);
  if (t >= start.getTime()) return { kind: 'underway' };
  if (t >= plan.leaveAt.getTime() + MINUTE)
    return { kind: 'late', minutesLate: Math.floor((t - plan.leaveAt.getTime()) / MINUTE) };
  if (t >= plan.leaveAt.getTime()) return { kind: 'leave-now' };
  if (t >= plan.prepStart.getTime()) return { kind: 'get-ready', minutesUntilLeave: toMin(plan.leaveAt.getTime() - t) };
  return { kind: 'relaxed', minutesUntilPrep: toMin(plan.prepStart.getTime() - t) };
}

/** Design decision (design-system.md §12): the big leave-time card only within 3 h of leaving. */
export const HERO_WINDOW_MIN = 180;

export function showLeaveHero(plan: LeavePlan, start: Date, now: Date): boolean {
  const t = now.getTime();
  return t < start.getTime() && plan.leaveAt.getTime() - t <= HERO_WINDOW_MIN * MINUTE;
}
