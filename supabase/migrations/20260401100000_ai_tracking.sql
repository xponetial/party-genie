create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  generation_type text not null,
  model text not null,
  request_fingerprint text not null,
  prompt_version text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cached_input_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  latency_ms integer,
  status text not null default 'success',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_usage_monthly (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month date not null,
  requests_count integer not null default 0,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cached_input_tokens integer not null default 0,
  estimated_cost_usd numeric(12, 6) not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, usage_month)
);

alter table public.party_plans
  add column if not exists request_fingerprint text,
  add column if not exists prompt_version text,
  add column if not exists model text,
  add column if not exists status text not null default 'ready',
  add column if not exists summary text;

create index if not exists ai_generations_user_id_idx on public.ai_generations(user_id);
create index if not exists ai_generations_event_id_idx on public.ai_generations(event_id);
create index if not exists ai_generations_fingerprint_idx on public.ai_generations(request_fingerprint);
create index if not exists party_plans_request_fingerprint_idx on public.party_plans(request_fingerprint);
create index if not exists user_usage_monthly_user_id_idx on public.user_usage_monthly(user_id);

drop trigger if exists set_user_usage_monthly_updated_at on public.user_usage_monthly;
create trigger set_user_usage_monthly_updated_at
before update on public.user_usage_monthly
for each row
execute function public.set_updated_at();

alter table public.ai_generations enable row level security;
alter table public.user_usage_monthly enable row level security;

drop policy if exists "ai_generations_owner_all" on public.ai_generations;
create policy "ai_generations_owner_all"
on public.ai_generations
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_usage_monthly_owner_all" on public.user_usage_monthly;
create policy "user_usage_monthly_owner_all"
on public.user_usage_monthly
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
