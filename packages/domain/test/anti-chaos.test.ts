import { describe, expect, it } from 'vitest';

import { computeLeavePlan, leaveState, reminderStages, showLeaveHero, validateDraft, type EventDraft } from '../src';

const start = new Date('2026-11-09T18:00:00Z'); // 19:00 Berlin
const plan = computeLeavePlan({ start, travelMinutes: 22, bufferMinutes: 8, prepMinutes: 45, arrivalMarginMinutes: 0 });
const t = (iso: string) => new Date(`2026-11-09T${iso}:00Z`);

describe('computeLeavePlan', () => {
  it('plans backwards from the start', () => {
    expect(plan.leaveAt.toISOString()).toBe('2026-11-09T17:30:00.000Z'); // 18:30 Berlin
    expect(plan.prepStart.toISOString()).toBe('2026-11-09T16:45:00.000Z');
    expect(plan.arriveBy.toISOString()).toBe('2026-11-09T18:00:00.000Z');
  });

  it('subtracts the arrival margin (e.g. doctor: 10 min early)', () => {
    const p = computeLeavePlan({
      start,
      travelMinutes: 20,
      bufferMinutes: 0,
      prepMinutes: 0,
      arrivalMarginMinutes: 10,
    });
    expect(p.leaveAt.toISOString()).toBe('2026-11-09T17:30:00.000Z');
  });

  it('rejects negative or fractional minutes', () => {
    expect(() =>
      computeLeavePlan({ start, travelMinutes: -1, bufferMinutes: 0, prepMinutes: 0, arrivalMarginMinutes: 0 }),
    ).toThrow();
    expect(() =>
      computeLeavePlan({ start, travelMinutes: 1.5, bufferMinutes: 0, prepMinutes: 0, arrivalMarginMinutes: 0 }),
    ).toThrow();
  });
});

describe('reminderStages', () => {
  it('uses more stages with higher intensity', () => {
    const kinds = (i: 'gentle' | 'normal' | 'firm') => reminderStages(plan, i, t('12:00'), 45).map((s) => s.kind);
    expect(kinds('gentle')).toEqual(['get-ready', 'leave-now']);
    expect(kinds('normal')).toEqual(['get-ready', 'leave-soon', 'leave-now']);
    expect(kinds('firm')).toEqual(['get-ready', 'leave-soon', 'leave-now', 'check-in']);
  });

  it('places stages relative to the leave time', () => {
    const [ready, soon, now] = reminderStages(plan, 'normal', t('12:00'), 45);
    expect(ready?.at.toISOString()).toBe('2026-11-09T16:45:00.000Z');
    expect(soon?.at.toISOString()).toBe('2026-11-09T17:20:00.000Z');
    expect(now?.at.toISOString()).toBe('2026-11-09T17:30:00.000Z');
  });

  it('drops past stages and "get ready" without preparation time', () => {
    expect(reminderStages(plan, 'normal', t('17:25'), 45).map((s) => s.kind)).toEqual(['leave-now']);
    expect(reminderStages(plan, 'normal', t('12:00'), 0).map((s) => s.kind)).toEqual(['leave-soon', 'leave-now']);
  });

  it('skips "leave soon" when preparation is that short anyway', () => {
    const p = computeLeavePlan({ start, travelMinutes: 10, bufferMinutes: 0, prepMinutes: 5, arrivalMarginMinutes: 0 });
    expect(reminderStages(p, 'normal', t('12:00'), 5).map((s) => s.kind)).toEqual(['get-ready', 'leave-now']);
  });
});

describe('leaveState & hero', () => {
  it('walks through the states', () => {
    expect(leaveState(plan, start, t('12:00'))).toEqual({ kind: 'relaxed', minutesUntilPrep: 285 });
    expect(leaveState(plan, start, t('17:00'))).toEqual({ kind: 'get-ready', minutesUntilLeave: 30 });
    expect(leaveState(plan, start, t('17:30'))).toEqual({ kind: 'leave-now' });
    expect(leaveState(plan, start, t('17:42'))).toEqual({ kind: 'late', minutesLate: 12 });
    expect(leaveState(plan, start, t('18:00'))).toEqual({ kind: 'underway' });
  });

  it('shows the big card only within 3 hours of leaving and before the start', () => {
    expect(showLeaveHero(plan, start, t('14:29'))).toBe(false);
    expect(showLeaveHero(plan, start, t('14:30'))).toBe(true);
    expect(showLeaveHero(plan, start, t('18:00'))).toBe(false);
  });
});

describe('validateDraft', () => {
  const base: EventDraft = {
    title: 'Zahnarzt',
    category: 'health',
    day: '2026-11-10',
    allDay: false,
    startMinute: 8 * 60 + 30,
    endMinute: 9 * 60 + 15,
    days: 1,
    location: '',
    prepMinutes: 15,
    arrivalMarginMinutes: 10,
  };

  it('accepts a normal appointment', () => {
    expect(validateDraft(base)).toEqual({});
  });

  it('reports each problem with a code', () => {
    expect(validateDraft({ ...base, title: '  ' })).toEqual({ title: 'required' });
    expect(validateDraft({ ...base, title: 'x'.repeat(121) })).toEqual({ title: 'too-long' });
    expect(validateDraft({ ...base, endMinute: base.startMinute })).toEqual({ time: 'end-before-start' });
    expect(validateDraft({ ...base, travel: { mode: 'bike', minutes: 601 } })).toEqual({ travel: 'out-of-range' });
    expect(validateDraft({ ...base, recurrence: { freq: 'weekly', interval: 1, byWeekday: [] } })).toEqual({
      recurrence: 'weekday-required',
    });
    expect(validateDraft({ ...base, recurrence: { freq: 'daily', interval: 1, until: '2026-11-01' } })).toEqual({
      recurrence: 'until-before-start',
    });
  });

  it('ignores times for all-day items but checks their length', () => {
    expect(validateDraft({ ...base, allDay: true, endMinute: 0 })).toEqual({});
    expect(validateDraft({ ...base, allDay: true, days: 0 })).toEqual({ days: 'out-of-range' });
  });
});
