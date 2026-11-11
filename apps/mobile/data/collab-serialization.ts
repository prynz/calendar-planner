import { z } from 'zod';

import { CURRENCIES, RSVP_ANSWERS, VOTE_VALUES, type EventCollab, type Journey } from '@nowish/domain';

/** JSON shape on disk: dates as ISO strings. Bump + migrate in db.ts when the shape changes. */
export const COLLAB_JSON_VERSION = 1;

const date = z.iso.datetime().transform((s) => new Date(s));
const i18n = z.object({ de: z.string(), en: z.string() });
const rsvp = z.enum(RSVP_ANSWERS);
const voteValue = z.enum(VOTE_VALUES);

const note = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('rsvp'), personId: z.string(), answer: rsvp }),
  z.object({ kind: z.literal('invited'), personIds: z.array(z.string()) }),
  z.object({ kind: z.literal('poll-created'), pollId: z.string() }),
  z.object({ kind: z.literal('poll-decided'), pollId: z.string() }),
  z.object({ kind: z.literal('task-done'), personId: z.string(), taskId: z.string() }),
  z.object({ kind: z.literal('late'), personId: z.string(), minutes: z.number().int() }),
  z.object({ kind: z.literal('plan-b'), personId: z.string(), location: z.string() }),
  z.object({ kind: z.literal('settled'), from: z.string(), to: z.string(), amount: z.number().int() }),
]);

const action = z.discriminatedUnion('type', [
  z.object({ at: date, personId: z.string(), type: z.literal('rsvp'), answer: rsvp }),
  z.object({
    at: date,
    personId: z.string(),
    type: z.literal('vote'),
    pollId: z.string(),
    votes: z.record(z.string(), voteValue),
  }),
  z.object({ at: date, personId: z.string(), type: z.literal('message'), body: i18n }),
  z.object({ at: date, personId: z.string(), type: z.literal('confirm-settlement'), settlementId: z.string() }),
]);

const cents = z.number().int().min(0);
const split = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('equal'), among: z.array(z.string()).min(1) }),
  z.object({ mode: z.literal('shares'), shares: z.record(z.string(), z.number().int().min(1)) }),
  z.object({ mode: z.literal('exact'), amounts: z.record(z.string(), cents) }),
]);

const collabSchema = z.object({
  eventId: z.string(),
  hostId: z.string(),
  invitations: z.array(
    z.object({ personId: z.string(), answer: rsvp.optional(), answeredAt: date.optional(), plusOne: z.boolean() }),
  ),
  maybeDeadline: date.optional(),
  polls: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      questionI18n: i18n.optional(),
      options: z.array(
        z.discriminatedUnion('type', [
          z.object({ id: z.string(), type: z.literal('time'), start: date, end: date }),
          z.object({ id: z.string(), type: z.literal('text'), label: z.string(), labelI18n: i18n.optional() }),
        ]),
      ),
      votes: z.record(z.string(), z.record(z.string(), voteValue)),
      deadline: date,
      decision: z.enum(['majority', 'host']),
      chosenOptionId: z.string().optional(),
    }),
  ),
  bring: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      titleI18n: i18n.optional(),
      quantity: z.number().int().min(1),
      claims: z.array(z.object({ personId: z.string(), quantity: z.number().int().min(1) })),
    }),
  ),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      titleI18n: i18n.optional(),
      dueAt: date.optional(),
      assigneeId: z.string().optional(),
      doneAt: date.optional(),
    }),
  ),
  messages: z.array(
    z.discriminatedUnion('type', [
      z.object({
        id: z.string(),
        at: date,
        type: z.literal('text'),
        authorId: z.string(),
        body: z.string(),
        bodyI18n: i18n.optional(),
      }),
      z.object({ id: z.string(), at: date, type: z.literal('system'), note }),
    ]),
  ),
  pending: z.array(action),
  template: z.object({ id: z.string(), version: z.number().int() }).optional(),
  currency: z.enum(CURRENCIES).optional(),
  expenses: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        titleI18n: i18n.optional(),
        amount: cents.min(1),
        paidBy: z.string(),
        split,
        createdAt: date,
      }),
    )
    .optional(),
  settlements: z
    .array(
      z.object({
        id: z.string(),
        from: z.string(),
        to: z.string(),
        amount: cents.min(1),
        confirmedBy: z.array(z.string()),
        createdAt: date,
      }),
    )
    .optional(),
  outdoor: z.boolean().optional(),
  planB: z.object({ location: z.string(), active: z.boolean() }).optional(),
});

export function serializeCollab(c: EventCollab): string {
  // Dates become ISO strings through Date.prototype.toJSON.
  return JSON.stringify(c);
}

/**
 * Parses and validates one stored document; throws instead of returning bad data. Optional fields are
 * dropped when absent (exactOptionalPropertyTypes), so the result is a clean `EventCollab`.
 */
export function deserializeCollab(json: string): EventCollab {
  const parsed = collabSchema.parse(JSON.parse(json));
  return stripUndefined(parsed) as EventCollab; // zod output only differs by `?: T | undefined`, removed here
}

const journeySchema = z.object({
  id: z.string(),
  eventId: z.string(),
  occurrenceKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  plannedLeaveAt: date,
  leftAt: date.optional(),
  lateMinutes: z.number().int().optional(),
  lateAnnouncedAt: date.optional(),
  checked: z.array(z.string()),
});

export const serializeJourney = (j: Journey): string => JSON.stringify(j);

/** Validated like collaboration documents; private to the device (anti-chaos-engine.md §1). */
export function deserializeJourney(json: string): Journey {
  return stripUndefined(journeySchema.parse(JSON.parse(json))) as Journey; // see deserializeCollab
}

export function stripUndefined(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stripUndefined);
  if (v instanceof Date || typeof v !== 'object' || v === null) return v;
  return Object.fromEntries(
    Object.entries(v)
      .filter(([, x]) => x !== undefined)
      .map(([k, x]) => [k, stripUndefined(x)]),
  );
}
