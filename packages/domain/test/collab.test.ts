import { describe, expect, it } from 'vitest';

import {
  addBringItem,
  addTask,
  applyDueActions,
  bringProgress,
  CollabError,
  createPoll,
  decidePoll,
  emptyCollab,
  EVENT_TEMPLATES,
  guestsByState,
  invite,
  isPollOpen,
  nonVoters,
  normalizeItemName,
  pollOutcome,
  pollTally,
  postMessage,
  releaseTask,
  remainingQuantity,
  resolveDue,
  respond,
  rsvpSummary,
  schedule,
  setClaim,
  setMaybeDeadline,
  setTaskDone,
  similarItems,
  sortedMessages,
  takeTask,
  taskProgress,
  vote,
  zonedWallTimeToInstant,
  type EventCollab,
} from '../src';

const T0 = new Date('2026-11-10T12:00:00Z');
const at = (min: number) => new Date(T0.getTime() + min * 60_000);

function base(): EventCollab {
  return invite(emptyCollab('e1', 'chris'), 'chris', ['olivia', 'tom', 'mia'], T0);
}

const codeOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    if (e instanceof CollabError) return e.code;
    throw e;
  }
  return null;
};

describe('rsvp', () => {
  it('invites without duplicates or the host and notes it in the chat', () => {
    const c = invite(base(), 'chris', ['tom', 'chris', 'alex', 'alex'], T0);
    expect(c.invitations.map((i) => i.personId)).toEqual(['olivia', 'tom', 'mia', 'alex']);
    expect(c.messages.at(-1)).toMatchObject({ type: 'system', note: { kind: 'invited', personIds: ['alex'] } });
  });

  it('only the host invites', () => {
    expect(codeOf(() => invite(base(), 'tom', ['alex'], T0))).toBe('not-host');
  });

  it('counts answers, +1s and the host in the headcount', () => {
    let c = respond(base(), 'olivia', 'yes', T0, true);
    c = respond(c, 'tom', 'maybe', T0);
    expect(rsvpSummary(c, T0)).toEqual({ yes: 1, maybe: 1, no: 0, open: 1, headcount: 3 });
  });

  it('a "maybe" past the deadline counts as open, never as "no" (EVT-05)', () => {
    let c = respond(base(), 'tom', 'maybe', T0);
    c = setMaybeDeadline(c, 'chris', at(60));
    expect(rsvpSummary(c, at(59)).maybe).toBe(1);
    const later = rsvpSummary(c, at(60));
    expect(later).toMatchObject({ maybe: 0, no: 0, open: 3 });
    expect(guestsByState(c, at(61)).expired.map((i) => i.personId)).toEqual(['tom']);
  });

  it('a "no" drops the +1 and repeating an answer adds no chat note', () => {
    let c = respond(base(), 'olivia', 'yes', T0, true);
    const notes = c.messages.length;
    c = respond(c, 'olivia', 'yes', at(1));
    expect(c.messages).toHaveLength(notes);
    c = respond(c, 'olivia', 'no', at(2));
    expect(c.invitations[0]).toMatchObject({ answer: 'no', plusOne: false });
  });

  it('rejects answers from people who were not invited', () => {
    expect(codeOf(() => respond(base(), 'gabi', 'yes', T0))).toBe('not-invited');
  });
});

