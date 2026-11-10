import { act, fireEvent, renderHook, screen, waitFor, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { buildDemoCollabs, buildDemoEvents } from '@nowish/demo';
import { CollabError, EVENT_TEMPLATES, respond, rsvpSummary, type EventDraft } from '@nowish/domain';
import { de, en } from '@nowish/i18n';

import { deserializeCollab, serializeCollab } from '@/data/collab-serialization';
import { createMemoryEventRepository } from '@/data/memory-event-repository';
import { BringScreen } from '@/features/collab/BringScreen';
import { ChatScreen } from '@/features/collab/ChatScreen';
import { GuestsScreen } from '@/features/collab/GuestsScreen';
import { PollScreen } from '@/features/collab/PollScreen';
import { TasksScreen } from '@/features/collab/TasksScreen';
import { EventDetailScreen } from '@/features/detail/EventDetailScreen';
import { EditorScreen } from '@/features/editor/EditorScreen';
import { TemplatesScreen } from '@/features/templates/TemplatesScreen';
import { EventsProvider, useEvents } from '@/providers/events';
import { SIMULATION_TICK_MS } from '@/providers/simulation';

import { NOW, renderApp, router } from './test-utils';

const events = buildDemoEvents(NOW);
const collabs = buildDemoCollabs(events, NOW);

beforeEach(() => {
  router.push.mockClear();
  router.back.mockClear();
  router.replace.mockClear();
});

describe('template texts', () => {
  it('exist in German and English for every template part', () => {
    for (const tpl of EVENT_TEMPLATES) {
      const keys = [
        `template.${tpl.id}.title`,
        `template.${tpl.id}.description`,
        ...tpl.tasks.map((x) => `template.${tpl.id}.task.${x.key}`),
        ...tpl.bring.map((x) => `template.${tpl.id}.bring.${x.key}`),
      ];
      for (const k of keys) {
        expect(Object.keys(de)).toContain(k);
        expect(Object.keys(en)).toContain(k);
      }
    }
  });
});

describe('collab serialization', () => {
  it('round-trips every demo document', () => {
    for (const c of collabs) expect(deserializeCollab(serializeCollab(c))).toEqual(c);
  });
  it('rejects corrupt documents', () => {
    const raw = JSON.parse(serializeCollab(collabs[0]!)) as Record<string, unknown>;
    expect(() => deserializeCollab(JSON.stringify({ ...raw, invitations: [{ personId: 1 }] }))).toThrow();
    expect(() => deserializeCollab(JSON.stringify({ ...raw, pending: [{ type: 'dance' }] }))).toThrow();
  });
});

const draft: EventDraft = {
  title: 'Pizzaabend',
  category: 'social',
  day: '2026-11-13',
  allDay: false,
  startMinute: 19 * 60,
  endMinute: 22 * 60,
  days: 1,
  location: '',
  prepMinutes: 15,
  arrivalMarginMinutes: 0,
};

describe('EventsProvider with collaboration data', () => {
  const setup = async (repo = createMemoryEventRepository(), now: () => Date = () => NOW, simulate = false) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventsProvider repository={repo} now={now} simulate={simulate}>
        {children}
      </EventsProvider>
    );
    const hook = await renderHook(() => useEvents(), { wrapper });
    await waitFor(() => expect(hook.result.current.state).toBe('ready'));
    return { repo, ...hook };
  };

  it('seeds collaboration data together with the example world', async () => {
    const { result, repo } = await setup();
    expect(result.current.collabs).toHaveLength(collabs.length);
    expect((await repo.load()).collabSeeded).toBe(true);
  });

  it('adds collaboration data once on devices that ran the Phase 2 prototype', async () => {
    const { result, repo } = await setup(createMemoryEventRepository(events, true));
    expect(result.current.getCollab('demo-bbq')?.polls).toHaveLength(1);
    expect((await repo.load()).collabSeeded).toBe(true);
  });

  it('creates a hosted social event with invitations, template content and queued demo replies', async () => {
    const { result, repo } = await setup(createMemoryEventRepository([], true));
    let id = '';
    await act(async () => {
      id = await result.current.createSocial(draft, {
        inviteeIds: ['tom', 'mia'],
        tasks: [{ title: 'Teig machen' }],
        bring: [{ title: 'Getränke', quantity: 4 }],
        template: { id: 'game-night', version: 1 },
      });
    });
    const saved = await repo.load();
    expect(saved.events[0]).toMatchObject({ kind: 'social', hostId: 'chris', participantIds: ['chris', 'tom', 'mia'] });
    expect(saved.collabs[0]).toMatchObject({ eventId: id, template: { id: 'game-night' } });
    expect(saved.collabs[0]?.pending.map((a) => a.personId).sort()).toEqual(['mia', 'tom']);
  });

  it('plays due demo actions on the simulation tick', async () => {
    jest.useFakeTimers();
    let now = NOW;
    try {
      const { result } = await setup(createMemoryEventRepository(events, true, collabs), () => now, true);
      expect(rsvpSummary(result.current.getCollab('demo-movie-night')!, now).yes).toBe(1);
      now = new Date(NOW.getTime() + 60_000);
      await act(async () => {
        jest.advanceTimersByTime(SIMULATION_TICK_MS);
      });
      await waitFor(() => expect(result.current.getCollab('demo-movie-night')?.pending).toHaveLength(0));
      expect(rsvpSummary(result.current.getCollab('demo-movie-night')!, now)).toMatchObject({ yes: 2, no: 1 });
    } finally {
      jest.useRealTimers();
    }
  });

  it('rolls back on write failure and passes domain errors through', async () => {
    const repo = createMemoryEventRepository(events, true, collabs);
    const { result } = await setup(repo);
    repo.failNext = true;
    await expect(
      act(() => result.current.updateCollab('demo-tom-party', (c, t) => respond(c, 'chris', 'yes', t))),
    ).rejects.toThrow('simulated write failure');
    expect(result.current.getCollab('demo-tom-party')?.invitations[0]?.answer).toBeUndefined();
    await expect(
      act(() => result.current.updateCollab('demo-tom-party', (c, t) => respond(c, 'nobody', 'yes', t))),
    ).rejects.toBeInstanceOf(CollabError);
  });

  it('removes the collaboration document with its event', async () => {
    const repo = createMemoryEventRepository(events, true, collabs);
    const { result } = await setup(repo);
    await act(() => result.current.remove('demo-bbq'));
    expect((await repo.load()).collabs.some((c) => c.eventId === 'demo-bbq')).toBe(false);
  });
});

