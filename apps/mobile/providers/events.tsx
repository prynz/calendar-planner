import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { buildDemoCollabs, buildDemoEvents, DEMO_TIME_ZONE, DEMO_VIEWER_ID, simulateInviteReplies } from '@nowish/demo';
import {
  applyDraft,
  emptyCollab,
  invite,
  memberIds,
  schedule,
  type CalendarEvent,
  type DayKey,
  type EventCollab,
  type EventDraft,
  type SimulatedAction,
} from '@nowish/domain';

import type { EventRepository } from '@/data/event-repository';

import { useSimulation } from './simulation';

export type EventsState = 'loading' | 'ready' | 'error';

/** Content copied from a template (or typed in) when a social event is created. */
export interface SocialSetup {
  inviteeIds: readonly string[];
  tasks: readonly { title: string; dueAt?: Date }[];
  bring: readonly { title: string; quantity: number }[];
  template?: { id: string; version: number };
}

export type CollabUpdate = (
  collab: EventCollab,
  now: Date,
) => EventCollab | { collab: EventCollab; simulate: SimulatedAction[] };

interface EventsContextValue {
  state: EventsState;
  events: readonly CalendarEvent[];
  collabs: readonly EventCollab[];
  /** Zone new events are created in (device zone in block B; demo zone in the prototype). */
  timeZone: string;
  retry: () => void;
  getEvent: (id: string) => CalendarEvent | undefined;
  getCollab: (eventId: string) => EventCollab | undefined;
  create: (draft: EventDraft) => Promise<string>;
  /** Social event hosted by the viewer, with invitations and template content (EVT-01). */
  createSocial: (draft: EventDraft, setup: SocialSetup) => Promise<string>;
  update: (id: string, draft: EventDraft) => Promise<void>;
  /**
   * Applies a pure collaboration operation (domain `collab/*`). Domain errors (`CollabError`) are rethrown
   * untouched so screens can explain them; event participants follow the members automatically.
   */
  updateCollab: (eventId: string, fn: CollabUpdate) => Promise<void>;
  remove: (id: string) => Promise<void>;
  /** Recurring events: hide one occurrence (EXDATE) instead of deleting the series. */
  removeOccurrence: (id: string, occurrenceKey: DayKey) => Promise<void>;
  resetExampleWorld: () => Promise<void>;
}

const EventsContext = createContext<EventsContextValue | null>(null);

