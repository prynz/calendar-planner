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

import { buildDemoEvents, DEMO_TIME_ZONE, DEMO_VIEWER_ID } from '@nowish/demo';
import { applyDraft, type CalendarEvent, type DayKey, type EventDraft } from '@nowish/domain';

import type { EventRepository } from '@/data/event-repository';

export type EventsState = 'loading' | 'ready' | 'error';

interface EventsContextValue {
  state: EventsState;
  events: readonly CalendarEvent[];
  /** Zone new events are created in (device zone in block B; demo zone in the prototype). */
  timeZone: string;
  retry: () => void;
  getEvent: (id: string) => CalendarEvent | undefined;
  create: (draft: EventDraft) => Promise<string>;
  update: (id: string, draft: EventDraft) => Promise<void>;
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

/**
 * Holds all events in memory (prototype scale: hundreds, not millions) and writes through to the
 * repository. Writes are optimistic; on failure the previous state is restored and the error rethrown
 * so the screen can tell the user.
 */
export function EventsProvider({
  repository,
  children,
  now = () => new Date(),
}: {
  repository: EventRepository;
  children: ReactNode;
  now?: () => Date;
}) {
  const [state, setState] = useState<EventsState>('loading');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [attempt, setAttempt] = useState(0);
  const eventsRef = useRef(events);
  const nowRef = useRef(now);
  useLayoutEffect(() => {
    eventsRef.current = events;
    nowRef.current = now;
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      const loaded = await repository.load();
      if (loaded.seeded) return loaded.events;
      const seed = buildDemoEvents(nowRef.current(), DEMO_TIME_ZONE);
      await repository.replaceAll(seed);
      return seed;
    })()
      .then((list) => {
        if (!alive) return;
        setEvents(list);
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

  /** Optimistic write with rollback. */
  const write = useCallback(async (next: CalendarEvent[], persist: () => Promise<void>) => {
    const previous = eventsRef.current;
    setEvents(next);
    try {
      await persist();
    } catch (error) {
      setEvents(previous);
      throw error;
    }
  }, []);

  const value = useMemo<EventsContextValue>(() => {
    const find = (id: string) => eventsRef.current.find((e) => e.id === id);
    return {
      state,
      events,
      timeZone: DEMO_TIME_ZONE,
      retry: () => {
        setState('loading');
        setAttempt((a) => a + 1);
      },
      getEvent: (id) => events.find((e) => e.id === id),
      async create(draft) {
        const t = nowRef.current();
        const event = applyDraft(
          {
            id: newEventId(t),
            kind: 'appointment',
            timeZone: DEMO_TIME_ZONE,
            participantIds: [DEMO_VIEWER_ID],
            isDemo: false,
            createdAt: t,
          },
          draft,
          t,
        );
        await write([...eventsRef.current, event], () => repository.upsert(event));
        return event.id;
      },
      async update(id, draft) {
        const current = find(id);
        if (!current) throw new Error(`Event ${id} not found`);
        const event = applyDraft(current, draft, nowRef.current());
        await write(
          eventsRef.current.map((e) => (e.id === id ? event : e)),
          () => repository.upsert(event),
        );
      },
      async remove(id) {
        await write(
          eventsRef.current.filter((e) => e.id !== id),
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
        await write(
          eventsRef.current.map((e) => (e.id === id ? event : e)),
          () => repository.upsert(event),
        );
      },
      async resetExampleWorld() {
        const seed = buildDemoEvents(nowRef.current(), DEMO_TIME_ZONE);
        await write(seed, () => repository.replaceAll(seed));
      },
    };
  }, [state, events, repository, write]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside <EventsProvider>');
  return ctx;
}
