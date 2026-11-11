import { nextId } from '../collab/model';
import type { DayKey } from '../time';
import {
  GROUP_LIMITS,
  GroupError,
  type Attendance,
  type Group,
  type GroupAction,
  type GroupMessage,
  type GroupNote,
} from './model';

const note = (g: Group, n: GroupNote, at: Date): GroupMessage => ({
  id: nextId('sys', g.messages, at),
  at,
  type: 'system',
  note: n,
});
const withNote = (g: Group, n: GroupNote, at: Date): Group => ({ ...g, messages: [...g.messages, note(g, n, at)] });

function checkName(name: string): string {
  const n = name.trim();
  if (n.length === 0 || n.length > GROUP_LIMITS.name) throw new GroupError('invalid-input');
  return n;
}

function checkEmoji(emoji: string): string {
  const e = emoji.trim();
  if (e.length === 0 || [...e].length > 4) throw new GroupError('invalid-input');
  return e;
}

export const isGroupMember = (g: Group, id: string) => g.memberIds.includes(id);
export const isGroupAdmin = (g: Group, id: string) => g.adminIds.includes(id);

function requireMember(g: Group, id: string) {
  if (!isGroupMember(g, id)) throw new GroupError('not-member');
}
function requireAdmin(g: Group, id: string) {
  requireMember(g, id);
  if (!isGroupAdmin(g, id)) throw new GroupError('not-admin');
}

/** GRP-01: the creator is the first admin. */
export function createGroup(
  id: string,
  input: { name: string; emoji: string },
  creatorId: string,
  memberIds: readonly string[],
  now: Date,
): Group {
  const members = [creatorId, ...new Set(memberIds.filter((m) => m !== creatorId))];
  if (members.length > GROUP_LIMITS.members) throw new GroupError('limit');
  const base: Group = {
    id,
    name: checkName(input.name),
    emoji: checkEmoji(input.emoji),
    adminIds: [creatorId],
    memberIds: members,
    messages: [],
    meetingIds: [],
    attendance: {},
    pending: [],
    createdAt: now,
  };
  return withNote(base, { kind: 'created', personId: creatorId }, now);
}

/** Editing the name turns localized demo text into plain user text. */
export function renameGroup(g: Group, by: string, input: { name: string; emoji: string }): Group {
  requireAdmin(g, by);
  const { nameI18n: _n, ...rest } = g;
  return { ...rest, name: checkName(input.name), emoji: checkEmoji(input.emoji) };
}

export function addGroupMembers(g: Group, by: string, ids: readonly string[], now: Date): Group {
  requireAdmin(g, by);
  const fresh = [...new Set(ids)].filter((id) => !isGroupMember(g, id));
  if (fresh.length === 0) throw new GroupError('invalid-input');
  if (g.memberIds.length + fresh.length > GROUP_LIMITS.members) throw new GroupError('limit');
  let next: Group = { ...g, memberIds: [...g.memberIds, ...fresh] };
  for (const id of fresh) next = withNote(next, { kind: 'joined', personId: id }, now);
  return next;
}

const dropPerson = (g: Group, id: string): Group => ({
  ...g,
  memberIds: g.memberIds.filter((x) => x !== id),
  adminIds: g.adminIds.filter((x) => x !== id),
  pending: g.pending.filter((a) => a.personId !== id),
});

/** GRP-06: admins remove members. The last admin cannot be removed this way. */
export function removeGroupMember(g: Group, by: string, id: string, now: Date): Group {
  requireAdmin(g, by);
  requireMember(g, id);
  if (id === by) throw new GroupError('invalid-input');
  if (isGroupAdmin(g, id) && g.adminIds.length === 1) throw new GroupError('last-admin');
  return withNote(dropPerson(g, id), { kind: 'removed', personId: id }, now);
}

export function setGroupAdmin(g: Group, by: string, id: string, admin: boolean): Group {
  requireAdmin(g, by);
  requireMember(g, id);
  if (!admin && isGroupAdmin(g, id) && g.adminIds.length === 1) throw new GroupError('last-admin');
  const adminIds = admin ? [...new Set([...g.adminIds, id])] : g.adminIds.filter((x) => x !== id);
  return { ...g, adminIds };
}

/**
 * Leaving: own messages stay (groups.md). When the last admin leaves, the longest-standing member becomes
 * admin so the group is never without one. Returns null when nobody is left.
 */
