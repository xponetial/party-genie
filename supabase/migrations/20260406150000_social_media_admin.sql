create table if not exists public.social_media_brand_profiles (
  id uuid primary key default gen_random_uuid(),
  scope text not null unique default 'default' check (scope = 'default'),
  tone text not null default '',
  audience text not null default '',
  signature_phrases text not null default '',
  cta_style text not null default '',
  posting_goal_per_week integer not null default 12 check (posting_goal_per_week >= 0 and posting_goal_per_week <= 100),
  focus_metrics text not null default 'engagement rate, ctr, conversions',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.social_media_campaigns (
  id uuid primary key default gen_random_uuid(),
  theme text not null,
  audience text not null default '',
  objective text not null default '',
  status text not null default 'draft' check (status in ('draft', 'in_review', 'approved', 'scheduled', 'published')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  source_event_type text,
  scheduled_week_of date,
  notes text not null default '',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.social_media_content_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.social_media_campaigns(id) on delete cascade,
  channel text not null check (channel in ('tiktok', 'pinterest', 'instagram', 'email', 'landing_page')),
  title text not null,
  format_detail text not null default '',
  status text not null default 'draft' check (status in ('draft', 'in_review', 'approved', 'scheduled', 'published')),
  publish_on date,
  copy text not null default '',
  call_to_action text not null default '',
  hashtags text not null default '',
  visual_direction text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists social_media_campaigns_status_idx
  on public.social_media_campaigns(status, scheduled_week_of nulls last, created_at desc);

create index if not exists social_media_content_items_campaign_idx
  on public.social_media_content_items(campaign_id, status, publish_on nulls last, created_at desc);

drop trigger if exists set_social_media_brand_profiles_updated_at on public.social_media_brand_profiles;
create trigger set_social_media_brand_profiles_updated_at
before update on public.social_media_brand_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_social_media_campaigns_updated_at on public.social_media_campaigns;
create trigger set_social_media_campaigns_updated_at
before update on public.social_media_campaigns
for each row
execute function public.set_updated_at();

drop trigger if exists set_social_media_content_items_updated_at on public.social_media_content_items;
create trigger set_social_media_content_items_updated_at
before update on public.social_media_content_items
for each row
execute function public.set_updated_at();

alter table public.social_media_brand_profiles enable row level security;
alter table public.social_media_campaigns enable row level security;
alter table public.social_media_content_items enable row level security;

drop policy if exists "social_media_brand_profiles_no_client_access" on public.social_media_brand_profiles;
create policy "social_media_brand_profiles_no_client_access"
on public.social_media_brand_profiles
for all
to authenticated
using (false)
with check (false);

drop policy if exists "social_media_campaigns_no_client_access" on public.social_media_campaigns;
create policy "social_media_campaigns_no_client_access"
on public.social_media_campaigns
for all
to authenticated
using (false)
with check (false);

drop policy if exists "social_media_content_items_no_client_access" on public.social_media_content_items;
create policy "social_media_content_items_no_client_access"
on public.social_media_content_items
for all
to authenticated
using (false)
with check (false);

insert into public.social_media_brand_profiles (
  scope,
  tone,
  audience,
  signature_phrases,
  cta_style,
  posting_goal_per_week,
  focus_metrics
)
values (
  'default',
  'Celebratory, practical, confidence-building, and host-friendly.',
  'Hosts planning birthdays, seasonal parties, showers, and family gatherings.',
  'easy-to-host, guest-ready, party-worthy',
  'save this, shop the look, plan your version, send invites faster',
  12,
  'engagement rate, ctr, conversions, posts per week'
)
on conflict (scope) do nothing;
