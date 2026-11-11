import { describe, expect, it } from 'vitest';

import {
  addGroupMembers,
  addMeeting,
  applyDueGroupActions,
  attendanceSummary,
  createGroup,
  GroupError,
  leaveGroup,
  postGroupMessage,
  removeGroupMember,
  removeMeeting,
  renameGroup,
  scheduleGroup,
  setAttendance,
  setGroupAdmin,
  sortedGroupMessages,
} from '../src';

const NOW = new Date('2026-11-11T10:00:00Z');
const base = () => createGroup('g1', { name: 'Stammtisch', emoji: '🍻' }, 'chris', ['tom', 'mia', 'tom'], NOW);

describe('groups', () => {
  it('creates a group with the creator as admin and a system note', () => {
    const g = base();
    expect(g.memberIds).toEqual(['chris', 'tom', 'mia']);
    expect(g.adminIds).toEqual(['chris']);
    expect(g.messages[0]).toMatchObject({ type: 'system', note: { kind: 'created', personId: 'chris' } });
    expect(() => createGroup('g', { name: ' ', emoji: '🍻' }, 'chris', [], NOW)).toThrow(
      new GroupError('invalid-input'),
    );
  });

  it('only admins manage members; the last admin stays', () => {
    let g = base();
    expect(() => addGroupMembers(g, 'tom', ['alex'], NOW)).toThrow(new GroupError('not-admin'));
    g = addGroupMembers(g, 'chris', ['alex'], NOW);
    expect(g.memberIds).toContain('alex');
    g = removeGroupMember(g, 'chris', 'alex', NOW);
    expect(g.memberIds).not.toContain('alex');
    expect(() => setGroupAdmin(g, 'chris', 'chris', false)).toThrow(new GroupError('last-admin'));
    g = setGroupAdmin(g, 'chris', 'tom', true);
    expect(g.adminIds).toEqual(['chris', 'tom']);
    expect(renameGroup(g, 'tom', { name: 'Kneipe', emoji: '🍺' }).name).toBe('Kneipe');
  });

  it('hands admin over when the last admin leaves, and disappears when empty', () => {
    let g = createGroup('g', { name: 'Duo', emoji: '👯' }, 'chris', ['tom'], NOW);
    g = leaveGroup(g, 'chris', NOW)!;
    expect(g.adminIds).toEqual(['tom']);
    expect(leaveGroup(g, 'tom', NOW)).toBeNull();
  });

  it('keeps per-occurrence attendance for meetings', () => {
    let g = addMeeting(base(), 'chris', 'evt-1', NOW);
    g = setAttendance(g, 'chris', 'evt-1', '2026-12-04', 'yes');
    g = setAttendance(g, 'tom', 'evt-1', '2026-12-04', 'no');
    g = setAttendance(g, 'tom', 'evt-1', '2027-01-01', 'yes');
    expect(attendanceSummary(g, 'evt-1', '2026-12-04')).toEqual({ yes: ['chris'], no: ['tom'], open: ['mia'] });
    expect(attendanceSummary(g, 'evt-1', '2027-01-01').yes).toEqual(['tom']);
    g = setAttendance(g, 'chris', 'evt-1', '2026-12-04', 'yes');
    expect(attendanceSummary(g, 'evt-1', '2026-12-04').open).toEqual(['chris', 'mia']);
    expect(() => setAttendance(g, 'alex', 'evt-1', '2026-12-04', 'yes')).toThrow(new GroupError('not-member'));
    g = removeMeeting(g, 'evt-1');
    expect(g.meetingIds).toEqual([]);
    expect(g.attendance).toEqual({});
  });

  it('chat: members post, simulated members reply in order', () => {
    let g = postGroupMessage(base(), 'chris', '  Wer ist dabei?  ', NOW);
    expect(() => postGroupMessage(g, 'alex', 'hi', NOW)).toThrow(new GroupError('not-member'));
    g = addMeeting(g, 'chris', 'evt-1', NOW);
    g = scheduleGroup(g, [
      { at: new Date(NOW.getTime() + 2000), personId: 'tom', type: 'message', body: { de: 'Ich!', en: 'Me!' } },
      {
        at: new Date(NOW.getTime() + 1000),
        personId: 'mia',
        type: 'attend',
        eventId: 'evt-1',
        occurrenceKey: '2026-12-04',
        answer: 'yes',
      },
      { at: new Date(NOW.getTime() + 1000), personId: 'alex', type: 'message', body: { de: 'x', en: 'x' } },
    ]);
    const r = applyDueGroupActions(g, new Date(NOW.getTime() + 5000));
    expect(r.applied).toBe(2);
    expect(r.group.pending).toEqual([]);
    const texts = sortedGroupMessages(r.group).filter((m) => m.type === 'text');
    expect(texts.map((m) => (m.type === 'text' ? m.body : ''))).toEqual(['Wer ist dabei?', 'Ich!']);
    expect(attendanceSummary(r.group, 'evt-1', '2026-12-04').yes).toEqual(['mia']);
  });
});
