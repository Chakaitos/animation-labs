# Roadmap: Animation Labs

## Overview

AnimateLabs delivers professional logo animations in 10-15 minutes at $3-5 per video. This roadmap takes the project from empty repository to live SaaS platform in 7 phases, starting with foundation work and building toward the core loop: sign up → subscribe → create video → download. The focus is shipping fast with the essential features that make the product work, deferring enhancements to v2.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & Setup** - Project scaffolding and infrastructure
- [x] **Phase 2: Authentication & Account** - User registration and login
- [x] **Phase 3: Subscription & Credits** - Payment and credit system
- [x] **Phase 4: Core Video Creation** - Upload logo and generate videos
- [x] **Phase 5: Video Library & Dashboard** - View and manage videos
- [ ] **Phase 6: Email Notifications** - User communication system
- [ ] **Phase 7: Public Pages & Marketing** - Landing page and pricing

## Phase Details

### Phase 1: Foundation & Setup
**Goal**: Project infrastructure is ready for feature development
**Depends on**: Nothing (first phase)
**Requirements**: No explicit requirements (foundational work)
**Success Criteria** (what must be TRUE):
  1. Next.js 16 project with TypeScript, Tailwind CSS 4, and shadcn/ui is initialized
  2. Supabase project exists with database schema deployed
  3. Database tables for profiles, subscriptions, credits, videos are created
  4. Environment variables and configuration files are set up
  5. Development server runs without errors
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Initialize Next.js 16, Tailwind 4, shadcn/ui, environment setup
- [x] 01-02-PLAN.md — Create Supabase client utilities and auth middleware
- [x] 01-03-PLAN.md — Database schema migration and CLAUDE.md documentation

### Phase 2: Authentication & Account
**Goal**: Users can securely create accounts and manage authentication
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, ACCT-01
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password
  2. User receives verification email and can verify their account
  3. User can log in and stay logged in across browser sessions
  4. User can log out from any page
  5. User can reset forgotten password via email link
  6. User can change their password from account settings
**Plans**: 6 plans

Plans:
- [x] 02-01-PLAN.md — Install deps, add shadcn components, validation schemas, Toaster
- [x] 02-02-PLAN.md — Server Actions for auth operations and email verification callback
- [x] 02-03-PLAN.md — Sign-up, login, and verify-email pages with forms
- [x] 02-04-PLAN.md — Password reset request and update pages
- [x] 02-05-PLAN.md — Account settings, change password, user menu, dashboard placeholder
- [x] 02-06-PLAN.md — Human verification of complete auth flow

### Phase 3: Subscription & Credits
**Goal**: Users can subscribe to plans and credit system tracks usage
**Depends on**: Phase 2
**Requirements**: SUBS-01, SUBS-02, SUBS-03, SUBS-04, SUBS-05, SUBS-06, SUBS-07, SUBS-08, CRED-01, CRED-02, CRED-03, CRED-04, CRED-05, CRED-06, INTG-03
**Success Criteria** (what must be TRUE):
  1. User can select subscription plan (Starter/Professional) and complete payment via Stripe
  2. Credits are granted automatically when subscription starts
  3. User can view current credit balance (subscription + overage) in dashboard
  4. User can purchase additional credit packs
  5. User can upgrade, downgrade, or cancel subscription
  6. Stripe webhooks correctly handle subscription lifecycle events
  7. User can view credit transaction history
**Plans**: 6 plans

Plans:
- [x] 03-01-PLAN.md — Install Stripe SDK and create plan configuration
- [x] 03-02-PLAN.md — Webhook handler with signature verification and idempotency
- [x] 03-03-PLAN.md — Checkout and billing Server Actions
- [x] 03-04-PLAN.md — Subscribe page and dashboard credit display
- [x] 03-05-PLAN.md — Billing page with credit packs and transaction history
- [x] 03-06-PLAN.md — Human verification of complete subscription flow

### Phase 4: Core Video Creation
**Goal**: Users can create logo animation videos through the platform
**Depends on**: Phase 3
**Requirements**: VIDC-01, VIDC-02, VIDC-03, VIDC-04, VIDC-05, VIDC-06, VIDC-07, VIDC-08, VIDC-09, VIDC-10, INTG-01, INTG-02
**Success Criteria** (what must be TRUE):
  1. User can upload logo via drag and drop
  2. System automatically extracts primary and secondary colors from uploaded logo
  3. User can complete multi-step form (brand name, duration, quality, style, creative direction)
  4. User can review and submit order
  5. System triggers n8n webhook with all parameters when order is submitted
  6. Credits are deducted correctly when video is created
  7. Video creation is blocked if user has insufficient credits
  8. n8n workflow calls back to update video status when complete
  9. User receives confirmation that video is being created
**Plans**: 5 plans

Plans:
- [x] 04-01-PLAN.md — Install deps, configure bodySizeLimit, create validation schemas and utilities
- [x] 04-02-PLAN.md — Server Actions for video creation and n8n callback webhook
- [x] 04-03-PLAN.md — Storage migration with RLS policies, env vars documentation
- [x] 04-04-PLAN.md — Multi-step form UI (upload, details, style, review)
- [x] 04-05-PLAN.md — Human verification of complete video creation flow

### Phase 5: Video Library & Dashboard
**Goal**: Users can view, manage, and download their videos
**Depends on**: Phase 4
**Requirements**: VIDL-01, VIDL-02, VIDL-03, VIDL-04, VIDL-05, VIDL-06, VIDL-07, DASH-01, DASH-02, DASH-03
**Success Criteria** (what must be TRUE):
  1. Dashboard displays credit balance and recent videos list
  2. Dashboard has prominent "Create Video" button
  3. User can view list of all their videos with status (processing/completed/failed)
  4. User can preview and download completed videos
  5. User can delete videos
  6. User can filter videos by status and search by brand name
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md — Video components, delete action, and AlertDialog
- [x] 05-02-PLAN.md — Videos library page with filters and grid
- [x] 05-03-PLAN.md — Dashboard enhancement with real video data
- [x] 05-04-PLAN.md — Human verification of video library flow

### Phase 6: Email Notifications
**Goal**: Users receive timely email notifications for key events
**Depends on**: Phase 2, Phase 4
**Requirements**: EMAL-01, EMAL-02, EMAL-03, EMAL-04
**Success Criteria** (what must be TRUE):
  1. Resend email service is configured and working
  2. User receives verification email immediately after signup
  3. User receives password reset email with secure link when requested
  4. User receives notification email when video is completed
  5. User receives alert email when payment fails
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

### Phase 7: Public Pages & Marketing
**Goal**: Visitors can discover the product and convert to users
**Depends on**: Phase 2, Phase 3
**Requirements**: PUBL-01, PUBL-02
**Success Criteria** (what must be TRUE):
  1. Homepage displays hero section, example videos, and pricing overview
  2. Pricing page shows detailed tier comparison
  3. Call-to-action buttons lead to sign up flow
  4. Pages are responsive and work on mobile devices
**Plans**: TBD

Plans:
- [ ] 07-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Setup | 3/3 | Complete | 2026-01-26 |
| 2. Authentication & Account | 6/6 | Complete | 2026-01-27 |
| 3. Subscription & Credits | 6/6 | Complete | 2026-01-29 |
| 4. Core Video Creation | 5/5 | Complete | 2026-01-29 |
| 5. Video Library & Dashboard | 4/4 | Complete | 2026-02-01 |
| 6. Email Notifications | 0/TBD | Not started | - |
| 7. Public Pages & Marketing | 0/TBD | Not started | - |
