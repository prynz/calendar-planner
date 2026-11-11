import { nextId } from '../collab/model';
import { weekdayOf, type Weekday } from '../recurrence';
import { addDays, type DayKey } from '../time';
import { isMember, requireAdult } from './household';
import { FAMILY_LIMITS, FamilyError, type Chore, type ChoreEvery, type Household } from './model';

export interface ChoreInput {
  title: string;
  emoji?: string;
  every: ChoreEvery;
  weekday?: Weekday;
  rotation: readonly string[];
}

const daysBetween = (a: DayKey, b: DayKey) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

export function isChoreDue(c: Chore, day: DayKey): boolean {
  if (day < c.startDay) return false;
  return c.every === 'daily' || weekdayOf(day) === c.weekday;
}

/** Number of due days from the start up to (excluding) `day` – the rotation position. */
function dueIndex(c: Chore, day: DayKey): number {
  const diff = daysBetween(c.startDay, day);
  if (c.every === 'daily') return diff;
  return Math.floor(diff / 7);
}

/** FAM-07: whose turn it is on a due day. Fair by construction: strict round robin. */
export function choreTurn(c: Chore, day: DayKey): string | undefined {
  if (!isChoreDue(c, day) || c.rotation.length === 0) return undefined;
  return c.rotation[dueIndex(c, day) % c.rotation.length];
}

/** Next due day on or after `from`. */
export function nextChoreDay(c: Chore, from: DayKey): DayKey {
  let d = from < c.startDay ? c.startDay : from;
  for (let i = 0; i < 7 && !isChoreDue(c, d); i++) d = addDays(d, 1);
  return d;
}

function checkChore(h: Household, input: ChoreInput) {
  const title = input.title.trim();
  if (title.length === 0 || title.length > FAMILY_LIMITS.title) throw new FamilyError('invalid-input');
  if (input.every === 'weekly' && input.weekday === undefined) throw new FamilyError('invalid-input');
  const rotation = [...new Set(input.rotation)];
  if (rotation.length === 0 || rotation.some((id) => !isMember(h, id))) throw new FamilyError('invalid-input');
  const emoji = input.emoji?.trim();
  return { title, rotation, emoji };
}

export function addChore(h: Household, by: string, input: ChoreInput, from: DayKey, now: Date): Household {
  requireAdult(h, by);
  if (h.chores.length >= FAMILY_LIMITS.chores) throw new FamilyError('limit');
  const { title, rotation, emoji } = checkChore(h, input);
  const base: Chore = {
    id: nextId('chore', h.chores, now),
    title,
    ...(emoji ? { emoji } : {}),
    every: input.every,
    ...(input.every === 'weekly' ? { weekday: input.weekday } : {}),
    startDay: from,
    rotation,
    done: {},
  };
  return { ...h, chores: [...h.chores, { ...base, startDay: nextChoreDay(base, from) }] };
}

export function removeChore(h: Household, by: string, id: string): Household {
  requireAdult(h, by);
  if (!h.chores.some((c) => c.id === id)) throw new FamilyError('not-found');
  return { ...h, chores: h.chores.filter((c) => c.id !== id) };
}

/** Tick a chore for a due day (any adult can tick for a child); ticking again un-ticks. */
export function toggleChoreDone(h: Household, by: string, id: string, day: DayKey): Household {
  requireAdult(h, by);
  const chore = h.chores.find((c) => c.id === id);
  if (!chore) throw new FamilyError('not-found');
  const who = choreTurn(chore, day);
  if (!who) throw new FamilyError('invalid-input');
  const done = { ...chore.done };
  if (done[day]) delete done[day];
  else done[day] = who;
  return { ...h, chores: h.chores.map((c) => (c.id === id ? { ...c, done } : c)) };
}

/** Today's chores: due ones with whose turn it is and whether they are done. */
export function choresFor(h: Household, day: DayKey) {
  return h.chores
    .filter((c) => isChoreDue(c, day))
    .map((c) => ({ chore: c, turn: choreTurn(c, day), done: !!c.done[day] }));
}
