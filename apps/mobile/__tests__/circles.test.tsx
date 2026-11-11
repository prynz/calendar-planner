import { act, fireEvent, renderHook, screen, waitFor, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { buildDemoCollabs, buildDemoEvents, buildDemoGroups, buildDemoHousehold } from '@nowish/demo';
import { assignedTo, exportIcs } from '@nowish/domain';
import { demoPurchase } from '@nowish/entitlements';

import {
  deserializeGroup,
  deserializeHousehold,
  serializeGroup,
  serializeHousehold,
} from '@/data/circles-serialization';
import { createMemoryEventRepository } from '@/data/memory-event-repository';
import { EditorScreen } from '@/features/editor/EditorScreen';
import { FamilyRoute } from '@/features/family/FamilyRoute';
import { GroupChatScreen } from '@/features/groups/GroupChatScreen';
import { GroupNewScreen } from '@/features/groups/GroupNewScreen';
import { GroupScreen } from '@/features/groups/GroupScreen';
import { CalendarFileSettings } from '@/features/settings/CalendarFileSettings';
import { IcsImportScreen } from '@/features/settings/IcsImportScreen';
import { TogetherScreen } from '@/features/together/TogetherScreen';
import { EventsProvider, useEvents } from '@/providers/events';

import { onboardedAccount } from '@/providers/account';

import { NOW, renderApp, routeParams, router, seededRepo } from './test-utils';

const events = buildDemoEvents(NOW);
const press = async (id: string) => fireEvent.press(await screen.findByTestId(id));

describe('family and group storage', () => {
  it('round-trips the demo household and groups', () => {
    const h = buildDemoHousehold(events, NOW);
    expect(deserializeHousehold(serializeHousehold(h))).toEqual(h);
    for (const g of buildDemoGroups(events, NOW)) expect(deserializeGroup(serializeGroup(g))).toEqual(g);
    expect(() =>
      deserializeHousehold(JSON.stringify({ ...h, kids: [{ id: 'x', name: 'X', color: 'red' }] })),
    ).toThrow();
  });

  const setup = async (repo = seededRepo()) => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <EventsProvider repository={repo} now={() => NOW} simulate={false}>
        {children}
      </EventsProvider>
    );
    const r = await renderHook(() => useEvents(), { wrapper });
    await waitFor(() => expect(r.result.current.state).toBe('ready'));
    return { repo, ...r };
  };

  it('adds the family, groups and their events once to a device from an older prototype', async () => {
    const old = events.filter((e) => !['demo-swim', 'demo-paul-doctor', 'demo-stammtisch', 'demo-run'].includes(e.id));
    const repo = createMemoryEventRepository(old, true, buildDemoCollabs(old, NOW), [], true, { seeded: false });
    const { result } = await setup(repo);
    expect(result.current.household?.kids.map((k) => k.name)).toEqual(['Lena', 'Paul']);
    expect(result.current.groups.map((g) => g.id)).toEqual(['demo-group-regulars', 'demo-group-run']);
    expect(result.current.getEvent('demo-stammtisch')?.recurrence?.byNthWeekday).toEqual({ weekday: 4, nth: 1 });
    expect(result.current.getCollab('demo-run')?.hostId).toBe('chris');
    const loaded = await repo.load();
    expect(loaded.circlesSeeded).toBe(true);
    expect(loaded.events).toHaveLength(events.length);
  });

  it('forgets assignments, rides and group links of a deleted event', async () => {
    const { result } = await setup();
    expect(assignedTo(result.current.household!, 'demo-swim')).toEqual(['lena']);
    await act(() => result.current.remove('demo-swim'));
    expect(assignedTo(result.current.household!, 'demo-swim')).toEqual([]);
    expect(result.current.household!.rides).toEqual([]);
    await act(() => result.current.remove('demo-run'));
    expect(result.current.getGroup('demo-group-run')?.meetingIds).toEqual([]);
  });

  it('rolls a failed family write back and rethrows', async () => {
    const { result, repo } = await setup();
    repo.failNext = true;
    const before = result.current.household;
    await expect(act(() => result.current.updateHousehold((h) => ({ ...h, shopping: [] })))).rejects.toThrow(
      'simulated write failure',
    );
    expect(result.current.household).toBe(before);
  });

  it('removes a group when its last member leaves', async () => {
    const { result, repo } = await setup();
    await act(() => result.current.updateGroup('demo-group-run', () => null));
    expect(result.current.getGroup('demo-group-run')).toBeUndefined();
    expect((await repo.load()).groups.map((g) => g.id)).toEqual(['demo-group-regulars']);
  });
});

