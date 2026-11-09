import { describe, expect, it } from 'vitest';

import { EnvValidationError, isPrivilegedSupabaseKey, parseClientEnv } from '../src';

const b64url = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const jwt = (role: string) => `${b64url({ alg: 'HS256' })}.${b64url({ role, iss: 'supabase' })}.signature-part`;

describe('isPrivilegedSupabaseKey', () => {
  it('flags secret and service-role keys', () => {
    expect(isPrivilegedSupabaseKey('sb_secret_abcdefghijklmnopqrstuvwxyz')).toBe(true);
    expect(isPrivilegedSupabaseKey(jwt('service_role'))).toBe(true);
  });
  it('lets anon and publishable keys pass', () => {
    expect(isPrivilegedSupabaseKey(jwt('anon'))).toBe(false);
    expect(isPrivilegedSupabaseKey('sb_publishable_abcdefghijklmnopqrstuvwxyz')).toBe(false);
    expect(isPrivilegedSupabaseKey('not.a-jwt.!!!')).toBe(false);
  });
});

describe('parseClientEnv', () => {
  it('falls back to demo mode without backend config', () => {
    expect(parseClientEnv({})).toEqual({ variant: 'development', backend: 'demo' });
    expect(parseClientEnv({ APP_VARIANT: 'preview', SUPABASE_URL: '', SUPABASE_ANON_KEY: ' ' })).toEqual({
      variant: 'preview',
      backend: 'demo',
    });
  });

  it('accepts a complete Supabase config', () => {
    const cfg = parseClientEnv({ SUPABASE_URL: 'https://abc.supabase.co', SUPABASE_ANON_KEY: jwt('anon') });
    expect(cfg).toMatchObject({ backend: 'supabase', host: 'abc.supabase.co' });
  });

  it('rejects a service-role key in the client', () => {
    expect(() =>
      parseClientEnv({ SUPABASE_URL: 'https://abc.supabase.co', SUPABASE_ANON_KEY: jwt('service_role') }),
    ).toThrow(EnvValidationError);
  });

  it('rejects half-configured backends and bad values', () => {
    expect(() => parseClientEnv({ SUPABASE_URL: 'https://abc.supabase.co' })).toThrow(/set together/);
    expect(() => parseClientEnv({ SUPABASE_URL: 'ftp://x', SUPABASE_ANON_KEY: jwt('anon') })).toThrow(
      EnvValidationError,
    );
    expect(() => parseClientEnv({ APP_VARIANT: 'staging' })).toThrow(EnvValidationError);
  });
});
