import { addDays } from '@nowish/domain';
import { describe, expect, it } from 'vitest';

import { categoryColors } from '@nowish/ui/tokens';
import { agendaForDay, buildDemoWorld, DEMO_CATEGORIES, personName, upcomingSocialEvents } from '../src';

const NOW = new Date('2026-11-09T07:00:00Z'); // Monday 08:00 in Berlin

describe('demo world', () => {
  const world = buildDemoWorld(NOW);

  it('is anchored on today in the demo zone and deterministic', () => {
    expect(world.today).toBe('2026-11-09');
    expect(buildDemoWorld(NOW)).toEqual(world);
  });

  it('has three plans today, sorted by time', () => {
    const today = agendaForDay(world, world.today);
    expect(today.map((e) => e.id)).toEqual(['demo-dentist', 'demo-lunch', 'demo-games']);
    expect(today[0]?.start.toISOString()).toBe('2026-11-09T07:30:00.000Z');
  });

  it('puts the all-day birthday before the party', () => {
    expect(agendaForDay(world, addDays(world.today, 3)).map((e) => e.id)).toEqual(['demo-tom-bday', 'demo-tom-party']);
  });

  it('spans multi-day trips over every day', () => {
    for (const offset of [12, 13, 14, 15]) {
      expect(agendaForDay(world, addDays(world.today, offset)).map((e) => e.id)).toContain('demo-lisbon');
    }
    expect(agendaForDay(world, addDays(world.today, 16))).toHaveLength(0);
  });

  it('lists only social events that are not over', () => {
    const upcoming = upcomingSocialEvents(world, NOW);
    expect(upcoming.every((e) => e.kind === 'social')).toBe(true);
    expect(upcoming.map((e) => e.id)).not.toContain('demo-cinema');
    expect(upcoming[0]?.id).toBe('demo-lunch');
  });

  it('is internally consistent', () => {
    const ids = new Set(world.people.map((p) => p.id));
    for (const e of world.events) {
      expect(e.end.getTime()).toBeGreaterThan(e.start.getTime());
      expect(e.title.de.length).toBeGreaterThan(0);
      expect(e.title.en.length).toBeGreaterThan(0);
      for (const p of e.participantIds) expect(ids.has(p), `${e.id}: ${p}`).toBe(true);
      if (e.hostId) expect(e.participantIds).toContain(e.hostId);
      if (e.rsvp) expect(e.rsvp.yes + e.rsvp.maybe + e.rsvp.open).toBe(e.participantIds.length);
      if (e.kind === 'social') expect(e.rsvp).toBeDefined();
    }
    expect(personName(world, 'olivia')).toBe('Olivia');
    expect(() => personName(world, 'nobody')).toThrow();
  });

  it('uses exactly the design-token categories', () => {
    expect([...DEMO_CATEGORIES].sort()).toEqual(Object.keys(categoryColors).sort());
  });

  it('keeps children as profiles without being hosts (no accounts)', () => {
    const children = new Set(world.people.filter((p) => p.kind === 'child').map((p) => p.id));
    for (const e of world.events) expect(e.hostId === undefined || !children.has(e.hostId)).toBe(true);
  });
});