describe('Together tab – family', () => {
  it('shows members, the family week, open rides, today’s chores and the shopping list', async () => {
    routeParams.section = 'family';
    await renderApp(<TogetherScreen />);
    expect(await screen.findByTestId('screen-family')).toBeTruthy();
    for (const name of ['Du', 'Sam', 'Lena', 'Paul'])
      expect(within(screen.getByTestId('family-members')).getByText(name)).toBeTruthy();
    expect(screen.getByTestId('family-rides-summary')).toHaveTextContent('3 Fahrten sind noch offen');
    expect(screen.getByTestId('family-chores')).toHaveTextContent(/Spülmaschine ausräumen/);
    expect(screen.getByTestId('family-shopping-card')).toHaveTextContent(/3 Sachen offen/);
    await press('together-groups');
    expect(router.setParams).toHaveBeenCalledWith({ section: 'groups' });
  });

  it('ticks today’s chore for whoever’s turn it is', async () => {
    routeParams.section = 'family';
    await renderApp(<TogetherScreen />);
    const row = await screen.findByTestId('chore-chore-dishes');
    expect(row).toHaveTextContent(/ist dran|Du bist dran/);
    await fireEvent.press(row);
    await waitFor(() => expect(screen.getByTestId('chore-chore-dishes')).toHaveTextContent(/Erledigt ✓/));
  });

  it('offers to create a family space when there is none', async () => {
    routeParams.section = 'family';
    await renderApp(<TogetherScreen />, { repo: createMemoryEventRepository(events, true) });
    await press('family-create');
    expect(await screen.findByTestId('family-members')).toBeTruthy();
  });
});

describe('rides', () => {
  it('warns about the viewer’s own appointment and asks Sam instead', async () => {
    routeParams.section = 'rides';
    await renderApp(<FamilyRoute />);
    expect(await screen.findByTestId('ride-conflict-demo-paul-doctor-drop-off')).toHaveTextContent(
      'Achtung: Du hast da „Wohnungsbesichtigung“ (10:00).',
    );
    await press('ride-ask-demo-paul-doctor-drop-off');
    await waitFor(() =>
      expect(screen.getByTestId('ride-status-demo-paul-doctor-drop-off')).toHaveTextContent('Angefragt bei Sam …'),
    );
    await press('ride-take-demo-swim-pick-up');
    await waitFor(() => expect(screen.getByTestId('ride-status-demo-swim-pick-up')).toHaveTextContent('Du fährst'));
  });
});

describe('shopping and members', () => {
  it('adds and ticks an item', async () => {
    routeParams.section = 'shopping';
    await renderApp(<FamilyRoute />);
    await fireEvent.changeText(await screen.findByTestId('shopping-title'), 'Eier');
    await fireEvent.changeText(screen.getByTestId('shopping-note'), '10 Stück');
    await press('shopping-add');
    expect(await screen.findByText('Eier · 10 Stück')).toBeTruthy();
    await press('shopping-buy-1');
    await waitFor(() => expect(screen.getByTestId('shopping-buy-1')).toHaveTextContent(/besorgt von Du/));
  });

  it('adds a child profile with name, colour and symbol only (Family plan)', async () => {
    routeParams.section = 'members';
    await renderApp(<FamilyRoute />, {
      account: { ...onboardedAccount(NOW, 'Europe/Berlin'), subscription: demoPurchase('family', 'yearly', NOW) },
    });
    expect(await screen.findByTestId('members-count')).toHaveTextContent(
      '2 von 6 Erwachsenen · Kinderprofile zählen nicht mit',
    );
    await press('kid-add');
    await fireEvent.changeText(screen.getByTestId('kid-name'), 'Mila');
    await press('kid-emoji-🐻');
    await press('kid-save');
    expect(await screen.findByText('Mila')).toBeTruthy();
  });

  it('explains the child-profile limit on Plus instead of adding', async () => {
    routeParams.section = 'members';
    await renderApp(<FamilyRoute />);
    expect(await screen.findByTestId('limit-kids')).toHaveTextContent(
      /2 Kinderprofile passen in deinen Tarif\. Mehr mit Family\./,
    );
    expect(screen.queryByTestId('kid-add')).toBeNull();
  });
});

describe('groups', () => {
  it('lists groups with their next meeting', async () => {
    routeParams.section = 'groups';
    await renderApp(<TogetherScreen />);
    const card = await screen.findByTestId('group-demo-group-regulars');
    expect(card).toHaveTextContent(/Stammtisch/);
    expect(card).toHaveTextContent(/Nächstes Treffen: Stammtisch · 4\. Dez\./);
    expect(card).toHaveTextContent(/2 dabei · 1 diesmal nicht · 1 offen/);
  });

  it('answers a meeting occurrence and chats', async () => {
    await renderApp(<GroupScreen groupId="demo-group-regulars" />);
    await press('meeting-yes-demo-stammtisch');
    await waitFor(() =>
      expect(screen.getByTestId('meeting-summary-demo-stammtisch')).toHaveTextContent(
        '3 dabei · 1 diesmal nicht · 0 offen',
      ),
    );
    expect(screen.queryByTestId('group-remove-tom')).toBeNull(); // Tom is admin, not the viewer
    await renderApp(<GroupChatScreen groupId="demo-group-regulars" />);
    await fireEvent.changeText(await screen.findByTestId('group-chat-input'), 'Ich bin dabei!');
    await press('group-chat-send');
    expect(await screen.findByText('Ich bin dabei!')).toBeTruthy();
  });

  it('creates a group and opens it', async () => {
    await renderApp(<GroupNewScreen />);
    await fireEvent.changeText(await screen.findByTestId('group-new-name'), 'Spieleabend');
    await press('group-new-emoji-🎲');
    await press('group-new-member-olivia');
    await press('group-new-create');
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/group/[id]' })),
    );
  });

  it('shows a friendly state for an unknown group', async () => {
    await renderApp(<GroupScreen groupId="nope" />);
    expect(await screen.findByTestId('group-missing')).toBeTruthy();
  });
});

