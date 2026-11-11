import { describe, expect, it } from 'vitest';

import { applyDraft, draftTimes, eventToDraft, type CalendarEvent, type EventDraft } from '../src';

const TZ = 'Europe/Berlin';
const now = new Date('2026-11-09T10:00:00Z');
const draft: EventDraft = {
  title: '  Spieleabend ',
  category: 'social',
  day: '2026-11-13',
  allDay: false,
  startMinute: 19 * 60,
  endMinute: 23 * 60,
  days: 1,
  location: 'Bei Olivia',
  travel: { mode: 'bike', minutes: 22 },
  prepMinutes: 30,
  arrivalMarginMinutes: 0,
};
const base = {
  id: 'e1',
  kind: 'appointment' as const,
  timeZone: TZ,
  participantIds: [],
  isDemo: false,
  createdAt: now,
};

describe('draft ↔ event', () => {
  it('converts wall-clock times to instants', () => {
    const { start, end } = draftTimes(draft, TZ);
    expect(start.toISOString()).toBe('2026-11-13T18:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-13T22:00:00.000Z');
  });

  it('allows ending at midnight', () => {
    expect(draftTimes({ ...draft, endMinute: 24 * 60 }, TZ).end.toISOString()).toBe('2026-11-13T23:00:00.000Z');
  });

  it('spans all-day items over whole local days', () => {
    const { start, end } = draftTimes({ ...draft, allDay: true, days: 2 }, TZ);
    expect([start.toISOString(), end.toISOString()]).toEqual(['2026-11-12T23:00:00.000Z', '2026-11-14T23:00:00.000Z']);
  });

  it('applies a draft and round-trips back to the same draft', () => {
    const e = applyDraft(base, draft, now);
    expect(e.title).toBe('Spieleabend');
    expect(eventToDraft(e, 'de')).toEqual({ ...draft, title: 'Spieleabend' });
  });

  it('turns edited demo text into user text', () => {
    const demo: CalendarEvent = {
      ...applyDraft(base, draft, now),
      titleI18n: { de: 'Spieleabend bei Olivia', en: 'Game night at Olivia’s' },
      isDemo: true,
    };
    expect(eventToDraft(demo, 'en').title).toBe('Game night at Olivia’s');
    const edited = applyDraft(demo, { ...draft, title: 'Spieleabend (verschoben)' }, now);
    expect(edited.titleI18n).toBeUndefined();
    expect(edited.title).toBe('Spieleabend (verschoben)');
  });

  it('removes recurrence and travel when the draft drops them', () => {
    const withAll = applyDraft(base, { ...draft, recurrence: { freq: 'weekly', interval: 1 } }, now);
    const { travel: _t, ...noTravel } = draft;
    const plain = applyDraft(withAll, noTravel, now);
    expect(plain.recurrence).toBeUndefined();
    expect(plain.travel).toBeUndefined();
  });
});

describe('covers', () => {
  it('keeps a chosen cover and drops the default', async () => {
    const { applyDraft, eventToDraft, isPremiumCover } = await import('../src');
    const base = {
      id: 'c1',
      kind: 'appointment' as const,
      timeZone: 'Europe/Berlin',
      participantIds: ['chris'],
      isDemo: false,
      createdAt: new Date('2026-11-01T00:00:00Z'),
    };
    const draft = {
      title: 'Party',
      category: 'celebration' as const,
      day: '2026-11-20',
      allDay: false,
      startMinute: 1200,
      endMinute: 1380,
      days: 1,
      location: '',
      prepMinutes: 0,
      arrivalMarginMinutes: 0,
      cover: 'confetti' as const,
    };
    const e = applyDraft(base, draft, new Date('2026-11-11T00:00:00Z'));
    expect(e.cover).toBe('confetti');
    expect(eventToDraft(e, 'de').cover).toBe('confetti');
    expect(applyDraft(e, { ...draft, cover: 'category' }, new Date()).cover).toBeUndefined();
    expect(isPremiumCover('confetti')).toBe(true);
    expect(isPremiumCover('stripes')).toBe(false);
  });
});
