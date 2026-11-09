-- Phase 1 foundation (docs/architecture/data-model.md §4, CLAUDE.md rule 2).
-- 1. New functions in `public` are NOT executable by anon/authenticated unless granted explicitly.
-- 2. system_settings: feature flags / remote config; regulated or risky features default to OFF.
-- 3. client_config(): the only way clients read settings, and only keys marked client-visible.

-- PUBLIC gets EXECUTE on new functions through a *global* default; a schema-level revoke cannot
-- remove it, so it is revoked globally for the role that owns our migrations.
alter default privileges for role postgres revoke execute on functions from public;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.system_settings (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{1,63}$'),
  value jsonb not null,
  is_client_visible boolean not null default false,
  description text not null,
  updated_at timestamptz not null default now()
);

comment on table public.system_settings is
  'Feature flags and remote config. Written by admins only (Phase 8, audited). Clients read via client_config().';

alter table public.system_settings enable row level security;
-- No policies for anon/authenticated: direct access is denied. service_role bypasses RLS.
revoke all on public.system_settings from anon, authenticated;

create trigger system_settings_set_updated_at
  before update on public.system_settings
  for each row execute function public.set_updated_at();

insert into public.system_settings (key, value, is_client_visible, description) values
  ('demo_mode', 'true', true, 'Prototype runs with example data and labels it "Demo" (ADR 0008).'),
  ('house_ads_enabled', 'false', true, 'Global kill switch for internal house ads (monetization.md §4). Off until Phase 8.'),
  ('live_eta_enabled', 'false', true, 'Live ETA sharing (places-maps.md). Off until Phase 6 and privacy review.'),
  ('ai_assistant_enabled', 'false', false, 'AI assistant is planned, not decided (roadmap.md §5). Must stay off.');

create or replace function public.client_config()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_object_agg(s.key, s.value order by s.key), '{}'::jsonb)
  from public.system_settings s
  where s.is_client_visible;
$$;

comment on function public.client_config() is 'Client-visible settings only. Safe for anon (guest web) and authenticated.';

revoke execute on function public.client_config() from public;
grant execute on function public.client_config() to anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
