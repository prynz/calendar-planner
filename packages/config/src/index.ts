import { z } from 'zod';

export const APP_VARIANTS = ['development', 'preview', 'production'] as const;
export type AppVariant = (typeof APP_VARIANTS)[number];

/**
 * True for Supabase keys that must never ship to a client: `sb_secret_…` keys and legacy JWTs
 * with role `service_role`. Publishable / anon keys pass.
 */
export function isPrivilegedSupabaseKey(key: string): boolean {
  if (key.startsWith('sb_secret_')) return true;
  const parts = key.split('.');
  if (parts.length !== 3 || !parts[1]) return false;
  let payload: unknown;
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    // Not a JWT payload → not a legacy service-role key.
    return false;
  }
  return typeof payload === 'object' && payload !== null && (payload as { role?: unknown }).role === 'service_role';
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  // atob exists in Hermes, browsers, Deno and Node ≥ 16.
  return atob(padded);
}

const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const clientEnvSchema = z
  .object({
    APP_VARIANT: z.enum(APP_VARIANTS).default('development'),
    SUPABASE_URL: z.preprocess(emptyToUndefined, z.url({ protocol: /^https?$/ }).optional()),
    SUPABASE_ANON_KEY: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .min(20, 'must be a Supabase anon/publishable key')
        .refine((k) => !isPrivilegedSupabaseKey(k), {
          message: 'privileged (service-role/secret) key must never be exposed to a client',
        })
        .optional(),
    ),
  })
  .refine((e) => (e.SUPABASE_URL === undefined) === (e.SUPABASE_ANON_KEY === undefined), {
    message: 'SUPABASE_URL and SUPABASE_ANON_KEY must be set together',
    path: ['SUPABASE_ANON_KEY'],
  });

/** What the client may do with its environment. */
export type ClientConfig =
  | { variant: AppVariant; backend: 'demo' }
  | { variant: AppVariant; backend: 'supabase'; supabaseUrl: string; supabaseAnonKey: string; host: string };

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment configuration: ${issues.join('; ')}`);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validates client env (mobile `EXPO_PUBLIC_*`, web `NEXT_PUBLIC_*`, passed without prefix).
 * No backend configured → demo mode (ADR 0008). Throws `EnvValidationError` listing every problem.
 */
export function parseClientEnv(raw: Record<string, string | undefined>): ClientConfig {
  const result = clientEnvSchema.safeParse(raw);
  if (!result.success) {
    throw new EnvValidationError(result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`));
  }
  const { APP_VARIANT: variant, SUPABASE_URL: url, SUPABASE_ANON_KEY: key } = result.data;
  if (url === undefined || key === undefined) return { variant, backend: 'demo' };
  return { variant, backend: 'supabase', supabaseUrl: url, supabaseAnonKey: key, host: new URL(url).host };
}
