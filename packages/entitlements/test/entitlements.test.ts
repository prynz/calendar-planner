import { describe, expect, it } from 'vitest';

import {
  AD_FORBIDDEN_SURFACES,
  AD_SLOTS,
  canAddOne,
  cancel,
  canShowAd,
  cheapestTierWith,
  demoPurchase,
  effectiveTier,
  FREE,
  LIMITS,
  mayShowHint,
  nextRenewal,
  PRICES,
  startTrial,
  TIERS,
  trialDaysLeft,
  trialEndingSoon,
  type AdContext,
} from '../src';

const NOW = new Date('2026-11-11T10:00:00Z');
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

describe('tier matrix', () => {
  it('keeps the core free and the focus mode out of the paywall', () => {
    expect(LIMITS.free.activeHostedEvents).toBe(5);
    expect(LIMITS.free.groups).toBe(1);
    expect(LIMITS.plus.activeHostedEvents).toBeNull();
    // Accessibility is never paywalled: there is no focus-mode gate at all.
    for (const t of TIERS) expect(Object.keys(LIMITS[t])).not.toContain('focusMode');
  });

  it('prices are integer cents and yearly is cheaper than 12 months', () => {
    for (const p of Object.values(PRICES)) {
      expect(Number.isInteger(p.monthly) && Number.isInteger(p.yearly)).toBe(true);
      expect(p.yearly).toBeLessThan(p.monthly * 12);
    }
  });

  it('children do not count towards the family adults', () => {
    expect(LIMITS.family.familyAdults).toBe(6);
    expect(LIMITS.family.familyKids).toBeGreaterThan(LIMITS.free.familyKids);
  });

  it('checks limits without ever touching what exists', () => {
    expect(canAddOne(5, 4)).toEqual({ ok: true });
    expect(canAddOne(5, 5)).toEqual({ ok: false, limit: 5 });
    expect(canAddOne(5, 9)).toEqual({ ok: false, limit: 5 }); // after a downgrade: nothing is removed
    expect(canAddOne(null, 1000)).toEqual({ ok: true });
    expect(cheapestTierWith((l) => l.readyCheck)).toBe('plus');
    expect(cheapestTierWith((l) => l.familyAdults > 2)).toBe('family');
  });
});

describe('subscription', () => {
  it('runs a 14-day trial, reminds 3 days ahead and falls back to Free', () => {
    const trial = startTrial(NOW);
    expect(effectiveTier(trial, days(13))).toBe('plus');
    expect(trialDaysLeft(trial, NOW)).toBe(14);
    expect(trialEndingSoon(trial, days(10))).toBe(false);
    expect(trialEndingSoon(trial, days(11.5))).toBe(true);
    expect(effectiveTier(trial, days(14))).toBe('free');
    expect(trialDaysLeft(trial, days(15))).toBeNull();
  });

  it('a demo purchase renews; cancelled plans run until the period end', () => {
    const sub = demoPurchase('pro', 'monthly', NOW);
    expect(effectiveTier(sub, days(40))).toBe('pro');
    expect(nextRenewal(sub, days(40))?.toISOString()).toBe('2027-01-11T10:00:00.000Z');
    const c = cancel(sub);
    expect(nextRenewal(c, NOW)).toBeNull();
    expect(effectiveTier(c, days(29))).toBe('pro');
    expect(effectiveTier(c, days(31))).toBe('free');
    expect(cancel(startTrial(NOW))).toEqual(FREE);
  });
});

describe('house ads', () => {
  const base: AdContext = {
    tier: 'free',
    slot: 'settings_card',
    surface: 'settings',
    firstSession: false,
    shownThisSession: 0,
    shownToday: 0,
    dismissedToday: false,
  };

  it('only free users see them, never in the first session, within caps', () => {
    expect(canShowAd(base)).toBe(true);
    expect(canShowAd({ ...base, tier: 'plus' })).toBe(false);
    expect(canShowAd({ ...base, firstSession: true })).toBe(false);
    expect(canShowAd({ ...base, shownThisSession: 1 })).toBe(false);
    expect(canShowAd({ ...base, dismissedToday: true })).toBe(false);
  });

  it('no slot can render on a forbidden surface', () => {
    for (const surface of AD_FORBIDDEN_SURFACES)
      for (const slot of AD_SLOTS) expect(canShowAd({ ...base, slot, surface })).toBe(false);
    expect(AD_FORBIDDEN_SURFACES).toEqual(
      expect.arrayContaining(['chat', 'editor', 'focus', 'onboarding', 'privacy', 'paywall', 'ready-check', 'late']),
    );
  });
});

describe('premium hints', () => {
  it('max 1 per day, 3 per week, each trigger once per 30 days', () => {
    expect(mayShowHint([], 'groups', NOW)).toBe(true);
    expect(mayShowHint([{ trigger: 'covers', at: days(-0.5) }], 'groups', NOW)).toBe(false);
    const week = [1, 2, 3].map((d) => ({ trigger: 'covers' as const, at: days(-d - 0.1) }));
    expect(mayShowHint(week, 'groups', NOW)).toBe(false);
    expect(mayShowHint([{ trigger: 'groups', at: days(-20) }], 'groups', NOW)).toBe(false);
    expect(mayShowHint([{ trigger: 'groups', at: days(-31) }], 'groups', NOW)).toBe(true);
  });
});
