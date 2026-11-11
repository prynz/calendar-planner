import { describe, expect, it } from 'vitest';

import {
  acceptInvite,
  addChore,
  addKid,
  addShoppingItem,
  applyDueFamilyActions,
  assignMembers,
  choresFor,
  choreTurn,
  clearDoneShopping,
  FAMILY_LIMITS,
  FamilyError,
  familyWeek,
  forgetEvent,
  inviteAdult,
  newHousehold,
  openLegs,
  removeKid,
  requestRide,
  rideConflict,
  rideGapCount,
  rideSlots,
  scheduleFamily,
  setDriver,
  sortedShopping,
  toggleChoreDone,
  toggleShoppingItem,
  zonedWallTimeToInstant,
  type CalendarEvent,
  type FamilyOccurrence,
  type Household,
} from '../src';

const TZ = 'Europe/Berlin';
const NOW = zonedWallTimeToInstant('2026-11-11', 9, 0, TZ);
const at = (day: string, h: number, m = 0) => zonedWallTimeToInstant(day, h, m, TZ);

function event(id: string, over: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id,
    kind: 'appointment',
    title: id,
    location: 'Hallenbad',
    category: 'sport',
    start: at('2026-11-12', 16),
    end: at('2026-11-12', 17),
    allDay: false,
    timeZone: TZ,
    prepMinutes: 0,
    arrivalMarginMinutes: 0,
    participantIds: ['chris'],
    isDemo: false,
    createdAt: NOW,
    updatedAt: NOW,
    ...over,
  };
}
const occ = (e: CalendarEvent): FamilyOccurrence => ({
  event: e,
  occurrenceKey: '2026-11-12',
  start: e.start,
  end: e.end,
});

function family(): { h: Household; lena: string } {
  let h = newHousehold('home', 'Familie Berger', 'chris', NOW);
  h = acceptInvite(inviteAdult(h, 'chris', 'sam'), 'sam');
  const r = addKid(h, 'chris', { name: 'Lena', color: 'sport', emoji: '🦊' }, NOW);
  return { h: r.household, lena: r.id };
}

describe('household', () => {
  it('invites adults who join on accept, and caps members at the plan limit', () => {
    let h = newHousehold('home', 'Familie', 'chris', NOW);
    h = inviteAdult(h, 'chris', 'sam');
    expect(h.invitedIds).toEqual(['sam']);
    h = acceptInvite(h, 'sam');
    expect(h.adultIds).toEqual(['chris', 'sam']);
    for (let i = 0; i < FAMILY_LIMITS.members - 2; i++)
      h = addKid(h, 'chris', { name: `K${i}`, color: 'family' }, NOW).household;
    expect(() => addKid(h, 'chris', { name: 'Zu viel', color: 'family' }, NOW)).toThrow(new FamilyError('limit'));
  });

  it('stores child profiles without account data and only lets the admin manage them', () => {
    const { h, lena } = family();
    expect(h.kids[0]).toEqual({ id: lena, name: 'Lena', color: 'sport', emoji: '🦊' });
    expect(() => addKid(h, 'sam', { name: 'Paul', color: 'work' }, NOW)).toThrow(new FamilyError('not-admin'));
    expect(() => addKid(h, 'chris', { name: '  ', color: 'work' }, NOW)).toThrow(new FamilyError('invalid-input'));
  });

  it('removing a child also removes it from assignments and chore rotations', () => {
    const { h: base, lena } = family();
    let h = assignMembers(base, 'chris', 'swim', [lena]);
    h = addChore(h, 'chris', { title: 'Tisch decken', every: 'daily', rotation: [lena, 'chris'] }, '2026-11-11', NOW);
    h = removeKid(h, 'chris', lena);
    expect(h.assignments).toEqual({});
    expect(h.chores[0]?.rotation).toEqual(['chris']);
  });

  it('rejects assignments to people outside the household', () => {
    const { h } = family();
    expect(() => assignMembers(h, 'chris', 'e', ['olivia'])).toThrow(new FamilyError('not-member'));
  });
});

describe('rides', () => {
  it('needs drop-off and pick-up for a child appointment with a location', () => {
    const { h: base, lena } = family();
    const h = assignMembers(base, 'chris', 'swim', [lena]);
    const slots = rideSlots(h, [occ(event('swim')), occ(event('home', { location: '' })), occ(event('other'))]);
    expect(slots).toHaveLength(1);
    expect(openLegs(slots[0]!)).toEqual(['drop-off', 'pick-up']);
    expect(rideGapCount(slots)).toBe(2);
  });

  it('takes, requests and answers legs; only adults can drive', () => {
    const { h: base, lena } = family();
    let h = assignMembers(base, 'chris', 'swim', [lena]);
    h = setDriver(h, 'chris', 'swim', '2026-11-12', 'drop-off', 'chris');
    h = requestRide(h, 'chris', 'swim', '2026-11-12', 'pick-up', 'sam');
    expect(() => setDriver(h, 'chris', 'swim', '2026-11-12', 'pick-up', lena)).toThrow(new FamilyError('not-adult'));
    h = scheduleFamily(h, [
      {
        at: NOW,
        personId: 'sam',
        type: 'ride-answer',
        eventId: 'swim',
        occurrenceKey: '2026-11-12',
        leg: 'pick-up',
        accept: true,
      },
    ]);
    h = applyDueFamilyActions(h, NOW).household;
    const slot = rideSlots(h, [occ(event('swim'))])[0]!;
    expect(slot.legs['drop-off'].driverId).toBe('chris');
    expect(slot.legs['pick-up']).toMatchObject({ driverId: 'sam' });
    expect(slot.legs['pick-up'].requestedId).toBeUndefined();
    h = setDriver(h, 'chris', 'swim', '2026-11-12', 'drop-off', null);
    expect(h.rides).toHaveLength(1);
  });

  it('warns when the driver has an own appointment during the ride', () => {
    const { h: base, lena } = family();
    const h = assignMembers(base, 'chris', 'swim', [lena]);
    const swim = event('swim', { travel: { mode: 'car', minutes: 10 } });
    const slot = rideSlots(h, [occ(swim)])[0]!;
    const meeting = occ(event('call', { start: at('2026-11-12', 15, 30), end: at('2026-11-12', 15, 50) }));
    const later = occ(event('later', { start: at('2026-11-12', 17, 15), end: at('2026-11-12', 18) }));
    expect(rideConflict(slot, 'drop-off', 'chris', [meeting, later])?.event.id).toBe('call');
    expect(rideConflict(slot, 'pick-up', 'chris', [meeting, later])?.event.id).toBe('later');
    expect(rideConflict(slot, 'drop-off', 'sam', [meeting])).toBeUndefined();
  });

  it('forgets rides and assignments of a deleted event', () => {
    const { h: base, lena } = family();
    let h = assignMembers(base, 'chris', 'swim', [lena]);
    h = setDriver(h, 'chris', 'swim', '2026-11-12', 'drop-off', 'chris');
    h = forgetEvent(h, 'swim');
    expect(h.rides).toEqual([]);
    expect(h.assignments).toEqual({});
  });
});

