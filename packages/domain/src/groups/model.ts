import type { LocalizedText } from '../calendar-event';
import type { DayKey } from '../time';

/**
 * A fixed circle of people (docs/product/features/groups.md): members, admins, a group chat and the group's
 * meetings. Meetings are ordinary social events (ADR 0006) linked here; for recurring meetings each
 * occurrence has its own "I'm in / not this time" (GRP-04). Private by design: no public search.
 */

export const ATTENDANCE = ['yes', 'no'] as const;
export type Attendance = (typeof ATTENDANCE)[number];

export type GroupNote =
  | { kind: 'created'; personId: string }
  | { kind: 'joined'; personId: string }
  | { kind: 'left'; personId: string }
  | { kind: 'removed'; personId: string }
  | { kind: 'meeting'; personId: string; eventId: string };

export type GroupMessage =
  | { id: string; at: Date; type: 'text'; authorId: string; body: string; bodyI18n?: LocalizedText }
  | { id: string; at: Date; type: 'system'; note: GroupNote };

export type GroupAction =
  | { at: Date; personId: string; type: 'attend'; eventId: string; occurrenceKey: DayKey; answer: Attendance }
  | { at: Date; personId: string; type: 'message'; body: LocalizedText };

export interface Group {
  id: string;
  name: string;
  nameI18n?: LocalizedText;
  emoji: string;
  adminIds: string[];
  memberIds: string[];
  messages: GroupMessage[];
  /** Social events of this group, in creation order. */
  meetingIds: string[];
  /** `eventId|occurrenceKey` → personId → answer. */
  attendance: Record<string, Record<string, Attendance>>;
  pending: GroupAction[];
  createdAt: Date;
}

export const GROUP_LIMITS = { name: 60, members: 50, message: 4000 } as const;

/** Error codes are i18n key suffixes (`groups.error.<code>`). */
export type GroupErrorCode = 'not-member' | 'not-admin' | 'invalid-input' | 'limit' | 'last-admin' | 'not-found';

export class GroupError extends Error {
  constructor(readonly code: GroupErrorCode) {
    super(`groups: ${code}`);
    this.name = 'GroupError';
  }
}
