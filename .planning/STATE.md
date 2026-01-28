# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Professional logo animations at $3-5 per video with 10-15 minute turnaround
**Current focus:** Subscription & Credits

## Current Position

Phase: 3 of 7 (Subscription & Credits) — IN PROGRESS
Plan: 4 of 6 complete
Status: Billing dashboard UI complete, webhook handlers next
Last activity: 2026-01-28 — Completed 03-05-PLAN.md

Progress: [████░░░░░░] 40%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 3.2 minutes
- Total execution time: 0.68 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-setup | 3 | 8m | 2.7m |
| 02-authentication-account | 6 | 27m | 4.5m |
| 03-subscription-and-credits | 3 | 6m | 2.0m |

**Recent Trend:**
- Last 5 plans: 02-05 (3m), 02-06 (manual), 03-01 (2m), 03-03 (1m), 03-05 (3m)
- Trend: Excellent (fast execution for UI components with clear specifications)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Supabase for everything (DB, Auth, Storage) — Integrated solution, fast setup
- Credit-based billing (not per-video) — Smoother UX, encourages repeat use
- Email/password auth only for v1 — Faster to ship, OAuth adds complexity
- shadcn/ui for components — Production-ready, accessible, no design needed

**From 01-01:**
- Next.js 16 with App Router (D-01-01-001) — Latest stable with Turbopack
- Tailwind CSS 4 (D-01-01-002) — CSS-based config for better performance
- shadcn/ui new-york style (D-01-01-003) — Professional appearance
- .env.example committed (D-01-01-004) — Template serves as documentation

**From 01-03:**
- SECURITY DEFINER functions for credits (D-01-03-001) — Prevents user manipulation
- Separate credit_transactions table (D-01-03-002) — Immutable audit trail
- JSONB for video metadata (D-01-03-003) — Flexible schema for n8n outputs

**From 02-01:**
- Zod for validation (D-02-01-001) — Type-safe schemas with TypeScript inference
- Sonner for toasts (D-02-01-002) — shadcn/ui recommended, lightweight, accessible
- Strong password requirements (D-02-01-003) — 8+ chars, uppercase, lowercase, number

**From 02-02:**
- Dynamic site URL from headers (D-02-02-001) — Works in dev and prod without config
- Generic login errors (D-02-02-002) — Prevents user enumeration
- Reset always returns success (D-02-02-003) — Prevents email enumeration
- Verify current password on change (D-02-02-004) — Security requirement
- Global signout after password change (D-02-02-005) — Forces re-auth everywhere
- Open redirect prevention (D-02-02-006) — Only allow internal paths

**From 02-03:**
- React Hook Form pattern (D-02-03-001) — useForm + zodResolver + FormData for server actions
- Toast notifications for errors (D-02-03-002) — Sonner toast.error() for server action failures
- Auth page branding (D-02-03-003) — AnimateLabs logo on all auth pages
- Loading states (D-02-03-004) — Disable inputs + button text change during submission

**From 02-05:**
- Email read-only in settings (D-02-05-001) — Contact support to change email
- Avatar initials from email (D-02-05-002) — First 2 chars uppercase
- Consistent protected page header (D-02-05-003) — Logo + UserMenu pattern

**From 03-01:**
- Stripe API version 2025-12-15.clover (D-03-01-001) — TypeScript SDK requirement
- Two-tier subscription model (D-03-01-002) — Starter (10 credits) and Professional (30 credits)
- Credit packs for overage (D-03-01-003) — Small (5), Medium (10), Large (25) bundles
- Price IDs as environment variables (D-03-01-004) — Test/live mode separation
- Configuration pattern with 'as const' (D-03-01-005) — Type-safe plan selection

**From 03-02:**
- Lazy-load service clients via Proxy (D-03-02-001) — Avoids Next.js build errors from missing env vars
- RPC-only credit modifications (D-03-02-002) — Atomic operations via add_overage_credits function
- Overage credits deducted first (D-03-02-003) — Better UX for purchased credit packs

**From 03-03:**
- User ID metadata attachment (D-03-03-001) — Checkout sessions include user_id for webhook processing
- Credit pack requires subscription (D-03-03-002) — Only active subscribers can purchase overage credits
- Customer Portal return URL (D-03-03-003) — Always return to /billing page
- Credit balance breakdown (D-03-03-004) — Separate subscription vs overage credits in responses

**From 03-04:**
- Compact stats card format (D-03-04-001) — Flex-row CardHeader with icon and title for dashboard metrics
- Plan pricing display constants (D-03-04-002) — Display prices as hardcoded Record, actual prices from Stripe
- Subscribe CTA vs stats (D-03-04-003) — Free users see CTA, subscribers see stats grid

**From 03-05:**
- date-fns for date formatting (D-03-05-001) — Lightweight, tree-shakeable, better than moment.js
- Client wrapper for portal button (D-03-05-002) — Server Actions with conditional redirects need client-side error handling
- Badge variant mapping (D-03-05-003) — default for positive, destructive for negative, secondary for neutral

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-01-28
Stopped at: Completed 03-05-PLAN.md (Billing dashboard UI)
Resume file: None
Next: Continue Phase 3 - subscription page UI (03-04) or webhook handlers (03-06)
