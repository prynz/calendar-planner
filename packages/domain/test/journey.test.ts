import { describe, expect, it } from 'vitest';

import {
  addBringItem,
  announceLate,
  departureDelay,
  emptyCollab,
  invite,
  learnBuffer,
  markLeft,
  monthRange,
  newJourney,
  postLateNote,
  punctuality,
  readyItems,
  readyProgress,
  setClaim,
  toggleChecked,
  wasOnTime,
  zonedWallTimeToInstant,
  type Journey,
} from '../src';

const TZ = 'Europe/Berlin';
const leave = (day: string, h = 18, m = 0) => zonedWallTimeToInstant(day, h, m, TZ);
const minutesAfter = (d: Date, min: number) => new Date(d.getTime() + min * 60_000);

function departed(day: string, delayMin: number): Journey {
  const j = newJourney('e', day, leave(day));
  return markLeft(j, minutesAfter(j.plannedLeaveAt, delayMin));
}

describe('journey', () => {
  it('keeps the first "on my way" and measures the delay', () => {
    let j = newJourney('e1', '2026-11-10', leave('2026-11-10'));
    expect(departureDelay(j)).toBeUndefined();
    j = markLeft(j, minutesAfter(j.plannedLeaveAt, 7));
    j = markLeft(j, minutesAfter(j.plannedLeaveAt, 30));
    expect(departureDelay(j)).toBe(7);
    expect(wasOnTime(j)).toBe(false);
  });

  it('counts up to 2 minutes as on time; an announced delay is never on time', () => {
    expect(wasOnTime(departed('2026-11-10', 2))).toBe(true);
    expect(wasOnTime(departed('2026-11-10', -4))).toBe(true);
    const late = announceLate(newJourney('e', '2026-11-10', leave('2026-11-10')), 10, leave('2026-11-10'));
    expect(wasOnTime(late)).toBe(false);
    expect(() => announceLate(late, 7, leave('2026-11-10'))).toThrow();
  });

  it('toggles ready-check items', () => {
    let j = newJourney('e', '2026-11-10', leave('2026-11-10'));
    j = toggleChecked(toggleChecked(j, 'std-keys'), 'std-phone');
    expect(toggleChecked(j, 'std-keys').checked).toEqual(['std-phone']);
  });
});

describe('buffer learning (EWMA, α = 0.3, 0–20 min, steps of 5)', () => {
  it('needs at least 3 departures', () => {
    expect(learnBuffer([departed('2026-11-01', 10), departed('2026-11-02', 10)], 5)).toBeNull();
  });

  it('adds the typical delay to the current buffer and rounds to 5 minutes', () => {
    const js = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'].map((d) => departed(d, 6));
    expect(learnBuffer(js, 5)).toEqual({ minutes: 10, samples: 4 }); // 5 + 6 = 11 → 10
  });

  it('weights recent departures more and clamps to 0–20', () => {
    const early = ['2026-11-01', '2026-11-02', '2026-11-03'].map((d) => departed(d, -10));
    expect(learnBuffer(early, 5)?.minutes).toBe(0);
    const veryLate = ['2026-11-01', '2026-11-02', '2026-11-03'].map((d) => departed(d, 90));
    expect(learnBuffer(veryLate, 5)?.minutes).toBe(20);
    // order by planned time, not by array order
    const mixed = [departed('2026-11-05', 0), departed('2026-11-01', 20), departed('2026-11-03', 20)];
    expect(learnBuffer(mixed, 0)?.minutes).toBe(15); // 20 → 20 → 0.3·0 + 0.7·20 = 14 → 15
  });
});

describe('punctuality', () => {
  it('summarises a month per day, ignoring journeys without a signal', () => {
    const js = [
      departed('2026-11-02', 0),
      departed('2026-11-02', 12),
      departed('2026-11-05', 1),
      newJourney('e', '2026-11-06', leave('2026-11-06')), // no signal
      departed('2026-10-30', 0), // other month
    ];
    const { from, toExclusive } = monthRange('2026-11-17');
    expect([from, toExclusive]).toEqual(['2026-11-01', '2026-12-01']);
    const r = punctuality(js, from, toExclusive, TZ);
    expect(r).toMatchObject({ onTime: 2, total: 3 });
    expect(r.byDay['2026-11-02']?.state).toBe('mixed');
    expect(r.byDay['2026-11-05']?.state).toBe('on-time');
  });

  it('handles month ends', () => {
    expect(monthRange('2026-02-14')).toEqual({ from: '2026-02-01', toExclusive: '2026-03-01' });
    expect(monthRange('2026-12-31')).toEqual({ from: '2026-12-01', toExclusive: '2027-01-01' });
  });
});

describe('ready check', () => {
  it('lists own bring-list claims, category items and standard items', () => {
    let c = invite(emptyCollab('e', 'tom'), 'tom', ['chris'], new Date(0));
    c = addBringItem(c, 'tom', { title: 'Salat', quantity: 2 }, new Date(0));
    c = addBringItem(c, 'tom', { title: 'Brot', quantity: 1 }, new Date(0));
    c = setClaim(c, c.bring[0]?.id ?? '', 'chris', 1);
    const items = readyItems('health', c, 'chris');
    expect(items.map((i) => i.id)).toEqual([
      `bring-${c.bring[0]?.id}`,
      'cat-insurance-card',
      'cat-id-card',
      'std-keys',
      'std-phone',
      'std-wallet',
    ]);
    expect(readyProgress(items, ['std-keys'])).toEqual({ done: 1, total: 6, complete: false });
    expect(
      readyProgress(
        items,
        items.map((i) => i.id),
      ).complete,
    ).toBe(true);
  });
});

describe('late note', () => {
  it('posts a friendly system note for members only', () => {
    const c = invite(emptyCollab('e', 'tom'), 'tom', ['chris'], new Date(0));
    expect(postLateNote(c, 'chris', 10, new Date(1)).messages.at(-1)).toMatchObject({
      type: 'system',
      note: { kind: 'late', personId: 'chris', minutes: 10 },
    });
    expect(() => postLateNote(c, 'gabi', 10, new Date(1))).toThrow();
  });
});