describe('polls', () => {
  const withPoll = () =>
    createPoll(
      base(),
      'chris',
      {
        question: ' Wann? ',
        options: [
          { type: 'time', start: at(1440), end: at(1560) },
          { type: 'time', start: at(2880), end: at(3000) },
        ],
        deadline: at(120),
        decision: 'majority',
      },
      T0,
    );

  it('validates input and is host-only', () => {
    const c = withPoll();
    expect(c.polls[0]?.question).toBe('Wann?');
    expect(
      codeOf(() => createPoll(base(), 'chris', { question: 'x', options: [], deadline: at(10), decision: 'host' }, T0)),
    ).toBe('invalid-input');
    expect(
      codeOf(() =>
        createPoll(
          base(),
          'tom',
          {
            question: 'x',
            options: [
              { type: 'text', label: 'a' },
              { type: 'text', label: 'b' },
            ],
            deadline: at(10),
            decision: 'host',
          },
          T0,
        ),
      ),
    ).toBe('not-host');
  });

  it('tallies yes = 2, if-needed = 1 and finds the leader after the deadline', () => {
    let c = withPoll();
    const p = c.polls[0];
    if (!p) throw new Error('no poll');
    const [a, b] = p.options.map((o) => o.id) as [string, string];
    c = vote(c, p.id, 'olivia', { [a]: 'yes', [b]: 'no' }, T0);
    c = vote(c, p.id, 'tom', { [a]: 'if-needed', [b]: 'yes' }, T0);
    c = vote(c, p.id, 'mia', { [a]: 'yes' }, T0);
    const poll = c.polls[0];
    if (!poll) throw new Error('no poll');
    expect(pollTally(poll).map((t) => t.score)).toEqual([5, 2]);
    expect(pollOutcome(poll, at(119))).toEqual({ kind: 'open' });
    expect(pollOutcome(poll, at(120))).toEqual({ kind: 'leading', optionId: a });
    expect(nonVoters(c, poll)).toEqual(['chris', 'mia']);
  });

  it('a tie goes to the host, never to chance', () => {
    let c = withPoll();
    const p = c.polls[0];
    if (!p) throw new Error('no poll');
    const [a, b] = p.options.map((o) => o.id) as [string, string];
    c = vote(c, p.id, 'olivia', { [a]: 'yes', [b]: 'yes' }, T0);
    const poll = c.polls[0];
    if (!poll) throw new Error('no poll');
    expect(pollOutcome(poll, at(200))).toEqual({ kind: 'host-decides', optionIds: [a, b] });
    const decided = decidePoll(c, 'chris', p.id, b, at(201));
    const dp = decided.polls[0];
    if (!dp) throw new Error('no poll');
    expect(pollOutcome(dp, at(201))).toEqual({ kind: 'decided', optionId: b });
    expect(isPollOpen(dp, T0)).toBe(false);
  });

  it('rejects votes after the deadline and for unknown options', () => {
    const c = withPoll();
    const p = c.polls[0];
    if (!p) throw new Error('no poll');
    const a = p.options[0]?.id ?? '';
    expect(codeOf(() => vote(c, p.id, 'tom', { [a]: 'yes' }, at(120)))).toBe('poll-closed');
    expect(codeOf(() => vote(c, p.id, 'tom', { nope: 'yes' }, T0))).toBe('invalid-input');
    expect(codeOf(() => vote(c, p.id, 'gabi', { [a]: 'yes' }, T0))).toBe('not-invited');
  });
});

describe('bring list', () => {
  const withItem = () => addBringItem(base(), 'tom', { title: 'Getränke', quantity: 6 }, T0);

  it('claims never exceed the quantity (BRG-02)', () => {
    let c = withItem();
    const id = c.bring[0]?.id ?? '';
    c = setClaim(c, id, 'tom', 2);
    c = setClaim(c, id, 'mia', 4);
    expect(remainingQuantity(c.bring[0]!)).toBe(0);
    expect(codeOf(() => setClaim(c, id, 'olivia', 1))).toBe('over-claimed');
    c = setClaim(c, id, 'mia', 1); // reduce own claim
    expect(remainingQuantity(c.bring[0]!)).toBe(3);
    c = setClaim(c, id, 'tom', 0);
    expect(c.bring[0]?.claims).toEqual([{ personId: 'mia', quantity: 1 }]);
    expect(bringProgress(c.bring)).toEqual({ covered: 0, total: 1 });
  });

  it('validates new items', () => {
    expect(codeOf(() => addBringItem(base(), 'tom', { title: ' ', quantity: 1 }, T0))).toBe('invalid-input');
    expect(codeOf(() => addBringItem(base(), 'tom', { title: 'x', quantity: 0 }, T0))).toBe('invalid-input');
    expect(codeOf(() => addBringItem(base(), 'gabi', { title: 'x', quantity: 1 }, T0))).toBe('not-invited');
  });

  it('hints at similar items: case, umlauts and simple plurals (BRG-04)', () => {
    expect(normalizeItemName('Kartoffelsalate!')).toBe('kartoffelsalat');
    expect(normalizeItemName('Grillkäse')).toBe(normalizeItemName('grillkaese'));
    const c = addBringItem(base(), 'tom', { title: 'Salat', quantity: 1 }, T0);
    expect(similarItems(c.bring, 'Salate', 'de')).toHaveLength(1);
    expect(similarItems(c.bring, 'Bier', 'de')).toHaveLength(0);
    expect(similarItems(c.bring, 'ab', 'de')).toHaveLength(0);
  });
});

