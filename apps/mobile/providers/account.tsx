import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { z } from 'zod';

import { dayKeyOf, type DayKey } from '@nowish/domain';
import {
  AD_SLOTS,
  BILLING_PERIODS,
  cancel,
  demoPurchase,
  effectiveTier,
  FREE,
  HINT_TRIGGERS,
  LIMITS,
  PAID_TIERS,
  pruneHints,
  startTrial,
  type AdSlot,
  type BillingPeriod,
  type HintShown,
  type HintTrigger,
  type PaidTier,
  type Subscription,
  type Tier,
  type TierLimits,
} from '@nowish/entitlements';

import type { SettingsStore } from '@/storage/settings-store';

/**
 * The viewer's local profile and plan (Phase 6, ADR 0015). Prototype only: no account on a server. Stored as
 * one validated JSON document; corrupt data falls back to a fresh start (onboarding again) instead of crashing.
 */
export interface Account {
  onboarded: boolean;
  /** "I am at least 16" – a confirmation, never a birth date (ADR 0004). */
  ageConfirmed: boolean;
  /** The onboarding day: no house ads in the first session (monetization.md §4.1). */
  firstDay?: DayKey;
  displayName: string;
  statusEmoji?: string;
  /** PayPal.me user name for cost split links (costs.md CST-06). */
  paypalMe?: string;
  subscription: Subscription;
  hints: HintShown[];
  ads: { day: DayKey; shown: Partial<Record<AdSlot, number>>; dismissed: AdSlot[] };
}

export const DEFAULT_ACCOUNT: Account = {
  onboarded: false,
  ageConfirmed: false,
  displayName: '',
  subscription: FREE,
  hints: [],
  ads: { day: '1970-01-01', shown: {}, dismissed: [] },
};

const KEY = 'account.v1';
const date = z.iso.datetime().transform((s) => new Date(s));
const tier = z.enum(PAID_TIERS as unknown as [PaidTier, ...PaidTier[]]); // PAID_TIERS is a non-empty constant
const schema = z.object({
  onboarded: z.boolean(),
  ageConfirmed: z.boolean(),
  firstDay: z.string().optional(),
  displayName: z.string().max(40),
  statusEmoji: z.string().max(8).optional(),
  paypalMe: z
    .string()
    .regex(/^[A-Za-z0-9]{1,20}$/)
    .optional(),
  subscription: z.discriminatedUnion('source', [
    z.object({ source: z.literal('free') }),
    z.object({ source: z.literal('trial'), tier, startedAt: date, trialEndsAt: date }),
    z.object({
      source: z.literal('demo-purchase'),
      tier,
      period: z.enum(BILLING_PERIODS),
      startedAt: date,
      renewsAt: date,
      cancelled: z.boolean(),
    }),
  ]),
  hints: z.array(z.object({ trigger: z.enum(HINT_TRIGGERS), at: date })),
  ads: z.object({
    day: z.string(),
    shown: z.partialRecord(z.enum(AD_SLOTS), z.number().int().min(0)),
    dismissed: z.array(z.enum(AD_SLOTS)),
  }),
});

function parseAccount(raw: string | null): Account {
  if (!raw) return DEFAULT_ACCOUNT;
  try {
    const parsed = schema.parse(JSON.parse(raw));
    const { firstDay, statusEmoji, paypalMe, ...rest } = parsed;
    return {
      ...rest,
      ...(firstDay ? { firstDay } : {}),
      ...(statusEmoji ? { statusEmoji } : {}),
      ...(paypalMe ? { paypalMe } : {}),
    } as Account; // zod output only differs by `?: T | undefined`, removed above
  } catch (error) {
    console.warn(
      '[account] stored profile unreadable, starting fresh',
      error instanceof Error ? error.name : 'unknown',
    );
    return DEFAULT_ACCOUNT;
  }
}