/** Local ids – unique per device, enough for the prototype (server ids replace them in block B). */
export function newEventId(now: Date): string {
  return `evt-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function demoWorld(now: Date) {
  const events = buildDemoEvents(now, DEMO_TIME_ZONE);
  return { events, collabs: buildDemoCollabs(events, now) };
}

const sameMembers = (e: CalendarEvent, c: EventCollab) => {
  const m = memberIds(c);
  return m.length === e.participantIds.length && m.every((id) => e.participantIds.includes(id));
};

/**
 * Holds all events and their collaboration documents in memory (prototype scale: hundreds, not millions)
 * and writes through to the repository. Writes are optimistic; on failure the previous state is restored
 * and the error rethrown so the screen can tell the user.
 */
export function EventsProvider({
  repository,
  children,
  now = () => new Date(),
  simulate = true,
}: {
  repository: EventRepository;
  children: ReactNode;
  now?: () => Date;
  /** Run simulated demo people (off in tests that need a frozen world). */
  simulate?: boolean;
}) {
  const [state, setState] = useState<EventsState>('loading');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [collabs, setCollabs] = useState<EventCollab[]>([]);
  const [attempt, setAttempt] = useState(0);
  const eventsRef = useRef(events);
  const collabsRef = useRef(collabs);
  const nowRef = useRef(now);
  useLayoutEffect(() => {
    eventsRef.current = events;
    collabsRef.current = collabs;
    nowRef.current = now;
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await repository.load();
      if (!loaded.seeded) {
        const world = demoWorld(nowRef.current());
        await repository.replaceAll(world.events, world.collabs);
        return world;
      }
      if (!loaded.collabSeeded) {
        // Device that ran the Phase 2 prototype: add collaboration data for its demo events once.
        const extra = buildDemoCollabs(
          loaded.events.filter((e) => e.isDemo),
          nowRef.current(),
        ).filter((c) => !loaded.collabs.some((x) => x.eventId === c.eventId));
        await repository.seedCollabs(extra);
        return { events: loaded.events, collabs: [...loaded.collabs, ...extra] };
      }
      return loaded;
    })()
      .then((world) => {
        if (!alive) return;
        setEvents(world.events);
        setCollabs(world.collabs);
        setState('ready');
      })
      .catch((error: unknown) => {
        if (!alive) return;
        console.warn('[events] load failed', error instanceof Error ? error.message : 'unknown');
        setState('error');
      });
    return () => {
      alive = false;
    };
  }, [repository, attempt]);

  /** Optimistic write of both lists with rollback. */
  const write = useCallback(
    async (next: { events?: CalendarEvent[]; collabs?: EventCollab[] }, persist: () => Promise<void>) => {
      const previous = { events: eventsRef.current, collabs: collabsRef.current };
      if (next.events) {
        eventsRef.current = next.events;
        setEvents(next.events);
      }
      if (next.collabs) {
        collabsRef.current = next.collabs;
        setCollabs(next.collabs);
      }
      try {
        await persist();
      } catch (error) {
        eventsRef.current = previous.events;
        collabsRef.current = previous.collabs;
        setEvents(previous.events);
        setCollabs(previous.collabs);
        throw error;
      }
    },
    [],
  );

  /** Saves changed collaboration documents and keeps event participants in sync with members. */
  const saveCollabs = useCallback(
    async (changed: readonly EventCollab[]) => {
      if (changed.length === 0) return;
      const byId = new Map(changed.map((c) => [c.eventId, c]));
      const t = nowRef.current();
      const touched: CalendarEvent[] = [];
      const nextEvents = eventsRef.current.map((e) => {
        const c = byId.get(e.id);
        if (!c || sameMembers(e, c)) return e;
        const updated = { ...e, participantIds: memberIds(c), updatedAt: t };
        touched.push(updated);
        return updated;
      });
      await write(
        {
          collabs: collabsRef.current.map((c) => byId.get(c.eventId) ?? c),
          ...(touched.length > 0 ? { events: nextEvents } : {}),
        },
        async () => {
          for (const c of changed) await repository.upsertCollab(c);
          for (const e of touched) await repository.upsert(e);
        },
      );
    },
    [repository, write],
  );

  useSimulation({ enabled: simulate && state === 'ready', collabsRef, nowRef, save: saveCollabs });

  const value = useMemo<EventsContextValue>(() => {
    const find = (id: string) => eventsRef.current.find((e) => e.id === id);
    const baseEvent = (kind: CalendarEvent['kind'], t: Date) => ({
      id: newEventId(t),
      kind,
      timeZone: DEMO_TIME_ZONE,
      participantIds: [DEMO_VIEWER_ID],
      isDemo: false,
      createdAt: t,
    });
    return {
      state,
      events,
      collabs,
      timeZone: DEMO_TIME_ZONE,
      retry: () => {
        setState('loading');
        setAttempt((a) => a + 1);
      },
      getEvent: (id) => events.find((e) => e.id === id),
      getCollab: (id) => collabs.find((c) => c.eventId === id),
      async create(draft) {
        const t = nowRef.current();
        const event = applyDraft(baseEvent('appointment', t), draft, t);
        await write({ events: [...eventsRef.current, event] }, () => repository.upsert(event));
        return event.id;
      },
      async createSocial(draft, setup) {
        const t = nowRef.current();
        const event: CalendarEvent = {
          ...applyDraft(baseEvent('social', t), draft, t),
          hostId: DEMO_VIEWER_ID,
        };
        let collab = invite(emptyCollab(event.id, DEMO_VIEWER_ID), DEMO_VIEWER_ID, setup.inviteeIds, t);
        collab = {
          ...collab,
          tasks: setup.tasks.map((x, i) => ({
            id: `task-${i}`,
            title: x.title,
            ...(x.dueAt ? { dueAt: x.dueAt } : {}),
          })),
          bring: setup.bring.map((x, i) => ({ id: `item-${i}`, title: x.title, quantity: x.quantity, claims: [] })),
          ...(setup.template ? { template: setup.template } : {}),
        };
        collab = schedule(collab, simulateInviteReplies(event.id, setup.inviteeIds, t));
        const withMembers = { ...event, participantIds: memberIds(collab) };
        await write(
          { events: [...eventsRef.current, withMembers], collabs: [...collabsRef.current, collab] },
          async () => {
            await repository.upsert(withMembers);
            await repository.upsertCollab(collab);
          },
        );
        return event.id;
      },
      async update(id, draft) {
        const current = find(id);
        if (!current) throw new Error(`Event ${id} not found`);
        const event = applyDraft(current, draft, nowRef.current());
        await write({ events: eventsRef.current.map((e) => (e.id === id ? event : e)) }, () =>
          repository.upsert(event),
        );
      },
      async updateCollab(eventId, fn) {
        const current = collabsRef.current.find((c) => c.eventId === eventId);
        if (!current) throw new Error(`No collaboration data for ${eventId}`);
        const t = nowRef.current();
        const result = fn(current, t);
        const next = 'eventId' in result ? result : schedule(result.collab, result.simulate);
        if (next === current) return;
        await saveCollabs([next]);
      },
      async remove(id) {
        await write(
          {
            events: eventsRef.current.filter((e) => e.id !== id),
            collabs: collabsRef.current.filter((c) => c.eventId !== id),
          },
          () => repository.remove(id),
        );
      },
      async removeOccurrence(id, key) {
        const current = find(id);
        if (!current?.recurrence) throw new Error(`Event ${id} is not recurring`);
        const event: CalendarEvent = {
          ...current,
          recurrence: { ...current.recurrence, exdates: [...new Set([...(current.recurrence.exdates ?? []), key])] },
          updatedAt: nowRef.current(),
        };
        await write({ events: eventsRef.current.map((e) => (e.id === id ? event : e)) }, () =>
          repository.upsert(event),
        );
      },
      async resetExampleWorld() {
        const world = demoWorld(nowRef.current());
        await write(world, () => repository.replaceAll(world.events, world.collabs));
      },
    };
  }, [state, events, collabs, repository, write, saveCollabs]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside <EventsProvider>');
  return ctx;
}
