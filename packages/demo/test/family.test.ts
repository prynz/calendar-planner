import { describe, expect, it } from 'vitest';

import {
  acceptInvite,
  addDays,
  applyDueFamilyActions,
  applyDueGroupActions,
  attendanceSummary,
  dayKeyOf,
  familyWeek,
  householdMemberIds,
  requestRide,
  rideConflict,
  rideSlots,
  scheduleFamily,
  scheduleGroup,
  setDriver,
  zonedWallTimeToInstant,
} from '@nowish/domain';

import {
  agendaBetween,
  buildDemoEvents,
  buildDemoGroups,
  buildDemoHousehold,
  DEMO_TIME_ZONE as TZ,
  simulateGroupReply,
  simulateMeetingAnswers,
  simulateRideAnswer,
} from '../src';

const NOW = zonedWallTimeToInstant('2026-11-11', 9, 0, TZ); // Wednesday
const events = buildDemoEvents(NOW, TZ);
const today = dayKeyOf(NOW, TZ);
const week = agendaBetween(events, today, addDays(today, 7), TZ);

describe('demo family', () => {
  const h = buildDemoHousehold(events, NOW);

  it('has two adults and two child profiles without account data', () => {
    expect(householdMemberIds(h)).toEqual(['chris', 'sam', 'lena', 'paul']);
    expect(Object.keys(h.kids[0] ?? {}).sort()).toEqual(['color', 'emoji', 'id', 'name']);
  });

  it('shows ride gaps and a conflict: Chris is at the flat viewing during Paul’s doctor', () => {
    const slots = rideSlots(h, week);
    expect(slots.map((s) => s.item.event.id)).toEqual(['demo-swim', 'demo-paul-doctor']);
    expect(slots[0]?.legs['drop-off'].driverId).toBe('chris');
    const doctor = slots[1]!;
    expect(rideConflict(doctor, 'drop-off', 'chris', week)?.event.id).toBe('demo-flat');
    expect(rideConflict(doctor, 'drop-off', 'sam', week)).toBeUndefined();
  });

  it('Sam accepts a ride he is free for, Chris’s own time conflicts are respected', () => {
    const doctor = rideSlots(h, week)[1]!;
    let next = requestRide(h, 'chris', doctor.item.event.id, doctor.item.occurrenceKey, 'drop-off', 'sam');
    const actions = simulateRideAnswer(
      next,
      week,
      doctor.item.event.id,
      doctor.item.occurrenceKey,
      'drop-off',
      'sam',
      NOW,
    );
    expect(actions).toMatchObject([{ type: 'ride-answer', accept: true }]);
    next = applyDueFamilyActions(scheduleFamily(next, actions), new Date(NOW.getTime() + 10_000)).household;
    expect(rideSlots(next, week)[1]?.legs['drop-off'].driverId).toBe('sam');
    expect(() => setDriver(next, 'chris', 'x', today, 'pick-up', 'lena')).toThrow();
    expect(acceptInvite({ ...next, invitedIds: ['frank'] }, 'frank').adultIds).toContain('frank');
  });

  it('fills the family week', () => {
    const days = familyWeek(h, week, today, TZ);
    expect(days.reduce((n, d) => n + d.total, 0)).toBeGreaterThan(3);
    expect(days.find((d) => d.day === addDays(today, 1))?.byMember.lena).toBe(1);
  });
});

describe('demo groups', () => {
  const groups = buildDemoGroups(events, NOW);

  it('has the monthly regulars’ night on the first Friday and a weekly run', () => {
    expect(groups.map((g) => g.id)).toEqual(['demo-group-regulars', 'demo-group-run']);
    const st = events.find((e) => e.id === 'demo-stammtisch')!;
    expect(dayKeyOf(st.start, TZ)).toBe('2026-12-04');
    expect(attendanceSummary(groups[0]!, st.id, '2026-12-04')).toEqual({
      yes: ['tom', 'jonas'],
      no: ['alex'],
      open: ['chris'],
    });
  });

  it('members answer meetings and the chat by rule', () => {
    let g = groups[1]!;
    const run = events.find((e) => e.id === 'demo-run')!;
    const key = dayKeyOf(run.start, TZ);
    g = scheduleGroup(g, [...simulateMeetingAnswers(g, run.id, key, NOW), ...simulateGroupReply(g, NOW)]);
    expect(simulateGroupReply(g, NOW)).toEqual([]); // one queued reply at a time
    g = applyDueGroupActions(g, new Date(NOW.getTime() + 60_000)).group;
    expect(attendanceSummary(g, run.id, key).open).toEqual(['chris']);
    expect(g.messages.at(-1)).toMatchObject({ type: 'text' });
  });
});
