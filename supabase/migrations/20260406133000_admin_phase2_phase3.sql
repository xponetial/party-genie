create table if not exists public.feature_flags (
  key text primary key,
  label text not null,
  description text not null,
  enabled boolean not null default false,
  rollout_percentage integer not null default 100 check (rollout_percentage >= 0 and rollout_percentage <= 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null check (scope_type in ('user', 'event')),
  scope_id uuid not null,
  note text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_notes_scope_idx
  on public.admin_notes(scope_type, scope_id, created_at desc);

drop trigger if exists set_feature_flags_updated_at on public.feature_flags;
create trigger set_feature_flags_updated_at
before update on public.feature_flags
for each row
execute function public.set_updated_at();

alter table public.feature_flags enable row level security;
alter table public.admin_notes enable row level security;

drop policy if exists "feature_flags_no_client_access" on public.feature_flags;
create policy "feature_flags_no_client_access"
on public.feature_flags
for all
to authenticated
using (false)
with check (false);

drop policy if exists "admin_notes_no_client_access" on public.admin_notes;
create policy "admin_notes_no_client_access"
on public.admin_notes
for all
to authenticated
using (false)
with check (false);

insert into public.feature_flags (key, label, description, enabled, rollout_percentage)
values
  ('shopping_recommendations', 'Shopping recommendations', 'Controls the AI-powered shopping hub and recommendation cards.', true, 100),
  ('replace_pick', 'Replace this pick', 'Allows hosts to swap one shopping recommendation for another.', true, 100),
  ('admin_workspace', 'Admin workspace', 'Controls access to internal admin routes and tooling.', true, 100),
  ('email_experiments', 'Email experiments', 'Enables invite email experiments and template testing paths.', false, 0),
  ('guided_onboarding', 'Guided onboarding', 'Enables first-run host onboarding guidance and progress messaging.', false, 0)
on conflict (key) do nothing;
