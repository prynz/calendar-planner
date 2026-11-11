import { nextId } from '../collab/model';
import { FAMILY_LIMITS, FamilyError, MEMBER_COLORS, type Household, type KidProfile, type MemberColor } from './model';

export function newHousehold(id: string, name: string, adminId: string, now: Date): Household {
  return {
    id,
    name: checkName(name),
    adminId,
    adultIds: [adminId],
    invitedIds: [],
    kids: [],
    assignments: {},
    rides: [],
    shopping: [],
    chores: [],
    pending: [],
    createdAt: now,
  };
}

function checkName(name: string): string {
  const n = name.trim();
  if (n.length === 0 || n.length > FAMILY_LIMITS.name) throw new FamilyError('invalid-input');
  return n;
}

/** Everyone in the household: adults first, then child profiles. */
export const householdMemberIds = (h: Household): string[] => [...h.adultIds, ...h.kids.map((k) => k.id)];

export const isAdult = (h: Household, id: string) => h.adultIds.includes(id);
export const isMember = (h: Household, id: string) => householdMemberIds(h).includes(id);
export const kidById = (h: Household, id: string): KidProfile | undefined => h.kids.find((k) => k.id === id);

const memberCount = (h: Household) => h.adultIds.length + h.invitedIds.length + h.kids.length;

function requireAdmin(h: Household, by: string) {
  if (!isAdult(h, by)) throw new FamilyError('not-member');
  if (h.adminId !== by) throw new FamilyError('not-admin');
}

export function requireAdult(h: Household, by: string) {
  if (!isAdult(h, by)) throw new FamilyError('not-member');
}

/** FAM-01: invite an adult (they join once they accept). */
export function inviteAdult(h: Household, by: string, personId: string): Household {
  requireAdmin(h, by);
  if (isMember(h, personId) || h.invitedIds.includes(personId)) throw new FamilyError('invalid-input');
  if (memberCount(h) >= FAMILY_LIMITS.members) throw new FamilyError('limit');
  return { ...h, invitedIds: [...h.invitedIds, personId] };
}

export function acceptInvite(h: Household, personId: string): Household {
  if (!h.invitedIds.includes(personId)) throw new FamilyError('not-found');
  return { ...h, invitedIds: h.invitedIds.filter((x) => x !== personId), adultIds: [...h.adultIds, personId] };
}

export interface KidInput {
  name: string;
  color: MemberColor;
  emoji?: string;
}

function checkKid(input: KidInput): Omit<KidProfile, 'id'> {
  if (!MEMBER_COLORS.includes(input.color)) throw new FamilyError('invalid-input');
  const emoji = input.emoji?.trim();
  if (emoji !== undefined && [...emoji].length > 4) throw new FamilyError('invalid-input');
  return { name: checkName(input.name), color: input.color, ...(emoji ? { emoji } : {}) };
}

/** FAM-02: child profile without account. */
export function addKid(h: Household, by: string, input: KidInput, now: Date): { household: Household; id: string } {
  requireAdmin(h, by);
  if (memberCount(h) >= FAMILY_LIMITS.members) throw new FamilyError('limit');
  const id = nextId('kid', h.kids, now);
  return { household: { ...h, kids: [...h.kids, { id, ...checkKid(input) }] }, id };
}

export function updateKid(h: Household, by: string, id: string, input: KidInput): Household {
  requireAdmin(h, by);
  if (!kidById(h, id)) throw new FamilyError('not-found');
  return { ...h, kids: h.kids.map((k) => (k.id === id ? { id, ...checkKid(input) } : k)) };
}

/** Removing a child profile also removes it from appointments and chore rotations – nothing dangles. */
export function removeKid(h: Household, by: string, id: string): Household {
  requireAdmin(h, by);
  if (!kidById(h, id)) throw new FamilyError('not-found');
  return {
    ...h,
    kids: h.kids.filter((k) => k.id !== id),
    assignments: withoutMember(h.assignments, id),
    chores: h.chores.map((c) => ({ ...c, rotation: c.rotation.filter((x) => x !== id) })),
  };
}

function withoutMember(assignments: Household['assignments'], id: string): Household['assignments'] {
  const out: Household['assignments'] = {};
  for (const [eventId, ids] of Object.entries(assignments)) {
    const rest = ids.filter((x) => x !== id);
    if (rest.length > 0) out[eventId] = rest;
  }
  return out;
}

/** FAM-03: who an appointment is for. An empty list removes the assignment. */
export function assignMembers(h: Household, by: string, eventId: string, memberIds: readonly string[]): Household {
  requireAdult(h, by);
  const ids = [...new Set(memberIds)];
  if (ids.some((id) => !isMember(h, id))) throw new FamilyError('not-member');
  const assignments = { ...h.assignments };
  if (ids.length === 0) delete assignments[eventId];
  else assignments[eventId] = ids;
  return { ...h, assignments };
}

/** Drops assignments and rides of a deleted event. */
export function forgetEvent(h: Household, eventId: string): Household {
  if (!(eventId in h.assignments) && !h.rides.some((r) => r.eventId === eventId)) return h;
  const assignments = { ...h.assignments };
  delete assignments[eventId];
  return { ...h, assignments, rides: h.rides.filter((r) => r.eventId !== eventId) };
}

export const assignedTo = (h: Household, eventId: string): readonly string[] => h.assignments[eventId] ?? [];