export function leaveGroup(g: Group, id: string, now: Date): Group | null {
  requireMember(g, id);
  let next = dropPerson(g, id);
  if (next.memberIds.length === 0) return null;
  if (next.adminIds.length === 0) next = { ...next, adminIds: [next.memberIds[0] as string] }; // length checked
  return withNote(next, { kind: 'left', personId: id }, now);
}

export function postGroupMessage(g: Group, authorId: string, body: string, now: Date): Group {
  requireMember(g, authorId);
  const text = body.trim();
  if (text.length === 0 || text.length > GROUP_LIMITS.message) throw new GroupError('invalid-input');
  return {
    ...g,
    messages: [...g.messages, { id: nextId('msg', g.messages, now), at: now, type: 'text', authorId, body: text }],
  };
}

export const sortedGroupMessages = (g: Group): GroupMessage[] =>
  g.messages
    .map((m, i) => ({ m, i }))
    .sort((a, b) => a.m.at.getTime() - b.m.at.getTime() || a.i - b.i)
    .map((x) => x.m);

/** GRP-03: link a newly created group event (all members are invited by the caller). */
export function addMeeting(g: Group, by: string, eventId: string, now: Date): Group {
  requireMember(g, by);
  if (g.meetingIds.includes(eventId)) return g;
  return withNote({ ...g, meetingIds: [...g.meetingIds, eventId] }, { kind: 'meeting', personId: by, eventId }, now);
}

/** Forget a deleted event. */
export function removeMeeting(g: Group, eventId: string): Group {
  if (!g.meetingIds.includes(eventId)) return g;
  const attendance: Group['attendance'] = {};
  for (const [k, v] of Object.entries(g.attendance)) if (!k.startsWith(`${eventId}|`)) attendance[k] = v;
  return { ...g, meetingIds: g.meetingIds.filter((x) => x !== eventId), attendance };
}

export const attendanceKey = (eventId: string, occurrenceKey: DayKey) => `${eventId}|${occurrenceKey}`;

/** GRP-04: every occurrence has its own answer. Answering the same again clears it. */
export function setAttendance(
  g: Group,
  personId: string,
  eventId: string,
  occurrenceKey: DayKey,
  answer: Attendance,
): Group {
  requireMember(g, personId);
  if (!g.meetingIds.includes(eventId)) throw new GroupError('not-found');
  const key = attendanceKey(eventId, occurrenceKey);
  const current = { ...(g.attendance[key] ?? {}) };
  if (current[personId] === answer) delete current[personId];
  else current[personId] = answer;
  return { ...g, attendance: { ...g.attendance, [key]: current } };
}

export function attendanceSummary(g: Group, eventId: string, occurrenceKey: DayKey) {
  const answers = g.attendance[attendanceKey(eventId, occurrenceKey)] ?? {};
  const yes = g.memberIds.filter((m) => answers[m] === 'yes');
  const no = g.memberIds.filter((m) => answers[m] === 'no');
  return { yes, no, open: g.memberIds.filter((m) => !answers[m]) };
}

export function scheduleGroup(g: Group, actions: readonly GroupAction[]): Group {
  if (actions.length === 0) return g;
  return { ...g, pending: [...g.pending, ...actions].sort((a, b) => a.at.getTime() - b.at.getTime()) };
}

/** Plays due simulated actions; ones the rules now reject (member left, meeting deleted) are dropped. */
export function applyDueGroupActions(g: Group, now: Date): { group: Group; applied: number } {
  const due = g.pending.filter((a) => a.at.getTime() <= now.getTime());
  if (due.length === 0) return { group: g, applied: 0 };
  let next: Group = { ...g, pending: g.pending.filter((a) => a.at.getTime() > now.getTime()) };
  let applied = 0;
  for (const a of due) {
    try {
      if (a.type === 'attend') {
        const current = next.attendance[attendanceKey(a.eventId, a.occurrenceKey)]?.[a.personId];
        if (current === a.answer) continue;
        next = setAttendance(next, a.personId, a.eventId, a.occurrenceKey, a.answer);
      } else {
        requireMember(next, a.personId);
        next = {
          ...next,
          messages: [
            ...next.messages,
            {
              id: nextId('msg', next.messages, a.at),
              at: a.at,
              type: 'text',
              authorId: a.personId,
              body: a.body.de,
              bodyI18n: a.body,
            },
          ],
        };
      }
      applied += 1;
    } catch (error) {
      if (!(error instanceof GroupError)) throw error;
      // Rule-rejected simulated action: dropped on purpose (see doc comment).
    }
  }
  return { group: next, applied };
}
