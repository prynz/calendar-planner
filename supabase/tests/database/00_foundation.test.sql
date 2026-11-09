-- pgTAP: security foundation (CLAUDE.md rule 2). Runs in a transaction and rolls back.
begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(14);

-- Structure
select has_table('public', 'system_settings', 'system_settings exists');
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'every table in public has row level security enabled'
);
select is(
  (select count(*)::int
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
      and not coalesce(p.proconfig @> array['search_path=""'], false)),
  0,
  'every security definer function in public pins search_path to empty'
);

-- Defaults: risky features are off
select is((select value from system_settings where key = 'house_ads_enabled'), 'false'::jsonb, 'house ads are off by default');
select is((select value from system_settings where key = 'ai_assistant_enabled'), 'false'::jsonb, 'AI assistant is off by default');
select throws_ok(
  $$insert into public.system_settings (key, value, description) values ('Bad Key!', 'true', 'x')$$,
  '23514',
  null,
  'setting keys must be snake_case'
);

-- Default privileges: a new public function is not executable by client roles
create function public.tmp_probe() returns int language sql as 'select 1';
select ok(not has_function_privilege('anon', 'public.tmp_probe()', 'execute'), 'anon cannot execute new functions by default');
select ok(not has_function_privilege('authenticated', 'public.tmp_probe()', 'execute'), 'authenticated cannot execute new functions by default');

-- anon: no direct table access, only client_config()
set local role anon;
select throws_ok('select * from public.system_settings', '42501', null, 'anon cannot read system_settings');
select ok(public.client_config() ? 'house_ads_enabled', 'anon sees client-visible keys via client_config()');
select ok(not (public.client_config() ? 'ai_assistant_enabled'), 'client_config() hides non-visible keys');
reset role;

-- authenticated: same rules, and no writes
set local role authenticated;
select throws_ok('select * from public.system_settings', '42501', null, 'authenticated cannot read system_settings');
select throws_ok(
  $$update public.system_settings set value = 'true' where key = 'house_ads_enabled'$$,
  '42501',
  null,
  'authenticated cannot change settings'
);
select is(public.client_config() -> 'demo_mode', 'true'::jsonb, 'authenticated reads demo_mode via client_config()');
reset role;

select * from finish();
rollback;
