/**
 * Subscription tiers, prices and limits as data – the single source of truth (monetization.md §2).
 * In the prototype the app reads them locally (Demo purchase, ADR 0015); in block B4 the server decides the
 * effective tier and the app only displays it (rule 1: the server is the authority).
 */

export const TIERS = ['free', 'plus', 'pro', 'family'] as const;
export type Tier = (typeof TIERS)[number];
export type PaidTier = Exclude<Tier, 'free'>;
export const PAID_TIERS: readonly PaidTier[] = ['plus', 'pro', 'family'];

export const BILLING_PERIODS = ['monthly', 'yearly'] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

/** Euro cents incl. VAT (PO decision 2026-11-09). Real prices come from the stores in block B4. */
export const PRICES: Record<PaidTier, Record<BillingPeriod, number>> = {
  plus: { monthly: 299, yearly: 2499 },
  pro: { monthly: 599, yearly: 4999 },
  family: { monthly: 699, yearly: 5999 },
};

export const TRIAL_DAYS = 14;
/** Reminder before the trial ends – 3 days, not only on the last day (monetization.md §2). */
export const TRIAL_REMINDER_DAYS = 3;

/** `null` = unlimited. */
export type Limit = number | null;

export interface TierLimits {
  /** Hosted social events that have not ended yet. */
  activeHostedEvents: Limit;
  participantsPerEvent: Limit;
  groups: Limit;
  familyAdults: number;
  /** Child profiles do not count towards the adults (monetization.md §2). */
  familyKids: number;
  /** Free: leave time + one reminder; paid: all stages and tones. */
  reminderStages: 'one' | 'all';
  bufferLearning: boolean;
  readyCheck: boolean;
  /** Free: equal split, one currency; paid: shares and exact amounts. */
  costSplit: 'equal' | 'full';
  covers: 'basic' | 'premium';
  houseAds: boolean;
}

export const LIMITS: Record<Tier, TierLimits> = {
  free: {
    activeHostedEvents: 5,
    participantsPerEvent: 15,
    groups: 1,
    familyAdults: 2,
    familyKids: 2,
    reminderStages: 'one',
    bufferLearning: false,
    readyCheck: false,
    costSplit: 'equal',
    covers: 'basic',
    houseAds: true,
  },
  plus: {
    activeHostedEvents: null,
    participantsPerEvent: 50,
    groups: 5,
    familyAdults: 2,
    familyKids: 2,
    reminderStages: 'all',
    bufferLearning: true,
    readyCheck: true,
    costSplit: 'full',
    covers: 'premium',
    houseAds: false,
  },
  pro: {
    activeHostedEvents: null,
    participantsPerEvent: 250,
    groups: null,
    familyAdults: 2,
    familyKids: 2,
    reminderStages: 'all',
    bufferLearning: true,
    readyCheck: true,
    costSplit: 'full',
    covers: 'premium',
    houseAds: false,
  },
  family: {
    activeHostedEvents: null,
    participantsPerEvent: 50,
    groups: 5,
    familyAdults: 6,
    familyKids: 10,
    reminderStages: 'all',
    bufferLearning: true,
    readyCheck: true,
    costSplit: 'full',
    covers: 'premium',
    houseAds: false,
  },
};

export type LimitCheck = { ok: true } | { ok: false; limit: number };

/**
 * May one more be added? Downgrades never delete anything (monetization.md §1.7): existing items stay,
 * only adding beyond the limit is refused – with the limit for a clear explanation.
 */
export function canAddOne(limit: Limit, current: number): LimitCheck {
  if (limit === null || current < limit) return { ok: true };
  return { ok: false, limit };
}

/** The cheapest tier that lifts a boolean/enum gate – used to point the paywall at the right plan. */
export function cheapestTierWith(pred: (l: TierLimits) => boolean): PaidTier | null {
  return PAID_TIERS.find((t) => pred(LIMITS[t])) ?? null;
}
