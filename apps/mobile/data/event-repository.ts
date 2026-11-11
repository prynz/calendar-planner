import type { CalendarEvent, EventCollab, Journey } from '@nowish/domain';

export interface StoredWorld {
  events: CalendarEvent[];
  collabs: EventCollab[];
  /** The example world was seeded on this device. */
  seeded: boolean;
  /** Collaboration data (Phase 3) was seeded – false on devices that ran an older prototype. */
  collabSeeded: boolean;
  /** The viewer's private departure history (Phase 4). */
  journeys: Journey[];
  journeysSeeded: boolean;
}

/**
 * Storage boundary (ADR 0010, ADR 0012). Screens never touch SQLite directly; in block B a Supabase-backed
 * implementation replaces the local one behind this interface. One collaboration document per social event.
 */
export interface EventRepository {
  load(): Promise<StoredWorld>;
  upsert(event: CalendarEvent): Promise<void>;
  /** Removes the event and its collaboration document. */
  remove(id: string): Promise<void>;
  upsertCollab(collab: EventCollab): Promise<void>;
  /** Adds collaboration documents for an existing world and marks it as collab-seeded. */
  seedCollabs(collabs: readonly EventCollab[]): Promise<void>;
  upsertJourney(journey: Journey): Promise<void>;
  /** Adds journeys for an existing world and marks journeys as seeded. */
  seedJourneys(journeys: readonly Journey[]): Promise<void>;
  /** "Delete my history" – the data stays deletable at any time (anti-chaos-engine.md §1). */
  clearJourneys(): Promise<void>;
  /** Replaces everything (seeding / "reset example world") and marks the store as seeded. */
  replaceAll(
    events: readonly CalendarEvent[],
    collabs: readonly EventCollab[],
    journeys: readonly Journey[],
  ): Promise<void>;
}
