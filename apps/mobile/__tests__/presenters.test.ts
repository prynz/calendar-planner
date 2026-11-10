import { agendaForDay, buildDemoEvents, DEMO_TIME_ZONE } from '@nowish/demo';
import { addDays } from '@nowish/domain';
import { createTranslator } from '@nowish/i18n';

import {
  dateStripDays,
  dayHeading,
  eventCardProps,
  leaveHero,
  monthRows,
  statusLabel,
} from '@/features/agenda/presenters';

const NOW = new Date('2026-11-09T07:00:00Z'); // 08:00 Berlin
const TZ = DEMO_TIME_ZONE;
const TODAY = '2026-11-09';
const events = buildDemoEvents(NOW);
const t = createTranslator('de');
const item = (id: string, day = TODAY) => {
  const i = agendaForDay(events, day, TZ).find((x) => x.event.id === id);
  if (!i) throw new Error(id);
  return i;
};

describe('presenters', () => {
  it('labels upcoming, running, done and all-day plans', () => {
    expect(statusLabel(item('demo-dentist'), NOW, t)).toBe('in 30 Min.');
    expect(statusLabel(item('demo-games'), NOW, t)).toBe('in 11 Std.');
    expect(statusLabel(item('demo-dentist'), new Date('2026-11-09T07:45:00Z'), t)).toBe('läuft gerade');
    expect(statusLabel(item('demo-cinema', addDays(TODAY, -1)), NOW, t)).toBe('vorbei');
    expect(statusLabel(item('demo-tom-bday', addDays(TODAY, 3)), NOW, t)).toBe('ganztägig');
  });

  it('builds card props with location, host, people and the compact leave time', () => {
    const props = eventCardProps(item('demo-games'), NOW, 'de', t, 5);
    expect(props).toMatchObject({
      title: 'Spieleabend bei Olivia',
      subtitle: 'Bei Olivia · mit Olivia',
      timeLabel: '19:00 – 23:00',
      category: 'social',
      leaveLabel: 'los um 18:33', // 19:00 − 22 min bike − 5 min buffer
    });
    expect(props.people?.names).toEqual(['Olivia', 'Tom', 'Mia', 'Jonas']);
  });

  it('localizes to English', () => {
    const tEn = createTranslator('en');
    expect(eventCardProps(item('demo-dentist'), NOW, 'en', tEn, 5)).toMatchObject({
      title: 'Dentist',
      statusLabel: 'in 30 min',
    });
  });

  it('shows the leave hero only inside the 3-hour window', () => {
    // 08:00: dentist 08:30 − 10 min early − 15 min transit − 5 min buffer = leave now
    expect(leaveHero(events, NOW, 'de', t, 5, TZ)).toMatchObject({
      eventId: 'demo-dentist',
      headline: '08:00 los',
      status: 'Jetzt los! 🏃',
    });
    // 10:00: dentist started, lunch leave 12:13 is within 3 h
    expect(leaveHero(events, new Date('2026-11-09T09:00:00Z'), 'de', t, 5, TZ)).toMatchObject({
      eventId: 'demo-lunch',
      headline: '12:13 los',
    });
    // 14:00: games leave 18:33 is more than 3 h away
    expect(leaveHero(events, new Date('2026-11-09T13:00:00Z'), 'de', t, 5, TZ)).toBeNull();
  });

  it('builds day pills with weekday, marker and spoken label', () => {
    const days = dateStripDays(events, TODAY, TZ, 'de', t);
    const today = days.find((d) => d.key === TODAY);
    expect(today).toMatchObject({ dayNumber: '9', weekday: 'Mo', hasEvents: true });
    expect(today?.accessibilityLabel).toBe('Montag, 9. November, heute, mit Terminen');
    expect(days.find((d) => d.key === addDays(TODAY, 4))?.hasEvents).toBe(false);
  });

  it('builds a 6×7 month grid starting on Monday with dots', () => {
    const rows = monthRows(TODAY, TODAY, events, TZ, 'de', t);
    expect(rows).toHaveLength(6);
    expect(rows[0]?.[0]?.key).toBe('2026-10-26'); // Monday before 1 Nov
    const nine = rows.flat().find((c) => c.key === TODAY);
    expect(nine).toMatchObject({ isToday: true, inMonth: true });
    expect(nine?.dots).toHaveLength(3);
  });

  it('titles today and other days', () => {
    expect(dayHeading(TODAY, TODAY, TZ, 'de', t).title).toBe('Dein Tag');
    expect(dayHeading(addDays(TODAY, 1), TODAY, TZ, 'de', t).title).toBe('Dienstag');
  });
});
