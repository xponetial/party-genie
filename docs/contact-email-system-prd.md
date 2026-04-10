# Party Swami PRD: Contact Email Integration System

## Overview

This PRD defines a shared contact email system across the Party Swami marketing site and authenticated application.

The goal is to make it obvious how a user can:

- ask a question
- request help
- report a bug
- request a new feature
- reach sales or partnerships
- route internal admin or operations traffic correctly

## Approved Email Addresses

These are the only approved Party Swami contact addresses for product and marketing use:

- `hello@partyswami.com` for general inquiries
- `support@partyswami.com` for product support, bugs, and account help
- `admin@partyswami.com` for internal admin and operations traffic
- `info@partyswami.com` as a public alias for general informational inquiries
- `sales@partyswami.com` as a public alias for pricing, partnerships, and business conversations

Operational rule:

- `info@partyswami.com` and `sales@partyswami.com` may appear in public UI where they improve clarity.
- `admin@partyswami.com` should be limited to admin or internal workflows, not broad public marketing copy.

## Goals

- Increase user trust with visible, contextual contact options
- Improve support routing across marketing and product surfaces
- Create a reusable contact system instead of hardcoded email strings
- Prepare the app for a future in-product feedback workflow
- Ensure bug reports and feature requests can be submitted from any page

## Product Scope

### Marketing Site

Current public pages in scope:

- Home
- Pricing
- Privacy
- Terms
- Contact page

Future public pages:

- About

Requirement:

- Every marketing page must expose at least one visible path for bug reports, feature requests, or general contact.

### Authenticated App

Current authenticated surfaces in scope:

- Dashboard
- Event creation and event workspaces
- Invite flows
- AI-related planning flows
- Admin surfaces

Requirement:

- Every authenticated app page must provide one-click access to `support@partyswami.com` so users can report bugs, request features, or ask for help without leaving the page.

## Routing Model

### Marketing Context

- Footer defaults to `hello@partyswami.com`
- General contact page highlights `hello@partyswami.com`, `support@partyswami.com`, `info@partyswami.com`, and `sales@partyswami.com`
- Pricing and business-interest contexts highlight `sales@partyswami.com`
- Privacy and legal-style support copy may reference `support@partyswami.com` for help requests and `hello@partyswami.com` for general contact

### Product Context

- Authenticated host-facing pages default to `support@partyswami.com`
- Admin-facing workflows may expose `admin@partyswami.com`
- Invite, AI, guest, and dashboard contexts should point to `support@partyswami.com`
- Bug reports and feature requests from any page should route to `support@partyswami.com`

## Functional Requirements

- Use a centralized contact configuration file
- Do not hardcode email addresses directly in page components
- Use reusable UI components for contact links and contextual contact cards
- Support `mailto:` links with contextual prefilled subject lines
- For authenticated app contexts, include useful context in the body when possible
- Keep all links mobile-friendly and one tap away
- Make bug reporting and feature-request submission possible from any page through a visible support or contact entry point

## UX Requirements

- Contact entry points must be easy to discover
- Contact patterns must be visually consistent across marketing and product shells
- Mobile users must be able to activate contact links without extra friction
- Marketing contact UI should feel welcoming
- Product support UI should feel action-oriented and operational
- Users should never have to hunt for a place to report a bug or suggest a feature

## Implementation Plan

### Phase 1

- Add centralized contact email config
- Add shared footer contact treatment
- Add contact page on the marketing site
- Add contextual support links in authenticated shells

### Phase 2

- Add page-level contextual subjects and body templates
- Add sales-specific calls to action on pricing and relevant marketing surfaces
- Add admin-only contact affordances where appropriate

### Phase 3

- Build a structured in-app feedback form
- Add spam controls with Cloudflare Turnstile (invisible CAPTCHA)
- Add request tagging
- Store or route support submissions through a managed workflow

Phase 3 implementation notes:

- The `/contact` page should include a structured form for general questions, support requests, bug reports, feature requests, info inquiries, and sales conversations
- Bug-report and feature-request entry points from any page should land on the structured form with context prefilled
- Cloudflare Turnstile must run with low-friction invisible or interaction-only behavior and must always be verified server-side
- Form submissions should route through Resend using the approved Party Swami sender domain, with reply-to set to the submitter's email
- Submission metadata should include category, context, and page details for faster triage

## Success Metrics

- Increase in inbound product feedback volume
- Faster bug triage and routing
- Lower ambiguity around who to contact
- Better conversion from pricing and partnership interest

## Risks

- Too many generic inbox entry points can confuse users
- Public exposure of admin inboxes can create noise
- `mailto:` flows may be underused by users without configured mail clients
- Structured feedback forms will require spam protection before production rollout

## CAPTCHA Requirement

- Use Cloudflare Turnstile as the standard CAPTCHA solution for future structured feedback and support forms
- Prefer invisible Turnstile to reduce friction for legitimate users
- Apply Turnstile to non-authenticated or abuse-prone submission paths first
- Verify Turnstile tokens server-side before accepting form submissions

## Developer Notes

- Use config and helpers, not scattered strings
- Prefer composable UI components
- Keep aliases supported but intentional
- Preserve responsiveness and accessibility
