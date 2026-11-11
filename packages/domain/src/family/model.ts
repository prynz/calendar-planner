import type { LocalizedText } from '../calendar-event';
import { EVENT_CATEGORIES, type EventCategory } from '../event';
import type { DayKey } from '../time';
import type { Weekday } from '../recurrence';

/**
 * The family space (docs/product/features/family.md): adults with an account, child profiles without one,
 * who an appointment is for, rides, a shared shopping list and chores with rotation. One document per
 * household, stored on the device in the prototype (ADR 0014).
 */

/** Child profiles reuse the pastel category palette so every colour is a design token. */
export const MEMBER_COLORS: readonly EventCategory[] = EVENT_CATEGORIES;
export type MemberColor = EventCategory;

/** FAM-02: only a display name, a colour and an optional emoji – no birthday, no photo, no contact data. */
export interface KidProfile {
  id: string;
  name: string;
  color: MemberColor;
  emoji?: string;
}

export const RIDE_LEGS = ['drop-off', 'pick-up'] as const;
export type RideLeg = (typeof RIDE_LEGS)[number];

/** FAM-04: who brings (`drop-off`) and who collects (`pick-up`) for one occurrence. */
export interface Ride {
  eventId: string;
  occurrenceKey: DayKey;
  leg: RideLeg;
  driverId?: string;
  /** Asked, not answered yet. */
  requestedId?: string;
}

export interface ShoppingItem {
  id: string;
  title: string;
  titleI18n?: LocalizedText;
  /** Free text such as "2 l" or "for Sunday". */
  note?: string;
  addedBy: string;
  createdAt: Date;
  doneAt?: Date;
  doneBy?: string;
}

export const CHORE_EVERY = ['daily', 'weekly'] as const;
export type ChoreEvery = (typeof CHORE_EVERY)[number];

/** FAM-07: a chore rotates through `rotation` on every due day. */
export interface Chore {
  id: string;
  title: string;
  titleI18n?: LocalizedText;
  emoji?: string;
  every: ChoreEvery;
  /** Weekly chores: the weekday they are due. */
  weekday?: Weekday;
  /** First due day; the rotation counts from here. */
  startDay: DayKey;
  rotation: string[];
  /** Due day → who did it. */
  done: Record<DayKey, string>;
}

/** What a simulated family member will do at `at` (ADR 0010: fixed, traceable rules). */
export type FamilyAction =
  | { at: Date; personId: string; type: 'join' }
  | {
      at: Date;
      personId: string;
      type: 'ride-answer';
      eventId: string;
      occurrenceKey: DayKey;
      leg: RideLeg;
      accept: boolean;
    }
  | { at: Date; personId: string; type: 'shopping-add'; title: LocalizedText }
  | { at: Date; personId: string; type: 'shopping-done'; itemId: string };

export interface Household {
  id: string;
  name: string;
  adminId: string;
  /** Adults with an account (FAM-01). */
  adultIds: string[];
  /** Invited adults that have not joined yet. */
  invitedIds: string[];
  kids: KidProfile[];
  /** eventId → household members the appointment is for (FAM-03). */
  assignments: Record<string, string[]>;
  rides: Ride[];
  shopping: ShoppingItem[];
  chores: Chore[];
  pending: FamilyAction[];
  createdAt: Date;
}

/**
 * Prototype limits follow the Family plan (up to 6 people incl. child profiles – open PO question in
 * family.md, decided conservatively in ADR 0014). Free limits arrive with entitlements in Phase 6.
 */
export const FAMILY_LIMITS = { members: 6, name: 30, title: 120, note: 60, shopping: 200, chores: 30 } as const;

/** Error codes are i18n key suffixes (`family.error.<code>`). */
export type FamilyErrorCode = 'not-member' | 'not-admin' | 'limit' | 'invalid-input' | 'not-found' | 'not-adult';

export class FamilyError extends Error {
  constructor(readonly code: FamilyErrorCode) {
    super(`family: ${code}`);
    this.name = 'FamilyError';
  }
}