describe('event detail (social)', () => {
  it('answers an invitation and shows the bento overview', async () => {
    const { repo } = await renderApp(<EventDetailScreen eventId="demo-tom-party" occurrence="2026-11-12" />);
    expect(await screen.findByText('Tom lädt dich ein')).toBeTruthy();
    for (const id of ['tile-guests', 'tile-poll', 'tile-bring', 'tile-tasks', 'tile-chat'])
      expect(screen.getByTestId(id)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('rsvp-yes'));
    await waitFor(async () =>
      expect((await repo.load()).collabs.find((c) => c.eventId === 'demo-tom-party')?.invitations[0]?.answer).toBe(
        'yes',
      ),
    );
    expect(within(screen.getByTestId('tile-chat')).getByText('Du bist dabei 🎉')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('tile-chat'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/event/[id]/[section]',
      params: { id: 'demo-tom-party', section: 'chat' },
    });
  });
});

describe('collaboration screens', () => {
  it('guests: lists answers and lets the host invite more', async () => {
    const { repo } = await renderApp(<GuestsScreen eventId="demo-movie-night" />);
    expect(await screen.findByTestId('guests-summary')).toHaveTextContent('1 dabei · 1 vielleicht · 2 offen');
    await fireEvent.press(screen.getByTestId('invite-jonas'));
    await fireEvent.press(screen.getByTestId('invite-submit'));
    await waitFor(async () => {
      const saved = await repo.load();
      expect(saved.collabs.find((c) => c.eventId === 'demo-movie-night')?.invitations.map((i) => i.personId)).toContain(
        'jonas',
      );
      expect(saved.events.find((e) => e.id === 'demo-movie-night')?.participantIds).toContain('jonas');
    });
  });

  it('poll: votes with the buttons (swipe alternative) and shows results', async () => {
    const { repo } = await renderApp(<PollScreen eventId="demo-bbq" />);
    expect(await screen.findByTestId('poll-deck')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('poll-deck-yes'));
    await fireEvent.press(await screen.findByTestId('poll-deck-if-needed'));
    await waitFor(async () =>
      expect((await repo.load()).collabs.find((c) => c.eventId === 'demo-bbq')?.polls[0]?.votes.chris).toEqual({
        'bbq-p1-o0': 'yes',
        'bbq-p1-o1': 'if-needed',
      }),
    );
    expect(screen.queryByTestId('poll-deck')).toBeNull();
    expect(screen.getByTestId('poll-results')).toBeTruthy();
  });

  it('poll: the host decides and the choice is announced in the chat', async () => {
    const { repo } = await renderApp(<PollScreen eventId="demo-movie-night" />);
    await fireEvent.press(await screen.findByTestId('poll-choose-movie-p1-o1'));
    await waitFor(async () => {
      const c = (await repo.load()).collabs.find((x) => x.eventId === 'demo-movie-night');
      expect(c?.polls[0]?.chosenOptionId).toBe('movie-p1-o1');
      expect(c?.messages.at(-1)).toMatchObject({ type: 'system', note: { kind: 'poll-decided' } });
    });
    expect(await screen.findByText('Festgelegt: Science-Fiction')).toBeTruthy();
  });

  it('bring list: claims never exceed what is needed', async () => {
    const { repo } = await renderApp(<BringScreen eventId="demo-bbq" />);
    await fireEvent.press(await screen.findByTestId('bring-claim-bbq-b3-inc')); // charcoal: 1 of 1 taken
    expect(screen.getByTestId('bring-claim-bbq-b3-value')).toHaveTextContent('0');
    await fireEvent.press(screen.getByTestId('bring-claim-bbq-b2-inc'));
    await waitFor(async () =>
      expect(
        (await repo.load()).collabs.find((c) => c.eventId === 'demo-bbq')?.bring.find((i) => i.id === 'bbq-b2')?.claims,
      ).toEqual([{ personId: 'chris', quantity: 1 }]),
    );
  });

  it('bring list: hints at duplicates before adding', async () => {
    await renderApp(<BringScreen eventId="demo-bbq" />);
    await fireEvent.changeText(await screen.findByTestId('bring-new-title'), 'Salate');
    expect(screen.getByTestId('bring-similar')).toHaveTextContent(/ähnlich: Salat/);
  });

  it('tasks: take a free task, then mark it done', async () => {
    const { repo } = await renderApp(<TasksScreen eventId="demo-tom-party" />);
    await fireEvent.press(await screen.findByTestId('task-take-party-t1'));
    await fireEvent.press(await screen.findByTestId('task-toggle-party-t1'));
    await waitFor(async () =>
      expect(
        (await repo.load()).collabs.find((c) => c.eventId === 'demo-tom-party')?.tasks.find((x) => x.id === 'party-t1'),
      ).toMatchObject({ assigneeId: 'chris', doneAt: NOW }),
    );
    expect(screen.getByTestId('tasks-progress')).toHaveTextContent('1 von 2 erledigt');
  });

  it('tasks: someone else’s task cannot be ticked off', async () => {
    await renderApp(<TasksScreen eventId="demo-tom-party" />);
    const toggle = await screen.findByTestId('task-toggle-party-t2');
    expect(toggle.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('chat: sends a message and queues one demo reply', async () => {
    const { repo } = await renderApp(<ChatScreen eventId="demo-games" />);
    await fireEvent.changeText(await screen.findByTestId('chat-input'), 'Ich bring Kekse mit');
    await fireEvent.press(screen.getByTestId('chat-send'));
    await waitFor(async () => {
      const c = (await repo.load()).collabs.find((x) => x.eventId === 'demo-games');
      expect(c?.messages.at(-1)).toMatchObject({ authorId: 'chris', body: 'Ich bring Kekse mit' });
      expect(c?.pending.filter((a) => a.type === 'message')).toHaveLength(1);
    });
    expect(screen.getByText('Ich bring Kekse mit')).toBeTruthy();
  });

  it('shows not-found for unknown events', async () => {
    await renderApp(<TasksScreen eventId="nope" />);
    expect(await screen.findByTestId('collab-not-found')).toBeTruthy();
  });
});

describe('creating events', () => {
  it('templates open the editor prefilled', async () => {
    await renderApp(<TemplatesScreen />);
    await fireEvent.press(await screen.findByTestId('template-bbq'));
    expect(router.replace).toHaveBeenCalledWith({ pathname: '/editor', params: { kind: 'social', template: 'bbq' } });
  });

  it('editor: a template event with invitees and unticked content', async () => {
    const repo = createMemoryEventRepository([], true);
    await renderApp(<EditorScreen social templateId="bbq" />, { repo });
    expect(await screen.findByDisplayValue('Grillen')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('editor-invite-olivia'));
    await fireEvent(screen.getByTestId('editor-tpl-bring-charcoal'), 'valueChange', false);
    await fireEvent.press(screen.getByTestId('editor-save'));
    await waitFor(() => expect(router.back).toHaveBeenCalled());
    const saved = await repo.load();
    expect(saved.events[0]).toMatchObject({ kind: 'social', title: 'Grillen', category: 'social' });
    const c = saved.collabs[0];
    expect(c?.invitations.map((i) => i.personId)).toEqual(['olivia']);
    expect(c?.tasks.map((x) => x.title)).toEqual(['Grill checken', 'Einkaufen']);
    expect(c?.bring.map((x) => x.title)).toEqual(['Grillgut', 'Salat', 'Getränke']);
  });
});

describe('detail tiles', () => {
  it('summarise the bring list, tasks and chat', async () => {
    await renderApp(<EventDetailScreen eventId="demo-games" occurrence="2026-11-09" />);
    expect(within(await screen.findByTestId('tile-bring')).getByText('1 von 3 vergeben')).toBeTruthy();
    expect(within(screen.getByTestId('tile-tasks')).getByText('1 von 2 erledigt')).toBeTruthy();
    expect(within(screen.getByTestId('tile-chat')).getByText('2 Nachrichten')).toBeTruthy();
  });
});
