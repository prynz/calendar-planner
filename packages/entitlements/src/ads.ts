import type { Tier } from './tiers';
import { LIMITS } from './tiers';

/**
 * House ads (monetization.md §4): own content only, no external SDKs, no tracking. Free users only.
 * Forbidden surfaces are fixed in code and cannot be configured – a test guards them.
 */
export const AD_FORBIDDEN_SURFACES = [
  'chat',
  'group-chat',
  'editor',
  'profile',
  'reminders',
  'ready-check',
  'late',
  'live-eta',
  'focus',
  'onboarding',
  'privacy',
  'account-deletion',
  'subscription',
  'paywall',
  'guest-web',
] as const;
export type ForbiddenSurface = (typeof AD_FORBIDDEN_SURFACES)[number];

export const AD_SLOTS = [
  'agenda_feed',
  'events_overview_banner',
  'post_event_create',
  'settings_card',
  'empty_state',
] as const;
export type AdSlot = (typeof AD_SLOTS)[number];

/** Default caps per slot (admin-configurable in block B4). */
export const AD_CAPS: Record<AdSlot, { perSession: number; perDay: number }> = {
  agenda_feed: { perSession: 3, perDay: 3 },
  events_overview_banner: { perSession: 1, perDay: 3 },
  post_event_create: { perSession: 1, perDay: 1 },
  settings_card: { perSession: 1, perDay: 3 },
  empty_state: { perSession: 1, perDay: 3 },
};

/** Seconds until the close button appears: 0–5, never without one (monetization.md §4.3). */
export const MAX_CLOSE_DELAY_S = 5;

export interface AdContext {
  tier: Tier;
  slot: AdSlot;
  /** The screen the slot sits on. */
  surface: string;
  /** No ads in the whole first session (onboarding day). */
  firstSession: boolean;
  shownThisSession: number;
  shownToday: number;
  /** Dismissed by the user today. */
  dismissedToday: boolean;
}

export const isForbiddenSurface = (surface: string): boolean =>
  (AD_FORBIDDEN_SURFACES as readonly string[]).includes(surface);

export function canShowAd(c: AdContext): boolean {
  if (!LIMITS[c.tier].houseAds) return false;
  if (isForbiddenSurface(c.surface) || c.firstSession || c.dismissedToday) return false;
  const cap = AD_CAPS[c.slot];
  return c.shownThisSession < cap.perSession && c.shownToday < cap.perDay;
}
