import { TRIAL_DAYS, TRIAL_REMINDER_DAYS, type BillingPeriod, type PaidTier, type Tier } from './tiers';

/**
 * The viewer's plan. `demo-purchase` is a simulated purchase (ADR 0015): nothing is charged, the UI says so.
 * In block B4 this comes from the server (store receipts via RevenueCat + comp grants).
 */
export type Subscription =
  | { source: 'free' }
  | { source: 'trial'; tier: PaidTier; startedAt: Date; trialEndsAt: Date }
  | {
      source: 'demo-purchase';
      tier: PaidTier;
      period: BillingPeriod;
      startedAt: Date;
      renewsAt: Date;
      /** Cancelled: runs until `renewsAt`, then Free (like the stores). */
      cancelled: boolean;
    };

const DAY = 86_400_000;

export const FREE: Subscription = { source: 'free' };

export function startTrial(now: Date, tier: PaidTier = 'plus'): Subscription {
  return { source: 'trial', tier, startedAt: now, trialEndsAt: new Date(now.getTime() + TRIAL_DAYS * DAY) };
}

function addPeriod(d: Date, period: BillingPeriod): Date {
  const next = new Date(d.getTime());
  if (period === 'monthly') next.setUTCMonth(next.getUTCMonth() + 1);
  else next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

export function demoPurchase(tier: PaidTier, period: BillingPeriod, now: Date): Subscription {
  return { source: 'demo-purchase', tier, period, startedAt: now, renewsAt: addPeriod(now, period), cancelled: false };
}

/** Cancelling keeps the plan until the end of the paid period. */
export function cancel(sub: Subscription): Subscription {
  return sub.source === 'demo-purchase' ? { ...sub, cancelled: true } : sub.source === 'trial' ? FREE : sub;
}

/**
 * The tier that counts right now. An expired trial or a cancelled plan past its end falls back to Free; an
 * uncancelled demo plan renews (there is no real payment that could fail).
 */
export function effectiveTier(sub: Subscription, now: Date): Tier {
  if (sub.source === 'free') return 'free';
  if (sub.source === 'trial') return now.getTime() < sub.trialEndsAt.getTime() ? sub.tier : 'free';
  if (sub.cancelled && now.getTime() >= sub.renewsAt.getTime()) return 'free';
  return sub.tier;
}

/** Next renewal date for display (uncancelled demo plans roll over period by period). */
export function nextRenewal(sub: Subscription, now: Date): Date | null {
  if (sub.source !== 'demo-purchase' || sub.cancelled) return null;
  let d = sub.renewsAt;
  while (d.getTime() <= now.getTime()) d = addPeriod(d, sub.period);
  return d;
}

/** Days left in the trial (rounded up), or null outside a running trial. */
export function trialDaysLeft(sub: Subscription, now: Date): number | null {
  if (sub.source !== 'trial') return null;
  const ms = sub.trialEndsAt.getTime() - now.getTime();
  return ms > 0 ? Math.ceil(ms / DAY) : null;
}

/** The friendly "your trial ends in 3 days" reminder is due. */
export const trialEndingSoon = (sub: Subscription, now: Date) => {
  const left = trialDaysLeft(sub, now);
  return left !== null && left <= TRIAL_REMINDER_DAYS;
};
