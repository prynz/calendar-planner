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

import { DEMO_TIME_ZONE, DEMO_VIEWER_ID, simulateInviteReplies } from '@nowish/demo';
import {
  applyDraft,
  applyDueActions,
  applyDueFamilyActions,
  applyDueGroupActions,
  emptyCollab,
  forgetEvent,
  invite,
  memberIds,
  removeMeeting,
  schedule,
  scheduleFamily,
  scheduleGroup,
  type CalendarEvent,
  type DayKey,
  type EventCollab,
  type EventDraft,
  type FamilyAction,
  type Group,
  type GroupAction,
  type Household,
  type Journey,
  type SimulatedAction,
} from '@nowish/domain';

import type { EventRepository } from '@/data/event-repository';

import { useSimulation } from './simulation';
import { demoWorld, loadWorld } from './world-load';

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

/** Pure family operation (domain `family/*`), optionally queueing simulated reactions. */
export type HouseholdUpdate = (
  household: Household,
  now: Date,
) => Household | { household: Household; simulate: FamilyAction[] };

/** Pure group operation (domain `groups/*`); null = the group is gone (last member left). */
export type GroupUpdate = (group: Group, now: Date) => Group | null | { group: Group; simulate: GroupAction[] };

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
  /** The viewer's private departure history (Phase 4). */
  journeys: readonly Journey[];
  getJourney: (id: string) => Journey | undefined;
  saveJourney: (journey: Journey) => Promise<void>;
  clearJourneys: () => Promise<void>;
  /** Family space (Phase 5); null until one exists. */
  household: Household | null;
  saveHousehold: (household: Household) => Promise<void>;
  updateHousehold: (fn: HouseholdUpdate) => Promise<void>;
  groups: readonly Group[];
  getGroup: (id: string) => Group | undefined;
  /** Adds a new group (built by the domain's `createGroup`). */
  addGroup: (group: Group) => Promise<void>;
  updateGroup: (id: string, fn: GroupUpdate) => Promise<void>;
  /** Privacy centre "delete all data": an empty local store (the example world can be restored in settings). */
  deleteAll: () => Promise<void>;
  /** ICS import: new or replaced events in one go (CAL-09). */
  importEvents: (events: readonly CalendarEvent[]) => Promise<void>;
}

const EventsContext = createContext<EventsContextValue | null>(null);

