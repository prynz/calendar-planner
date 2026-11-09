import { buildDemoWorld } from '@nowish/demo';
import { addDays } from '@nowish/domain';
import { createTranslator } from '@nowish/i18n';

import { dateStripDays, dayHeading, eventCardProps, statusLabel } from '@/features/agenda/presenters';

const NOW = new Date('2026-11-09T07:00:00Z');
const world = buildDemoWorld(NOW);
const t = createTranslator('de');
const byId = (id: string) => {
  const e = world.events.find((x) => x.id === id);
  if (!e) throw new Error(id);
  return e;
};

describe('presenters', () => {
  it('labels upcoming, running, done and all-day plans', () => {
    expect(statusLabel(byId('demo-dentist'), NOW, t)).toBe('in 30 Min.');
    expect(statusLabel(byId('demo-games'), NOW, t)).toBe('in 11 Std.');
    expect(statusLabel(byId('demo-dentist'), new Date('2026-11-09T07:45:00Z'), t)).toBe('läuft gerade');
    expect(statusLabel(byId('demo-cinema'), NOW, t)).toBe('vorbei');
    expect(statusLabel(byId('demo-tom-bday'), NOW, t)).toBe('ganztägig');
  });

  it('builds card props with location, host and people (viewer excluded)', () => {
    const props = eventCardProps(byId('demo-games'), world, NOW, 'de', t);
    expect(props).toMatchObject({
      title: 'Spieleabend bei Olivia',
      subtitle: 'Bei Olivia · mit Olivia',
      timeLabel: '19:00 – 23:00',
      category: 'social',
    });
    expect(props.people?.names).toEqual(['Olivia', 'Tom', 'Mia', 'Jonas']);
    expect(props.people?.accessibilityLabel).toBe('4 Personen: Olivia, Tom, Mia, Jonas');
  });

  it('localizes to English', () => {
    const tEn = createTranslator('en');
    expect(eventCardProps(byId('demo-dentist'), world, NOW, 'en', tEn)).toMatchObject({
      title: 'Dentist',
      statusLabel: 'in 30 min',
    });
  });

  it('builds 15 day pills with weekday, marker and spoken label', () => {
    const days = dateStripDays(world, 'de', t);
    expect(days).toHaveLength(15);
    const today = days.find((d) => d.key === world.today);
    expect(today).toMatchObject({ dayNumber: '9', weekday: 'Mo', hasEvents: true });
    expect(today?.accessibilityLabel).toBe('Montag, 9. November, heute, mit Terminen');
    expect(days.find((d) => d.key === addDays(world.today, 4))?.hasEvents).toBe(false);
  });

  it('titles today and other days', () => {
    expect(dayHeading(world, world.today, 'de', t).title).toBe('Dein Tag');
    expect(dayHeading(world, addDays(world.today, 1), 'de', t).title).toBe('Dienstag');
  });
});
