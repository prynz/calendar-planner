/**
 * Contextual premium hints (monetization.md §3): never more than 1 per day and 3 per week overall, and each
 * trigger at most once per 30 days. Explanations at a hard limit are not hints – they are always shown.
 */
export const HINT_TRIGGERS = [
  'hosted-events',
  'groups',
  'reminder-stages',
  'buffer-learning',
  'ready-check',
  'covers',
  'cost-split',
  'family-size',
] as const;
export type HintTrigger = (typeof HINT_TRIGGERS)[number];

export interface HintShown {
  trigger: HintTrigger;
  at: Date;
}

const DAY = 86_400_000;

export function mayShowHint(history: readonly HintShown[], trigger: HintTrigger, now: Date): boolean {
  const within = (days: number) => history.filter((h) => now.getTime() - h.at.getTime() < days * DAY);
  if (within(1).length >= 1) return false;
  if (within(7).length >= 3) return false;
  return !within(30).some((h) => h.trigger === trigger);
}

/** Keeps only what the rules still need (30 days). */
export const pruneHints = (history: readonly HintShown[], now: Date): HintShown[] =>
  history.filter((h) => now.getTime() - h.at.getTime() < 30 * DAY);
