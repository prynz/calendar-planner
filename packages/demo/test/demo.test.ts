import { addDays, EVENT_CATEGORIES } from '@nowish/domain';
import { categoryColors } from '@nowish/ui/tokens';
import { describe, expect, it } from 'vitest';

import { agendaForDay, buildDemoEvents, DEMO_PEOPLE, DEMO_TIME_ZONE, personName, upcomingSocial } from '../src';

const NOW = new Date('2026-11-09T07:00:00Z'); // Monday 08:00 in Berlin
const TODAY = '2026-11-09';
const events = buildDemoEvents(NOW);
const ids = (day: string) => agendaForDay(events, day, DEMO_TIME_ZONE).map((i) => i.event.id);

describe('demo events', () => {
  it('is deterministic and anchored on today', () => {
    expect(buildDemoEvents(NOW)).toEqual(events);
    expect(ids(TODAY)).toEqual(['demo-dentist', 'demo-lunch', 'demo-games']);
  });

  it('puts the all-day birthday before the party', () => {
    expect(ids(addDays(TODAY, 3))).toEqual(['demo-tom-bday', 'demo-tom-party']);
  });

  it('repeats football practice every week', () => {
    expect(ids(addDays(TODAY, 1))).toContain('demo-football');
    expect(ids(addDays(TODAY, 8))).toContain('demo-football');
    expect(ids(addDays(TODAY, 2))).not.toContain('demo-football');
  });

  it('spans multi-day trips over every day', () => {
    for (const o of [12, 13, 14, 15]) expect(ids(addDays(TODAY, o))).toContain('demo-lisbon');
    expect(ids(addDays(TODAY, 16))).not.toContain('demo-lisbon');
  });

  it('lists only social events that are not over', () => {
    const up = upcomingSocial(events, NOW, DEMO_TIME_ZONE);
    expect(up.every((i) => i.event.kind === 'social')).toBe(true);
    expect(up.map((i) => i.event.id)).not.toContain('demo-cinema');
    expect(up[0]?.event.id).toBe('demo-lunch');
  });

  it('is internally consistent', () => {
    const people = new Set(DEMO_PEOPLE.map((p) => p.id));
    for (const e of events) {
      expect(e.isDemo).toBe(true);
      expect(e.end.getTime()).toBeGreaterThan(e.start.getTime());
      expect(e.titleI18n?.de.length).toBeGreaterThan(0);
      expect(e.titleI18n?.en.length).toBeGreaterThan(0);
      for (const p of e.participantIds) expect(people.has(p), `${e.id}: ${p}`).toBe(true);
      if (e.hostId) expect(e.participantIds).toContain(e.hostId);
      if (e.rsvp) expect(e.rsvp.yes + e.rsvp.maybe + e.rsvp.open).toBe(e.participantIds.length);
      if (e.kind === 'social') expect(e.rsvp).toBeDefined();
    }
    expect(personName('olivia')).toBe('Olivia');
    expect(() => personName('nobody')).toThrow();
  });

  it('uses exactly the design-token categories', () => {
    expect([...EVENT_CATEGORIES].sort()).toEqual(Object.keys(categoryColors).sort());
  });

  it('keeps children as profiles, never hosts (no accounts)', () => {
    const children = new Set(DEMO_PEOPLE.filter((p) => p.kind === 'child').map((p) => p.id));
    for (const e of events) expect(e.hostId === undefined || !children.has(e.hostId)).toBe(true);
  });
});
