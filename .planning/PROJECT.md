# Animation Labs

## What This Is

A SaaS platform that generates professional logo animations using AI (Veo 3 API). Users upload their logo, select style preferences, and receive high-quality animated videos in minutes. The platform handles everything from user registration through video delivery automatically, with an n8n workflow orchestrating the AI video generation.

## Core Value

Users get professional logo animations at $3-5 per video (vs $100-500 from freelancers) with 10-15 minute turnaround time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can sign up, verify email, and log in
- [ ] User can subscribe to a plan via Stripe
- [ ] User can upload logo and create video through multi-step form
- [ ] System auto-extracts colors from uploaded logo
- [ ] Video creation triggers n8n workflow with all parameters
- [ ] User receives email and can download video when ready
- [ ] User can view their video library and download past videos
- [ ] Credit system tracks and deducts credits correctly
- [ ] Landing page converts visitors with examples and pricing

### Out of Scope

- OAuth login (Google, GitHub) — email/password sufficient for v1
- Mobile app — web-first
- Real-time chat support — email support sufficient
- Video editing features — out of scope for v1
- Team accounts — single user accounts only
- API access for developers — not needed for launch
- White-label portal — future consideration

## Context

**Existing Infrastructure:**
- n8n workflow exists and works with manual/hardcoded inputs
- Workflow has an AI agent that analyzes logos and generates creative Veo prompts
- Veo 3 API access is set up and tested
- Example videos ready for landing page
- Domain name secured

**What Needs Building:**
- Supabase project (database, auth, storage)
- Next.js application (full stack)
- Stripe integration (products, checkout, webhooks, customer portal)
- n8n webhook integration (make workflow dynamic, connect to Supabase)
- Email service setup (Resend)

**n8n Workflow Adaptation:**
- Currently uses Google Sheets — needs Supabase integration
- Hardcoded inputs — needs dynamic webhook payload
- Needs to call back to app API when video is complete

## Constraints

- **Tech Stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase, Stripe, Resend, n8n — all decided, no substitutions
- **No UI Designs**: Using shadcn/ui components, keeping design clean and functional
- **Speed**: Ship fast — core loop working is priority over feature completeness
- **n8n Dependency**: Video generation depends on existing n8n instance being adapted

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase for everything (DB, Auth, Storage) | Integrated solution, fast to set up, good DX | — Pending |
| Credit-based billing (not per-video checkout) | Smoother UX, encourages repeat use, proven SaaS model | — Pending |
| Email/password auth only for v1 | Faster to ship, OAuth adds complexity | — Pending |
| shadcn/ui for components | Production-ready, accessible, customizable, no design needed | — Pending |

---
*Last updated: 2026-01-26 after initialization*
