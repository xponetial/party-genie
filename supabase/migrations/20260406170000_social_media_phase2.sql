alter table public.social_media_campaigns
  add column if not exists archived_at timestamptz,
  add column if not exists generation_summary text not null default '';

alter table public.social_media_content_items
  add column if not exists image_prompt text not null default '',
  add column if not exists asset_notes text not null default '',
  add column if not exists reference_links text not null default '';

alter table public.social_media_campaigns
  drop constraint if exists social_media_campaigns_status_check;

alter table public.social_media_campaigns
  add constraint social_media_campaigns_status_check
  check (status in ('draft', 'in_review', 'approved', 'scheduled', 'published', 'archived'));

alter table public.social_media_content_items
  drop constraint if exists social_media_content_items_status_check;

alter table public.social_media_content_items
  add constraint social_media_content_items_status_check
  check (status in ('draft', 'in_review', 'approved', 'scheduled', 'published', 'archived'));
