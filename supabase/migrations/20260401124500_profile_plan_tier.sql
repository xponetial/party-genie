alter table public.profiles
add column if not exists plan_tier text not null default 'free';

alter table public.profiles
drop constraint if exists profiles_plan_tier_check;

alter table public.profiles
add constraint profiles_plan_tier_check
check (plan_tier in ('free', 'pro', 'admin'));
