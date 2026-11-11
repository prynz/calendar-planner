import { addDays, dayKeyOf, markLeft, newJourney, zonedWallTimeToInstant, type Journey } from '@nowish/domain';

/**
 * The viewer's departure history in the example world (Demo): makes the punctuality summary and buffer
 * learning visible from the first start. Relative to "today", all in the past, fictional.
 */
const HISTORY: readonly { daysAgo: number; hour: number; delay: number }[] = [
  { daysAgo: 1, hour: 19, delay: 1 },
  { daysAgo: 3, hour: 8, delay: 12 },
  { daysAgo: 4, hour: 18, delay: 0 },
  { daysAgo: 6, hour: 17, delay: 4 },
  { daysAgo: 8, hour: 10, delay: -3 },
  { daysAgo: 10, hour: 19, delay: 2 },
  { daysAgo: 13, hour: 7, delay: 9 },
  { daysAgo: 15, hour: 18, delay: 1 },
  { daysAgo: 18, hour: 12, delay: 0 },
  { daysAgo: 22, hour: 19, delay: 6 },
];

export function buildDemoJourneys(now: Date, timeZone: string): Journey[] {
  const today = dayKeyOf(now, timeZone);
  return HISTORY.map((h, i) => {
    const day = addDays(today, -h.daysAgo);
    const planned = zonedWallTimeToInstant(day, h.hour, 0, timeZone);
    return markLeft(newJourney(`demo-history-${i}`, day, planned), new Date(planned.getTime() + h.delay * 60_000));
  });
}
