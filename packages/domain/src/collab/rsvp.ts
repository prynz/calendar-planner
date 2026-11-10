import { CollabError, type EventCollab, type Invitation, type RsvpAnswer } from './model';

/** What the host sees per guest. `expired` = "maybe" past the deadline → counts as no response (EVT-05). */
export type RsvpState = RsvpAnswer | 'pending' | 'expired';

export function rsvpState(inv: Invitation, maybeDeadline: Date | undefined, now: Date): RsvpState {
  if (!inv.answer) return 'pending';
  if (inv.answer === 'maybe' && maybeDeadline && now.getTime() >= maybeDeadline.getTime()) return 'expired';
  return inv.answer;
}

export interface RsvpSummary {
  yes: number;
  maybe: number;
  no: number;
  /** Not answered yet, including expired "maybe". */
  open: number;
  /** Expected headcount: yes + their +1s + the host. */
  headcount: number;
}

export function rsvpSummary(c: EventCollab, now: Date): RsvpSummary {
  const s: RsvpSummary = { yes: 0, maybe: 0, no: 0, open: 0, headcount: 1 };
  for (const inv of c.invitations) {
    const state = rsvpState(inv, c.maybeDeadline, now);
    if (state === 'yes') {
      s.yes += 1;
      s.headcount += inv.plusOne ? 2 : 1;
    } else if (state === 'maybe') s.maybe += 1;
    else if (state === 'no') s.no += 1;
    else s.open += 1;
  }
  return s;
}

/** Guests grouped for the guest list, in invitation order. */
export function guestsByState(c: EventCollab, now: Date): Record<RsvpState, Invitation[]> {
  const groups: Record<RsvpState, Invitation[]> = { yes: [], maybe: [], no: [], pending: [], expired: [] };
  for (const inv of c.invitations) groups[rsvpState(inv, c.maybeDeadline, now)].push(inv);
  return groups;
}

export function invitationOf(c: EventCollab, personId: string): Invitation | undefined {
  return c.invitations.find((i) => i.personId === personId);
}

/** Answer (or change the answer to) an invitation; adds a system note to the chat. */
export function respond(
  c: EventCollab,
  personId: string,
  answer: RsvpAnswer,
  now: Date,
  plusOne?: boolean,
): EventCollab {
  const inv = invitationOf(c, personId);
  if (!inv) throw new CollabError('not-invited');
  const unchanged = inv.answer === answer && (plusOne === undefined || plusOne === inv.plusOne);
  if (unchanged) return c;
  const next: Invitation = {
    ...inv,
    answer,
    answeredAt: now,
    plusOne: answer === 'no' ? false : (plusOne ?? inv.plusOne),
  };
  return {
    ...c,
    invitations: c.invitations.map((i) => (i.personId === personId ? next : i)),
    messages:
      inv.answer === answer
        ? c.messages
        : [
            ...c.messages,
            {
              id: `sys-rsvp-${personId}-${now.getTime()}`,
              at: now,
              type: 'system',
              note: { kind: 'rsvp', personId, answer },
            },
          ],
  };
}

/** Invite more people (host only, duplicates ignored). */
export function invite(c: EventCollab, actorId: string, personIds: readonly string[], now: Date): EventCollab {
  if (actorId !== c.hostId) throw new CollabError('not-host');
  const fresh = [...new Set(personIds)].filter((p) => p !== c.hostId && !invitationOf(c, p));
  if (fresh.length === 0) return c;
  return {
    ...c,
    invitations: [...c.invitations, ...fresh.map((personId) => ({ personId, plusOne: false }))],
    messages: [
      ...c.messages,
      { id: `sys-inv-${now.getTime()}`, at: now, type: 'system', note: { kind: 'invited', personIds: fresh } },
    ],
  };
}

export function setMaybeDeadline(c: EventCollab, actorId: string, deadline: Date | undefined): EventCollab {
  if (actorId !== c.hostId) throw new CollabError('not-host');
  const { maybeDeadline: _old, ...rest } = c;
  return deadline ? { ...rest, maybeDeadline: deadline } : rest;
}

/** Everyone who belongs to the event: host plus invited people. */
export const memberIds = (c: EventCollab): string[] => [c.hostId, ...c.invitations.map((i) => i.personId)];