interface AccountContextValue {
  state: 'loading' | 'ready';
  account: Account;
  tier: Tier;
  limits: TierLimits;
  update: (fn: (a: Account) => Account) => Promise<void>;
  completeOnboarding: (input: { displayName: string }) => Promise<void>;
  purchase: (tier: PaidTier, period: BillingPeriod) => Promise<void>;
  cancelPlan: () => Promise<void>;
  /** Prototype helper: try the Free limits right away (Demo). */
  switchToFree: () => Promise<void>;
  noteHint: (trigger: HintTrigger) => void;
  /** House-ad bookkeeping, on the device only (monetization.md §4.4). */
  adState: (slot: AdSlot) => {
    shownToday: number;
    shownThisSession: number;
    dismissedToday: boolean;
    firstSession: boolean;
  };
  adShown: (slot: AdSlot) => void;
  adDismissed: (slot: AdSlot) => void;
  /** "Delete my data" – back to a fresh start. */
  reset: () => Promise<void>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({
  store,
  children,
  now = () => new Date(),
  timeZone,
  fallback = DEFAULT_ACCOUNT,
}: {
  store: SettingsStore;
  children: ReactNode;
  now?: () => Date;
  timeZone: string;
  /** Used when nothing is stored yet (tests start onboarded). */
  fallback?: Account;
}) {
  const [state, setState] = useState<'loading' | 'ready'>('loading');
  const [account, setAccount] = useState<Account>(fallback);
  const ref = useRef(account);
  const session = useRef<Partial<Record<AdSlot, number>>>({});
  const [, bump] = useState(0);

  useEffect(() => {
    let alive = true;
    store
      .get(KEY)
      .then((raw) => {
        if (!alive) return;
        const a = raw ? parseAccount(raw) : fallback;
        ref.current = a;
        setAccount(a);
        setState('ready');
      })
      .catch((error: unknown) => {
        console.warn('[account] load failed', error instanceof Error ? error.message : 'unknown');
        if (alive) setState('ready');
      });
    return () => {
      alive = false;
    };
    // The fallback is fixed for the provider's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  const update = useCallback(
    async (fn: (a: Account) => Account) => {
      const previous = ref.current;
      const next = fn(previous);
      ref.current = next;
      setAccount(next);
      try {
        await store.set(KEY, JSON.stringify(next));
      } catch (error) {
        ref.current = previous;
        setAccount(previous);
        throw error;
      }
    },
    [store],
  );

  const today = () => dayKeyOf(now(), timeZone);
  const adsToday = (a: Account) => (a.ads.day === today() ? a.ads : { day: today(), shown: {}, dismissed: [] });
  const t = now();
  const currentTier = effectiveTier(account.subscription, t);

  const value: AccountContextValue = {
    state,
    account,
    tier: currentTier,
    limits: LIMITS[currentTier],
    update,
    completeOnboarding: ({ displayName }) =>
      update((a) => ({
        ...a,
        onboarded: true,
        ageConfirmed: true,
        firstDay: today(),
        displayName: displayName.trim().slice(0, 40),
        // Every new start gets the 14-day Plus trial (Demo) – no payment data, ends by itself.
        subscription: a.subscription.source === 'free' ? startTrial(now()) : a.subscription,
      })),
    purchase: (tier, period) => update((a) => ({ ...a, subscription: demoPurchase(tier, period, now()) })),
    cancelPlan: () => update((a) => ({ ...a, subscription: cancel(a.subscription) })),
    switchToFree: () => update((a) => ({ ...a, subscription: FREE })),
    noteHint: (trigger) => {
      update((a) => ({ ...a, hints: [...pruneHints(a.hints, now()), { trigger, at: now() }] })).catch((e: unknown) =>
        console.warn('[account] hint not saved', e instanceof Error ? e.message : 'unknown'),
      );
    },
    adState: (slot) => {
      const ads = adsToday(account);
      return {
        shownToday: ads.shown[slot] ?? 0,
        shownThisSession: session.current[slot] ?? 0,
        dismissedToday: ads.dismissed.includes(slot),
        firstSession: account.firstDay === today(),
      };
    },
    adShown: (slot) => {
      session.current = { ...session.current, [slot]: (session.current[slot] ?? 0) + 1 };
      update((a) => {
        const ads = adsToday(a);
        return { ...a, ads: { ...ads, shown: { ...ads.shown, [slot]: (ads.shown[slot] ?? 0) + 1 } } };
      }).catch((e: unknown) =>
        console.warn('[account] ad count not saved', e instanceof Error ? e.message : 'unknown'),
      );
    },
    adDismissed: (slot) => {
      bump((n) => n + 1);
      update((a) => {
        const ads = adsToday(a);
        return { ...a, ads: { ...ads, dismissed: [...new Set([...ads.dismissed, slot])] } };
      }).catch((e: unknown) =>
        console.warn('[account] ad dismiss not saved', e instanceof Error ? e.message : 'unknown'),
      );
    },
    reset: () => update(() => DEFAULT_ACCOUNT),
  };

  // Rebuilt each render on purpose: it is cheap and reads the clock for the effective tier.
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside <AccountProvider>');
  return ctx;
}

/** Test/demo account: onboarded, inside the Plus trial. */
export const onboardedAccount = (now: Date, timeZone: string): Account => ({
  ...DEFAULT_ACCOUNT,
  onboarded: true,
  ageConfirmed: true,
  firstDay: dayKeyOf(new Date(now.getTime() - 3 * 86_400_000), timeZone),
  displayName: 'Chris',
  subscription: startTrial(new Date(now.getTime() - 86_400_000)),
});