describe('tasks', () => {
  const withTask = () => addTask(base(), 'chris', { title: 'Kuchen backen', dueAt: at(60) }, T0);

  it('first one to take it wins; the second learns who (TSK-03)', () => {
    let c = withTask();
    const id = c.tasks[0]?.id ?? '';
    c = takeTask(c, id, 'mia');
    try {
      takeTask(c, id, 'tom');
      throw new Error('expected already-taken');
    } catch (e) {
      expect(e).toBeInstanceOf(CollabError);
      expect((e as CollabError).personId).toBe('mia'); // narrowed by the instanceof check above
    }
    c = releaseTask(c, id, 'mia');
    expect(c.tasks[0]?.assigneeId).toBeUndefined();
  });

  it('only the host assigns others', () => {
    expect(codeOf(() => addTask(base(), 'tom', { title: 'x', assigneeId: 'mia' }, T0))).toBe('not-host');
    expect(addTask(base(), 'chris', { title: 'x', assigneeId: 'mia' }, T0).tasks[0]?.assigneeId).toBe('mia');
  });

  it('done takes unassigned tasks, notes it once and can be reopened', () => {
    let c = withTask();
    const id = c.tasks[0]?.id ?? '';
    c = setTaskDone(c, id, 'tom', true, at(5));
    expect(c.tasks[0]).toMatchObject({ assigneeId: 'tom', doneAt: at(5) });
    expect(taskProgress(c.tasks)).toEqual({ done: 1, total: 1 });
    const notes = c.messages.length;
    c = setTaskDone(c, id, 'tom', true, at(6));
    expect(c.messages).toHaveLength(notes);
    expect(codeOf(() => setTaskDone(c, id, 'mia', false, at(7)))).toBe('already-taken');
    c = setTaskDone(c, id, 'chris', false, at(7)); // host may reopen
    expect(c.tasks[0]?.doneAt).toBeUndefined();
  });
});

describe('chat and simulation', () => {
  it('validates messages (1–4000 characters, members only)', () => {
    expect(postMessage(base(), 'tom', ' Hi ', T0).messages.at(-1)).toMatchObject({ body: 'Hi', authorId: 'tom' });
    expect(codeOf(() => postMessage(base(), 'tom', '   ', T0))).toBe('invalid-input');
    expect(codeOf(() => postMessage(base(), 'tom', 'x'.repeat(4001), T0))).toBe('invalid-input');
    expect(codeOf(() => postMessage(base(), 'gabi', 'hi', T0))).toBe('not-invited');
  });

  it('applies only due actions, in time order, and drops rule-rejected ones', () => {
    let c = schedule(base(), [
      { at: at(10), personId: 'tom', type: 'rsvp', answer: 'yes' },
      { at: at(2), personId: 'olivia', type: 'rsvp', answer: 'maybe' },
      { at: at(3), personId: 'gabi', type: 'rsvp', answer: 'yes' }, // not invited → dropped
      { at: at(4), personId: 'mia', type: 'message', body: { de: 'Bin dabei', en: 'I’m in' } },
    ]);
    const first = applyDueActions(c, at(5));
    expect(first.applied).toBe(2);
    expect(first.collab.pending).toHaveLength(1);
    c = first.collab;
    expect(rsvpSummary(c, at(5))).toMatchObject({ maybe: 1, yes: 0 });
    expect(sortedMessages(c).at(-1)).toMatchObject({ type: 'text', bodyI18n: { en: 'I’m in' } });
    expect(applyDueActions(c, at(5)).applied).toBe(0);
    expect(rsvpSummary(applyDueActions(c, at(10)).collab, at(10)).yes).toBe(1);
  });
});

describe('templates', () => {
  it('have unique ids and sensible content', () => {
    expect(new Set(EVENT_TEMPLATES.map((t) => t.id)).size).toBe(EVENT_TEMPLATES.length);
    for (const t of EVENT_TEMPLATES) {
      expect(t.tasks.length + t.bring.length).toBeGreaterThan(0);
      expect(t.bring.every((b) => b.quantity >= 1)).toBe(true);
    }
  });

  it('resolves relative due days at 18:00 local, never after the start (DST-safe)', () => {
    const tz = 'Europe/Berlin';
    const start = zonedWallTimeToInstant('2026-10-31', 19, 0, tz); // week after DST end
    expect(resolveDue(start, -7, tz)).toEqual(zonedWallTimeToInstant('2026-10-24', 18, 0, tz));
    const early = zonedWallTimeToInstant('2026-10-31', 9, 0, tz);
    expect(resolveDue(early, 0, tz)).toEqual(early);
  });
});
