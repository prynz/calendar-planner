import { z } from 'zod';

import { ATTENDANCE, CHORE_EVERY, MEMBER_COLORS, RIDE_LEGS, type Group, type Household } from '@nowish/domain';

import { stripUndefined } from './collab-serialization';

/** Family and group documents (ADR 0014). JSON on disk, validated on every read. */
const date = z.iso.datetime().transform((s) => new Date(s));
const i18n = z.object({ de: z.string(), en: z.string() });
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const weekday = z.number().int().min(0).max(6);
const leg = z.enum(RIDE_LEGS);

const familyAction = z.discriminatedUnion('type', [
  z.object({ at: date, personId: z.string(), type: z.literal('join') }),
  z.object({
    at: date,
    personId: z.string(),
    type: z.literal('ride-answer'),
    eventId: z.string(),
    occurrenceKey: day,
    leg,
    accept: z.boolean(),
  }),
  z.object({ at: date, personId: z.string(), type: z.literal('shopping-add'), title: i18n }),
  z.object({ at: date, personId: z.string(), type: z.literal('shopping-done'), itemId: z.string() }),
]);

const householdSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameI18n: i18n.optional(),
  adminId: z.string(),
  adultIds: z.array(z.string()),
  invitedIds: z.array(z.string()),
  kids: z.array(
    z.object({ id: z.string(), name: z.string(), color: z.enum(MEMBER_COLORS), emoji: z.string().optional() }),
  ),
  assignments: z.record(z.string(), z.array(z.string())),
  rides: z.array(
    z.object({
      eventId: z.string(),
      occurrenceKey: day,
      leg,
      driverId: z.string().optional(),
      requestedId: z.string().optional(),
    }),
  ),
  shopping: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      titleI18n: i18n.optional(),
      note: z.string().optional(),
      addedBy: z.string(),
      createdAt: date,
      doneAt: date.optional(),
      doneBy: z.string().optional(),
    }),
  ),
  chores: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      titleI18n: i18n.optional(),
      emoji: z.string().optional(),
      every: z.enum(CHORE_EVERY),
      weekday: weekday.optional(),
      startDay: day,
      rotation: z.array(z.string()),
      done: z.record(day, z.string()),
    }),
  ),
  pending: z.array(familyAction),
  createdAt: date,
});

const groupNote = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('created'), personId: z.string() }),
  z.object({ kind: z.literal('joined'), personId: z.string() }),
  z.object({ kind: z.literal('left'), personId: z.string() }),
  z.object({ kind: z.literal('removed'), personId: z.string() }),
  z.object({ kind: z.literal('meeting'), personId: z.string(), eventId: z.string() }),
]);

const attendance = z.enum(ATTENDANCE);

const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameI18n: i18n.optional(),
  emoji: z.string(),
  adminIds: z.array(z.string()),
  memberIds: z.array(z.string()),
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
      z.object({ id: z.string(), at: date, type: z.literal('system'), note: groupNote }),
    ]),
  ),
  meetingIds: z.array(z.string()),
  attendance: z.record(z.string(), z.record(z.string(), attendance)),
  pending: z.array(
    z.discriminatedUnion('type', [
      z.object({
        at: date,
        personId: z.string(),
        type: z.literal('attend'),
        eventId: z.string(),
        occurrenceKey: day,
        answer: attendance,
      }),
      z.object({ at: date, personId: z.string(), type: z.literal('message'), body: i18n }),
    ]),
  ),
  createdAt: date,
});

export const serializeHousehold = (h: Household): string => JSON.stringify(h);
export const serializeGroup = (g: Group): string => JSON.stringify(g);

export function deserializeHousehold(json: string): Household {
  return stripUndefined(householdSchema.parse(JSON.parse(json))) as Household; // see deserializeCollab
}

export function deserializeGroup(json: string): Group {
  return stripUndefined(groupSchema.parse(JSON.parse(json))) as Group; // see deserializeCollab
}
