import { zonedWallTimeToInstant, type DayKey } from '@nowish/domain';

/** The instant of `minute` (after local midnight) on `day` in `timeZone`. */
export const instantAt = (day: DayKey, minute: number, timeZone: string): Date =>
  zonedWallTimeToInstant(day, Math.floor(minute / 60), minute % 60, timeZone);