describe('shopping list', () => {
  it('adds, ticks, unticks and clears items; open items first', () => {
    const { h: base } = family();
    let h = addShoppingItem(base, 'chris', 'Milch', '2 l', NOW);
    h = addShoppingItem(h, 'sam', 'Brot', '', new Date(NOW.getTime() + 1000));
    const milk = h.shopping[0]!.id;
    h = toggleShoppingItem(h, 'sam', milk, NOW);
    expect(sortedShopping(h).map((i) => i.title)).toEqual(['Brot', 'Milch']);
    expect(h.shopping[0]).toMatchObject({ doneBy: 'sam', note: '2 l' });
    h = toggleShoppingItem(h, 'chris', milk, NOW);
    expect(h.shopping[0]?.doneAt).toBeUndefined();
    h = clearDoneShopping(toggleShoppingItem(h, 'chris', milk, NOW), 'chris');
    expect(h.shopping.map((i) => i.title)).toEqual(['Brot']);
    expect(() => addShoppingItem(h, 'chris', ' ', '', NOW)).toThrow(new FamilyError('invalid-input'));
  });

  it('lets simulated adults add and tick items, ignoring outsiders', () => {
    const { h: base } = family();
    let h = scheduleFamily(base, [
      { at: NOW, personId: 'sam', type: 'shopping-add', title: { de: 'Äpfel', en: 'Apples' } },
      { at: NOW, personId: 'olivia', type: 'shopping-add', title: { de: 'X', en: 'X' } },
    ]);
    const r = applyDueFamilyActions(h, NOW);
    h = r.household;
    expect(r.applied).toBe(1);
    expect(h.shopping[0]).toMatchObject({ titleI18n: { de: 'Äpfel', en: 'Apples' }, addedBy: 'sam' });
  });
});

describe('chores', () => {
  it('rotates strictly through the members on due days', () => {
    const { h: base, lena } = family();
    const h = addChore(
      base,
      'chris',
      { title: 'Müll rausbringen', every: 'weekly', weekday: 3, rotation: ['chris', lena, 'sam'] },
      '2026-11-11', // Wednesday
      NOW,
    );
    const c = h.chores[0]!;
    expect(c.startDay).toBe('2026-11-12');
    expect(choreTurn(c, '2026-11-12')).toBe('chris');
    expect(choreTurn(c, '2026-11-13')).toBeUndefined();
    expect(choreTurn(c, '2026-11-19')).toBe(lena);
    expect(choreTurn(c, '2026-11-26')).toBe('sam');
    expect(choreTurn(c, '2026-12-03')).toBe('chris');
  });

  it('ticks the turn holder for the day and un-ticks again', () => {
    const { h: base, lena } = family();
    let h = addChore(
      base,
      'chris',
      { title: 'Tisch decken', every: 'daily', rotation: [lena, 'sam'] },
      '2026-11-11',
      NOW,
    );
    const id = h.chores[0]!.id;
    h = toggleChoreDone(h, 'chris', id, '2026-11-12');
    expect(choresFor(h, '2026-11-12')).toEqual([{ chore: h.chores[0], turn: 'sam', done: true }]);
    h = toggleChoreDone(h, 'chris', id, '2026-11-12');
    expect(h.chores[0]?.done).toEqual({});
    expect(() => addChore(h, 'chris', { title: 'x', every: 'weekly', rotation: ['chris'] }, '2026-11-11', NOW)).toThrow(
      new FamilyError('invalid-input'),
    );
  });
});

describe('family week', () => {
  it('counts appointments per day and member', () => {
    const { h: base, lena } = family();
    const h = assignMembers(base, 'chris', 'swim', [lena]);
    const week = familyWeek(
      h,
      [occ(event('swim')), occ(event('mine')), occ(event('foreign', { participantIds: ['olivia'] }))],
      '2026-11-11',
      TZ,
    );
    expect(week).toHaveLength(7);
    expect(week[1]).toEqual({ day: '2026-11-12', byMember: { [lena]: 1, chris: 1 }, total: 2 });
    expect(week[0]?.total).toBe(0);
  });
});