/** Local ids – unique per device, enough for the prototype (server ids replace them in block B). */
export function newEventId(now: Date): string {
  return `evt-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [household, setHousehold] = useState<Household | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [attempt, setAttempt] = useState(0);
  const eventsRef = useRef(events);
  const collabsRef = useRef(collabs);
  const journeysRef = useRef(journeys);
  const householdRef = useRef(household);
  const groupsRef = useRef(groups);
  const nowRef = useRef(now);
  useLayoutEffect(() => {
    eventsRef.current = events;
    collabsRef.current = collabs;
    journeysRef.current = journeys;
    householdRef.current = household;
    groupsRef.current = groups;
    nowRef.current = now;
  });

  useEffect(() => {
    let alive = true;
    loadWorld(repository, nowRef.current())
      .then((world) => {
        if (!alive) return;
        setEvents(world.events);
        setCollabs(world.collabs);
        setJourneys(world.journeys);
        setHousehold(world.household);
        setGroups(world.groups);
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

  /** Optimistic local update with rollback for one of the single-document stores. */
  const writeDoc = useCallback(
    async <T,>(ref: { current: T }, set: (v: T) => void, next: T, persist: () => Promise<void>) => {
      const previous = ref.current;
      ref.current = next;
      set(next);
      try {
        await persist();
      } catch (error) {
        ref.current = previous;
        set(previous);
        throw error;
      }
    },
    [],
  );

  const saveHousehold = useCallback(
    (h: Household) => writeDoc(householdRef, setHousehold, h, () => repository.upsertHousehold(h)),
    [repository, writeDoc],
  );

  const saveGroup = useCallback(
    (g: Group) =>
      writeDoc(
        groupsRef,
        setGroups,
        groupsRef.current.some((x) => x.id === g.id)
          ? groupsRef.current.map((x) => (x.id === g.id ? g : x))
          : [...groupsRef.current, g],
        () => repository.upsertGroup(g),
      ),
    [repository, writeDoc],
  );

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

  /** One simulation tick: due actions of demo people in events, the family and groups. */
  const step = useCallback(
    (t: Date): Promise<void> | null => {
      const due = (pending: readonly { at: Date }[]) => pending.some((a) => a.at.getTime() <= t.getTime());
      const collabs = collabsRef.current.filter((c) => due(c.pending)).map((c) => applyDueActions(c, t).collab);
      const h = householdRef.current;
      const household = h && due(h.pending) ? applyDueFamilyActions(h, t).household : null;
      const groups = groupsRef.current.filter((g) => due(g.pending)).map((g) => applyDueGroupActions(g, t).group);
      if (collabs.length === 0 && !household && groups.length === 0) return null;
      return (async () => {
        if (collabs.length > 0) await saveCollabs(collabs);
        if (household) await saveHousehold(household);
        for (const g of groups) await saveGroup(g);
      })();
    },
    [saveCollabs, saveHousehold, saveGroup],
  );

  useSimulation({ enabled: simulate && state === 'ready', nowRef, step });

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
        // Assignments, rides and group links of the deleted event go with it.
        const h = householdRef.current;
        if (h) {
          const next = forgetEvent(h, id);
          if (next !== h) await saveHousehold(next);
        }
        for (const g of groupsRef.current) {
          const next = removeMeeting(g, id);
          if (next !== g) await saveGroup(next);
        }
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
        const previous = { journeys: journeysRef.current, household: householdRef.current, groups: groupsRef.current };
        const apply = (v: typeof previous) => {
          journeysRef.current = v.journeys;
          householdRef.current = v.household;
          groupsRef.current = v.groups;
          setJourneys(v.journeys);
          setHousehold(v.household);
          setGroups(v.groups);
        };
        apply(world);
        await write(world, () => repository.replaceAll(world)).catch((error: unknown) => {
          apply(previous);
          throw error;
        });
      },
      journeys,
      getJourney: (id) => journeys.find((j) => j.id === id),
      async saveJourney(journey) {
        const previous = journeysRef.current;
        const next = [...previous.filter((j) => j.id !== journey.id), journey];
        journeysRef.current = next;
        setJourneys(next);
        try {
          await repository.upsertJourney(journey);
        } catch (error) {
          journeysRef.current = previous;
          setJourneys(previous);
          throw error;
        }
      },
      async clearJourneys() {
        const previous = journeysRef.current;
        journeysRef.current = [];
        setJourneys([]);
        try {
          await repository.clearJourneys();
        } catch (error) {
          journeysRef.current = previous;
          setJourneys(previous);
          throw error;
        }
      },
      household,
      saveHousehold,
      async updateHousehold(fn) {
        const current = householdRef.current;
        if (!current) throw new Error('No household yet');
        const result = fn(current, nowRef.current());
        const next = 'household' in result ? scheduleFamily(result.household, result.simulate) : result;
        if (next === current) return;
        await saveHousehold(next);
      },
      groups,
      getGroup: (id) => groups.find((g) => g.id === id),
      addGroup: saveGroup,
      async updateGroup(id, fn) {
        const current = groupsRef.current.find((g) => g.id === id);
        if (!current) throw new Error(`Group ${id} not found`);
        const result = fn(current, nowRef.current());
        if (result === null) {
          await writeDoc(
            groupsRef,
            setGroups,
            groupsRef.current.filter((g) => g.id !== id),
            () => repository.removeGroup(id),
          );
          return;
        }
        const next = 'memberIds' in result ? result : scheduleGroup(result.group, result.simulate);
        if (next === current) return;
        await saveGroup(next);
      },
      async deleteAll() {
        const empty = { events: [], collabs: [], journeys: [], household: null, groups: [] };
        await repository.replaceAll(empty);
        eventsRef.current = [];
        collabsRef.current = [];
        journeysRef.current = [];
        householdRef.current = null;
        groupsRef.current = [];
        setEvents([]);
        setCollabs([]);
        setJourneys([]);
        setHousehold(null);
        setGroups([]);
      },
      async importEvents(imported) {
        if (imported.length === 0) return;
        const byId = new Map(imported.map((e) => [e.id, e]));
        const next = [...eventsRef.current.filter((e) => !byId.has(e.id)), ...imported];
        await write({ events: next }, async () => {
          for (const e of imported) await repository.upsert(e);
        });
      },
    };
  }, [
    state,
    events,
    collabs,
    journeys,
    household,
    groups,
    repository,
    write,
    writeDoc,
    saveCollabs,
    saveHousehold,
    saveGroup,
  ]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside <EventsProvider>');
  return ctx;
}
