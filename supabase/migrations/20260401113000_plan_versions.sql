create table if not exists public.plan_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.party_plans(id) on delete cascade,
  version_num integer not null,
  change_reason text,
  plan_json jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (plan_id, version_num)
);

create index if not exists plan_versions_plan_id_idx on public.plan_versions(plan_id);

alter table public.plan_versions enable row level security;

drop policy if exists "plan_versions_owner_all" on public.plan_versions;
create policy "plan_versions_owner_all"
on public.plan_versions
for all
to authenticated
using (
  exists (
    select 1
    from public.party_plans pp
    join public.events e on e.id = pp.event_id
    where pp.id = plan_versions.plan_id
      and e.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.party_plans pp
    join public.events e on e.id = pp.event_id
    where pp.id = plan_versions.plan_id
      and e.owner_id = auth.uid()
  )
);
