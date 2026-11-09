/**
 * Brand single source of truth (ADR 0007). Renaming the product = editing this file
 * (plus regenerating assets with `pnpm brand:assets`).
 * Pure module: used by app config (Node), the app (Metro) and asset renderers.
 */

export const brand = {
  /** Working name – trademark clearance pending (Nowish + alternative Gleichda). */
  name: 'Nowish',
  alternativeName: 'Gleichda',
  wordmark: 'nowish.',
  status: 'working-name' as const,
} as const;

/** Claims per locale (drafts, docs/brand/brand-foundation.md §3). */
export const claims = {
  de: ['Du chillst. Wir planen.', 'Endlich pünktlich. Ohne Stress.', 'Aus „gleich“ wird jetzt.'],
  en: ['You show up. We handle the rest.', 'From now-ish to right on time.'],
} as const;

/**
 * Identifiers. Neutral until trademark clearance – bundle id and URL scheme are permanent after the
 * first store upload (ADR 0007, ADR 0008). Prototype builds are never published.
 */
export const identifiers = {
  bundleIdBase: 'dev.calendarplanner.app',
  urlScheme: 'calendarplanner',
  expoSlug: 'calendar-planner',
} as const;

// Explicit extension: this module is also loaded by Node (app.config.ts) with native type stripping.
export * from './logo.ts';
