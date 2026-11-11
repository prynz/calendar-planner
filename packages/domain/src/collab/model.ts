import type { LocalizedText } from '../calendar-event';

/**
 * Everything people do together around one social event (docs/product/features/events.md): invitations,
 * polls, bring list, tasks and chat. One document per event, stored next to the event (ADR 0012).
 * Field names follow data-model.md so a server can take over in block B.
 */

export const RSVP_ANSWERS = ['yes', 'maybe', 'no'] as const;
export type RsvpAnswer = (typeof RSVP_ANSWERS)[number];

export interface Invitation {
  personId: string;
  answer?: RsvpAnswer;
  answeredAt?: Date;
  /** Brings one extra guest (EVT-04). */
  plusOne: boolean;
}

export const VOTE_VALUES = ['yes', 'if-needed', 'no'] as const;
export type VoteValue = (typeof VOTE_VALUES)[number];

export type PollOption =
  | { id: string; type: 'time'; start: Date; end: Date }
  | { id: string; type: 'text'; label: string; labelI18n?: LocalizedText };

export interface Poll {
  id: string;
  question: string;
  questionI18n?: LocalizedText;
  options: PollOption[];
  /** voterId → optionId → vote. */
  votes: Record<string, Record<string, VoteValue>>;
  deadline: Date;
  /** Who decides after the deadline (POL-06). A tie always goes to the host – never chance. */
  decision: 'majority' | 'host';
  /** Set when the host picks an option (or confirms the majority). */
  chosenOptionId?: string;
}

export interface BringClaim {
  personId: string;
  quantity: number;
}

export interface BringItem {
  id: string;
  title: string;
  titleI18n?: LocalizedText;
  quantity: number;
  claims: BringClaim[];
}

export interface EventTask {
  id: string;
  title: string;
  titleI18n?: LocalizedText;
  dueAt?: Date;
  /** 0–1 responsible person (tasks.md: responsibility stays clear). */
  assigneeId?: string;
  doneAt?: Date;
}

/** System notes are rendered through i18n (`chat.system.<kind>`), never stored as prose. */
export type SystemNote =
  | { kind: 'rsvp'; personId: string; answer: RsvpAnswer }
  | { kind: 'invited'; personIds: string[] }
  | { kind: 'poll-created'; pollId: string }
  | { kind: 'poll-decided'; pollId: string }
  | { kind: 'task-done'; personId: string; taskId: string }
  | { kind: 'late'; personId: string; minutes: number }
  | { kind: 'plan-b'; personId: string; location: string }
  | { kind: 'settled'; from: string; to: string; amount: number };

export type ChatMessage =
  | { id: string; at: Date; type: 'text'; authorId: string; body: string; bodyI18n?: LocalizedText }
  | { id: string; at: Date; type: 'system'; note: SystemNote };

/**
 * Something a demo person will do at `at` (ADR 0010: simulated people follow fixed, traceable rules).
 * Applied by `applyDueActions` – nothing happens at random at runtime.
 */
export type SimulatedAction =
  | { at: Date; personId: string; type: 'rsvp'; answer: RsvpAnswer }
  | { at: Date; personId: string; type: 'vote'; pollId: string; votes: Record<string, VoteValue> }
  | { at: Date; personId: string; type: 'message'; body: LocalizedText }
  | { at: Date; personId: string; type: 'confirm-settlement'; settlementId: string };

export interface EventCollab {
  eventId: string;
  hostId: string;
  invitations: Invitation[];
  /** After this, an unconfirmed "maybe" counts as no response (EVT-05). */
  maybeDeadline?: Date;
  polls: Poll[];
  bring: BringItem[];
  tasks: EventTask[];
  messages: ChatMessage[];
  pending: SimulatedAction[];
  /** Template the event was created from (templates.md: versioned, no retroactive changes). */
  template?: { id: string; version: number };
  /** Cost split (costs.md, Phase 6): one currency per event. */
  currency?: Currency;
  expenses?: Expense[];
  settlements?: Settlement[];
  /** Weather fallback (Phase 6): the host's alternative place for outdoor events. */
  outdoor?: boolean;
  planB?: PlanB;
}

export const CURRENCIES = ['EUR', 'CHF'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SPLIT_MODES = ['equal', 'shares', 'exact'] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

/** How an expense is divided (CST-02). Amounts are integer minor units (cents). */
export type ExpenseSplit =
  | { mode: 'equal'; among: string[] }
  | { mode: 'shares'; shares: Record<string, number> }
  | { mode: 'exact'; amounts: Record<string, number> };

export interface Expense {
  id: string;
  title: string;
  titleI18n?: LocalizedText;
  /** Cents, > 0. */
  amount: number;
  paidBy: string;
  split: ExpenseSplit;
  createdAt: Date;
}

/** A payment between two people, "done" once both sides confirmed (CST-05). */
export interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  confirmedBy: string[];
  createdAt: Date;
}

export interface PlanB {
  location: string;
  active: boolean;
}

export const COLLAB_LIMITS = {
  title: 120,
  message: 4000,
  quantity: 99,
  options: 8,
  question: 200,
  /** 100 000 € / CHF per expense. */
  amount: 10_000_000,
  location: 200,
} as const;

/** Error codes are i18n key suffixes (`collab.error.<code>`). */
export type CollabErrorCode =
  'not-found' | 'not-invited' | 'not-host' | 'poll-closed' | 'already-taken' | 'over-claimed' | 'invalid-input';

export class CollabError extends Error {
  constructor(
    readonly code: CollabErrorCode,
    /** e.g. who already took the task. */
    readonly personId?: string,
  ) {
    super(`collab: ${code}`);
    this.name = 'CollabError';
  }
}

export function emptyCollab(eventId: string, hostId: string): EventCollab {
  return { eventId, hostId, invitations: [], polls: [], bring: [], tasks: [], messages: [], pending: [] };
}

/** Display text for demo content in the user's language; user content has only the plain field. */
export const localized = (plain: string, i18n: LocalizedText | undefined, locale: 'de' | 'en') =>
  i18n?.[locale] ?? plain;

/** Deterministic local ids (`prefix-time-counter`), unique within one document. */
export function nextId(prefix: string, existing: readonly { id: string }[], now: Date): string {
  const base = `${prefix}-${now.getTime().toString(36)}`;
  let n = existing.length;
  let id = `${base}-${n}`;
  const taken = new Set(existing.map((x) => x.id));
  while (taken.has(id)) id = `${base}-${++n}`;
  return id;
}
