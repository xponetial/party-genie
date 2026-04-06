insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'social-media-assets',
  'social-media-assets',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.social_media_content_items
  add column if not exists asset_file_name text not null default '',
  add column if not exists asset_file_path text not null default '',
  add column if not exists asset_public_url text not null default '',
  add column if not exists published_url text not null default '',
  add column if not exists manual_impressions integer not null default 0,
  add column if not exists manual_clicks integer not null default 0,
  add column if not exists manual_conversions integer not null default 0,
  add column if not exists manual_revenue_usd numeric(12,2) not null default 0,
  add column if not exists performance_notes text not null default '';

create index if not exists social_media_content_items_publish_status_idx
  on public.social_media_content_items(status, publish_on nulls last, updated_at desc);
