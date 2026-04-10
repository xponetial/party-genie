# Party Swami Production Setup

This repo is already wired for Supabase and Vercel. Production setup is mostly a matter of pointing the Vercel production environment at the production Supabase project and applying the checked-in migrations.

## Current targets

- Vercel team: `xponetials-projects`
- Vercel project: `party-swami`
- Supabase staging/dev project ref: `ltwdwwuzjpvrdtvbdiek`
- Supabase production project ref: `digmitoueoqdxddnwtvq`

## Required production environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Recommended production environment variables

- `OPENAI_API_KEY`
- `OPENAI_MODEL_PLAN`
- `OPENAI_MODEL_LIGHTWEIGHT`
- `OPENAI_MODEL_PREMIUM`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
  - Example: `Party Swami <noreply@email.partyswami.com>`

## Vercel link

If the repo is not linked locally yet:

```powershell
npm exec vercel -- link --yes --scope xponetials-projects --project party-swami
```

## Point Vercel production at the production Supabase project

1. Fetch the production Supabase keys for project ref `digmitoueoqdxddnwtvq`.
2. Set these in the `production` Vercel environment only:

```powershell
npm exec vercel -- env add NEXT_PUBLIC_SUPABASE_URL production --force
npm exec vercel -- env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force
npm exec vercel -- env add SUPABASE_SERVICE_ROLE_KEY production --force
npm exec vercel -- env add NEXT_PUBLIC_SITE_URL production --force
```

Recommended site URL:

```text
https://aipartygenie.com
```

## Apply schema to the production database

You need the production Postgres password from Supabase for this step.

```powershell
npm exec supabase -- link --project-ref digmitoueoqdxddnwtvq --password "<production-db-password>"
npm exec supabase -- db push --linked --password "<production-db-password>"
```

This repo's production schema lives in [`supabase/migrations`](/c:/Users/xpone/apps/party-swami/supabase/migrations).

## Supabase dashboard follow-up

Update Supabase Auth settings for the production project:

- Site URL: `https://aipartygenie.com`
- Redirect URL: `https://aipartygenie.com/auth/callback`

If you want preview auth flows, also add the Vercel preview domain patterns you plan to use.

## Verify

Run these after env setup and migration push:

```powershell
npm run lint
npm run typecheck
npm run build
npm exec vercel -- deploy --prod
```
