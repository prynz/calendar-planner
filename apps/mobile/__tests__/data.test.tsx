import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { buildDemoEvents } from '@nowish/demo';
import { announceLate, markLeft, newJourney, type EventDraft, type Journey } from '@nowish/domain';
import { createTranslator } from '@nowish/i18n';

import { createMemoryEventRepository } from '@/data/memory-event-repository';
import { deserializeEvent, serializeEvent } from '@/data/serialization';
import { MAX_SCHEDULED, planReminders } from '@/features/reminders/plan';
import { EventsProvider, useEvents } from '@/providers/events';

const NOW = new Date('2026-11-09T07:00:00Z');
const draft: EventDraft = {
  title: 'Physio',
  category: 'health',
  day: '2026-11-10',
  allDay: false,
  startMinute: 17 * 60,
  endMinute: 18 * 60,
  days: 1,
  location: 'Praxis',
  travel: { mode: 'walk', minutes: 10 },
  prepMinutes: 10,
  arrivalMarginMinutes: 5,
};

describe('serialization', () => {
  it('round-trips every demo event', () => {
    for (const e of buildDemoEvents(NOW)) expect(deserializeEvent(serializeEvent(e))).toEqual(e);
  });
  it('rejects corrupt rows instead of returning bad data', () => {
    const e = buildDemoEvents(NOW)[0];
    if (!e) throw new Error('no demo event');
    const raw = JSON.parse(serializeEvent(e)) as Record<string, unknown>;
    expect(() => deserializeEvent(JSON.stringify({ ...raw, start: 'yesterday' }))).toThrow(/start/);
    expect(() => deserializeEvent(JSON.stringify({ ...raw, category: 'party' }))).toThrow(/category/);
    expect(() => deserializeEvent('[]')).toThrow();
  });
});

describe('EventsProvider', () => {
  const setup = async (repo = createMemoryEventRepository()) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventsProvider repository={repo} now={() => NOW}>
        {children}
      </EventsProvider>
    );
    return { repo, ...(await renderHook(() => useEvents(), { wrapper })) };
  };

  it('seeds the example world on first start, then never again', async () => {
    const { result, repo } = await setup();
    await waitFor(() => expect(result.current.state).toBe('ready'));
    expect(result.current.events.length).toBe(buildDemoEvents(NOW).length);
    expect((await repo.load()).seeded).toBe(true);
  });

  it('keeps an emptied calendar empty after restart (seeded flag)', async () => {
    const { result } = await setup(createMemoryEventRepository([], true));
    await waitFor(() => expect(result.current.state).toBe('ready'));
    expect(result.current.events).toHaveLength(0);
  });

  it('creates, updates and deletes – persisted', async () => {
    const { result, repo } = await setup(createMemoryEventRepository([], true));
    await waitFor(() => expect(result.current.state).toBe('ready'));
    let id = '';
    await act(async () => {
      id = await result.current.create(draft);
    });
    expect(result.current.getEvent(id)).toMatchObject({ title: 'Physio', isDemo: false });
    await act(async () => {
      await result.current.update(id, { ...draft, title: 'Physiotherapie' });
    });
    expect((await repo.load()).events[0]?.title).toBe('Physiotherapie');
    await act(async () => {
      await result.current.remove(id);
    });
    expect((await repo.load()).events).toHaveLength(0);
  });

  it('hides one occurrence of a series', async () => {
    const { result } = await setup(createMemoryEventRepository(buildDemoEvents(NOW), true));
    await waitFor(() => expect(result.current.state).toBe('ready'));
    await act(async () => {
      await result.current.removeOccurrence('demo-football', '2026-11-10');
    });
    expect(result.current.getEvent('demo-football')?.recurrence?.exdates).toEqual(['2026-11-10']);
  });

  it('rolls back and reports when a write fails', async () => {
    const repo = createMemoryEventRepository([], true);
    const { result } = await setup(repo);
    await waitFor(() => expect(result.current.state).toBe('ready'));
    repo.failNext = true;
    await act(async () => {
      await expect(result.current.create(draft)).rejects.toThrow('simulated write failure');
    });
    expect(result.current.events).toHaveLength(0);
  });

  it('shows an error state when loading fails and recovers on retry', async () => {
    const repo = createMemoryEventRepository([], true);
    const realLoad = repo.load;
    let fail = true;
    repo.load = () => (fail ? Promise.reject(new Error('disk')) : realLoad());
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { result } = await setup(repo);
    await waitFor(() => expect(result.current.state).toBe('error'));
    fail = false;
    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.state).toBe('ready'));
  });
});

describe('planReminders', () => {
  const t = createTranslator('de');
  const events = buildDemoEvents(NOW);
  const base = {
    events,
    journeys: [] as Journey[],
    now: NOW,
    timeZone: 'Europe/Berlin',
    intensity: 'normal' as const,
    tone: 'casual' as const,
    bufferMinutes: 5,
    locale: 'de' as const,
    t,
  };

  it('plans stages per intensity with readable texts', () => {
    const plan = planReminders(base);
    const games = plan.filter((r) => r.eventId === 'demo-games');
    expect(games.map((r) => r.stage)).toEqual(['get-ready', 'leave-soon', 'leave-now']);
    expect(games[2]).toMatchObject({
      title: 'Jetzt los 🏃',
      body: 'Dann bist du um 19:00 bei Spieleabend bei Olivia.',
    });
    expect(new Set(plan.map((r) => r.id)).size).toBe(plan.length);
  });

  it('never plans more than the iOS-safe maximum and skips past stages', () => {
    const games = events.find((e) => e.id === 'demo-games');
    if (!games) throw new Error('demo game night missing');
    const many = Array.from({ length: 40 }, (_, i) => ({ ...games, id: `copy-${i}` }));
    const plan = planReminders({ ...base, events: many, intensity: 'firm' });
    expect(plan).toHaveLength(MAX_SCHEDULED);
    expect(plan.every((r) => r.at.getTime() > NOW.getTime())).toBe(true);
  });

  it('speaks in the chosen tone', () => {
    const firm = planReminders({ ...base, tone: 'firm' }).filter((r) => r.eventId === 'demo-games');
    expect(firm[2]?.title).toBe('JETZT los! 🏃');
  });

  it('stops after "on my way" and drops the check-in after a delay notice', () => {
    const planned = planReminders({ ...base, intensity: 'firm' }).find((r) => r.eventId === 'demo-games');
    if (!planned) throw new Error('no reminder');
    const j = newJourney('demo-games', planned.occurrenceKey, planned.plannedLeaveAt);
    const left = planReminders({ ...base, intensity: 'firm', journeys: [markLeft(j, NOW)] });
    expect(left.some((r) => r.eventId === 'demo-games')).toBe(false);
    const late = planReminders({ ...base, intensity: 'firm', journeys: [announceLate(j, 10, NOW)] });
    expect(late.filter((r) => r.eventId === 'demo-games').map((r) => r.stage)).toEqual([
      'get-ready',
      'leave-soon',
      'leave-now',
    ]);
  });
});
