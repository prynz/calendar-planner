import Constants from 'expo-constants';

import { EnvValidationError, parseClientEnv, type ClientConfig } from '@nowish/config';

export type ClientConfigResult = { ok: true; config: ClientConfig } | { ok: false; reason: string };

/**
 * Reads EXPO_PUBLIC_* (inlined by Metro). No backend configured → demo mode (ADR 0008).
 * Misconfiguration is reported in Settings instead of crashing the prototype.
 */
export function loadClientConfig(): ClientConfigResult {
  const variant = (Constants.expoConfig?.extra as { variant?: string } | undefined)?.variant;
  try {
    return {
      ok: true,
      config: parseClientEnv({
        APP_VARIANT: variant,
        SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      }),
    };
  } catch (error) {
    if (error instanceof EnvValidationError) return { ok: false, reason: error.issues.join('; ') };
    throw error;
  }
}
