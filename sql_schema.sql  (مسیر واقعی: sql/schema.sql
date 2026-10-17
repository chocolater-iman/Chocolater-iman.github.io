-- =====================================================================
-- Activity Tracker - Supabase schema (RLS everywhere, no anon access)
-- Run once in: Supabase Dashboard > SQL Editor
-- Also: Authentication > Providers > DISABLE "Allow anonymous sign-ins"
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles ----------
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  display_name        text check (char_length(display_name) <= 60),
  birth_date          date check (birth_date between date '1900-01-01' and current_date),
  sex                 text check (sex in ('male','female')),
  height_cm           numeric(5,1) check (height_cm between 80 and 250),
  daily_calorie_goal  integer check (daily_calorie_goal between 500 and 10000),
  daily_steps_goal    integer check (daily_steps_goal between 0 and 100000),
  sleep_goal_hours    numeric(3,1) check (sleep_goal_hours between 1 and 16),
  weight_goal_kg      numeric(5,1) check (weight_goal_kg between 20 and 400),
  settings            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------- custom foods (private per user) ----------
create table public.custom_foods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name_fa     text not null check (char_length(name_fa) between 1 and 120),
  calories    numeric(8,2) not null check (calories between 0 and 2000),
  fat         numeric(8,2) check (fat >= 0 and fat <= 1000),
  protein     numeric(8,2) check (protein >= 0 and protein <= 1000),
  carbs       numeric(8,2) check (carbs >= 0 and carbs <= 1000),
  fiber       numeric(8,2) check (fiber >= 0 and fiber <= 1000),
  sugar       numeric(8,2) check (sugar >= 0 and sugar <= 1000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- food log (nutrient snapshot per entry) ----------
create table public.food_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date    date not null,
  meal        text not null check (meal in
              ('breakfast','morning_snack','lunch','afternoon_snack','dinner','night_snack')),
  food_name   text not null check (char_length(food_name) between 1 and 120),
  grams       numeric(8,2) not null check (grams > 0 and grams <= 20000),
  calories    numeric(9,2) not null check (calories between 0 and 100000),
  fat         numeric(9,2) check (fat >= 0),
  protein     numeric(9,2) check (protein >= 0),
  carbs       numeric(9,2) check (carbs >= 0),
  fiber       numeric(9,2) check (fiber >= 0),
  sugar       numeric(9,2) check (sugar >= 0),
  note        text check (char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- glucose ----------
create table public.glucose_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date    date not null,
  log_time    time not null,                       -- 24h
  context     text not null check (context in
              ('fasting','after_breakfast','after_lunch','after_dinner','custom')),
  value_mgdl  numeric(5,1) not null check (value_mgdl between 20 and 800),
  note        text check (char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- insulin ----------
create table public.insulin_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date      date not null,
  log_time      time not null,
  insulin_type  text not null default 'other' check (insulin_type in
                ('rapid','short','intermediate','long','mixed','other')),
  units         numeric(5,1) not null check (units > 0 and units <= 300),
  note          text check (char_length(note) <= 300),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- blood pressure ----------
create table public.bp_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date    date not null,
  log_time    time not null,
  systolic    smallint not null check (systolic between 50 and 300),
  diastolic   smallint not null check (diastolic between 30 and 200),
  pulse       smallint check (pulse between 20 and 250),
  note        text check (char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (systolic > diastolic)
);

-- ---------- weight ----------
create table public.weight_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date    date not null,
  weight_kg   numeric(5,1) not null check (weight_kg between 20 and 400),
  note        text check (char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- sleep ----------
create table public.sleep_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  sleep_date  date not null,                       -- the date you woke up
  bed_time    timestamptz not null,
  wake_time   timestamptz not null,
  quality     smallint check (quality between 1 and 5),
  note        text check (char_length(note) <= 300),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (wake_time > bed_time and wake_time - bed_time <= interval '24 hours')
);

-- ---------- activity ----------
create table public.activity_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users(id) on delete cascade,
  log_date        date not null,
  activity_type   text not null default 'walking' check (activity_type in
                  ('walking','running','cycling','swimming','gym','yoga','other')),
  steps           integer check (steps between 0 and 200000),
  distance_km     numeric(6,2) check (distance_km between 0 and 500),
  duration_min    numeric(6,1) not null check (duration_min > 0 and duration_min <= 1440),
  calories_burned numeric(7,1) check (calories_burned between 0 and 20000),
  weight_kg_used  numeric(5,1) check (weight_kg_used between 20 and 400),
  note            text check (char_length(note) <= 300),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- indexes ----------
create index on public.custom_foods  (user_id);
create index on public.food_logs     (user_id, log_date);
create index on public.glucose_logs  (user_id, log_date, log_time);
create index on public.insulin_logs  (user_id, log_date, log_time);
create index on public.bp_logs       (user_id, log_date, log_time);
create index on public.weight_logs   (user_id, log_date);
create index on public.sleep_logs    (user_id, sleep_date);
create index on public.activity_logs (user_id, log_date);

-- ---------- auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ---------- RLS + grants + updated_at triggers ----------
revoke all on all tables in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;

do $$
declare
  t   text;
  col text;
  c   text;
begin
  foreach t in array array[
    'profiles','custom_foods','food_logs','glucose_logs','insulin_logs',
    'bp_logs','weight_logs','sleep_logs','activity_logs'
  ] loop
    col := case when t = 'profiles' then 'id' else 'user_id' end;
    -- owner-only AND never an anonymous-auth session
    c := format($c$ (select auth.uid()) = %I
         and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false $c$, col);

    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    execute format('create policy "%s_select_own" on public.%I for select to authenticated using (%s)', t, t, c);
    execute format('create policy "%s_insert_own" on public.%I for insert to authenticated with check (%s)', t, t, c);
    execute format('create policy "%s_update_own" on public.%I for update to authenticated using (%s) with check (%s)', t, t, c, c);
    execute format('create policy "%s_delete_own" on public.%I for delete to authenticated using (%s)', t, t, c);

    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
                   t || '_set_updated_at', t);
  end loop;
end $$;
