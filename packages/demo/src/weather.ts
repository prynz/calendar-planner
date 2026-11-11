import { addDays, dayKeyOf, type DayKey } from '@nowish/domain';

import { stableHash } from './collab';

/**
 * Demo weather (Phase 6, ADR 0015): a deterministic, clearly labelled fake forecast – no weather service is
 * called. A real provider needs a decision on cost and privacy first (privacy.md, block B3).
 */
export const WEATHER_KINDS = ['sun', 'clouds', 'rain', 'storm'] as const;
export type WeatherKind = (typeof WEATHER_KINDS)[number];

export interface DemoForecast {
  kind: WeatherKind;
  /** 0–100 %. */
  rainChance: number;
  tempC: number;
}

/** Forecasts exist for the next 7 days only – like a real service. */
export const FORECAST_DAYS = 7;

/** Fixed demo examples so the rain plan can be tried: the barbecue looks rainy, the run sunny. */
const FIXED: Record<string, DemoForecast> = {
  'demo-bbq': { kind: 'rain', rainChance: 70, tempC: 14 },
  'demo-run': { kind: 'sun', rainChance: 10, tempC: 9 },
};

export function demoForecast(eventId: string, day: DayKey, now: Date, timeZone: string): DemoForecast | null {
  const today = dayKeyOf(now, timeZone);
  if (day < today || day >= addDays(today, FORECAST_DAYS)) return null;
  const fixed = FIXED[eventId];
  if (fixed) return fixed;
  const h = stableHash(`${eventId}:${day}`);
  const rainChance = (h % 10) * 10;
  const kind: WeatherKind =
    rainChance >= 80 ? 'storm' : rainChance >= 50 ? 'rain' : rainChance >= 30 ? 'clouds' : 'sun';
  return { kind, rainChance, tempC: 4 + (h % 15) };
}

/** From this rain chance the host is nudged towards plan B. */
export const PLAN_B_RAIN_CHANCE = 60;