describe('editor', () => {
  it('assigns a new appointment to a child', async () => {
    const { repo } = await renderApp(<EditorScreen initialDay="2026-11-12" />);
    await fireEvent.changeText(await screen.findByTestId('editor-title'), 'Flöte');
    await press('editor-for-paul');
    await press('editor-save');
    await waitFor(async () => {
      const h = (await repo.load()).household!;
      expect(Object.values(h.assignments)).toContainEqual(['paul']);
    });
  });

  it('plans a group meeting “every 1st Friday” and links it to the group', async () => {
    const { repo } = await renderApp(<EditorScreen social groupId="demo-group-run" initialDay="2026-11-06" />);
    expect(await screen.findByTestId('editor-group')).toHaveTextContent('Treffen für 🏃 Laufgruppe');
    await fireEvent.changeText(screen.getByTestId('editor-title'), 'Stadtlauf');
    await press('editor-repeat-monthly');
    expect(screen.getByTestId('editor-monthly-nth')).toHaveTextContent('Jeden 1. Freitag');
    await press('editor-monthly-nth');
    await press('editor-save');
    await waitFor(async () => {
      const world = await repo.load();
      const created = world.events.find((e) => e.title === 'Stadtlauf');
      expect(created?.recurrence?.byNthWeekday).toEqual({ weekday: 4, nth: 1 });
      expect(world.groups.find((g) => g.id === 'demo-group-run')?.meetingIds).toContain(created?.id);
      expect([...(created?.participantIds ?? [])].sort()).toEqual(['chris', 'mia', 'olivia']);
    });
  });
});

describe('calendar files', () => {
  const picker = jest.requireMock('expo-document-picker') as { getDocumentAsync: jest.Mock };
  const sharing = jest.requireMock('expo-sharing') as { shareAsync: jest.Mock };
  const fs = jest.requireMock('expo-file-system') as { __files: Map<string, string> };

  it('exports all appointments as one calendar file', async () => {
    await renderApp(<CalendarFileSettings />);
    await press('ics-export');
    await waitFor(() => expect(sharing.shareAsync).toHaveBeenCalled());
    const [uri, options] = sharing.shareAsync.mock.calls[0] as [string, { mimeType: string }];
    expect(options.mimeType).toBe('text/calendar');
    expect(fs.__files.get(uri)).toContain('UID:demo-stammtisch@nowish.app');
    expect(await screen.findByTestId('ics-message')).toHaveTextContent(/Termine als Datei bereit/);
  });

  it('reads a picked file, shows the preview and imports new and known entries', async () => {
    const text = [
      exportIcs(
        events.filter((e) => e.id === 'demo-dentist'),
        NOW,
        'de',
      ).replace('END:VCALENDAR\r\n', ''),
      'BEGIN:VEVENT',
      'UID:abc@example.com',
      'SUMMARY:Elternabend',
      'DTSTART;TZID=Europe/Berlin:20261118T193000',
      'DTEND;TZID=Europe/Berlin:20261118T210000',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:bad',
      'SUMMARY:Kaputt',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    fs.__files.set('file:///picked.ics', text);
    picker.getDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///picked.ics' }] });
    await renderApp(<CalendarFileSettings />);
    await press('ics-import');
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/ics-import'));

    const { repo } = await renderApp(<IcsImportScreen />);
    expect(await screen.findByTestId('ics-import-summary')).toHaveTextContent('1 neuer Termin · 1 schon vorhanden');
    expect(screen.getByTestId('ics-import-problems')).toHaveTextContent(/Kaputt – Startzeit fehlt/);
    await press('ics-import-confirm');
    expect(await screen.findByTestId('ics-import-done')).toHaveTextContent(/2 Termine übernommen 🎉/);
    const stored = (await repo.load()).events;
    expect(stored.filter((e) => e.id === 'demo-dentist')).toHaveLength(1);
    expect(stored.find((e) => e.title === 'Elternabend')?.isDemo).toBe(false);
  });

  it('explains files that are not calendars', async () => {
    fs.__files.set('file:///notes.txt', 'hello');
    picker.getDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file:///notes.txt' }] });
    await renderApp(<CalendarFileSettings />);
    await press('ics-import');
    expect(await screen.findByTestId('ics-message')).toHaveTextContent('Das ist keine Kalender-Datei (.ics).');
  });
});
