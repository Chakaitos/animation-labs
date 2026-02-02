# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-26)

**Core value:** Professional logo animations at $3-5 per video with 10-15 minute turnaround
**Current focus:** Video Library & Dashboard

## Current Position

Phase: 5 of 7 (Video Library & Dashboard) — IN PROGRESS
Plan: 1 of 3 complete
Status: Video components created, ready for dashboard and videos page integration
Last activity: 2026-02-01 — Completed 05-01-PLAN.md

Progress: [███████░░░] 62%

## Performance Metrics

**Velocity:**
- Total plans completed: 21
- Average duration: 3.1 minutes (autonomous plans only)
- Total execution time: 1.25 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-setup | 3 | 8m | 2.7m |
| 02-authentication-account | 6 | 27m | 4.5m |
| 03-subscription-and-credits | 6 | ~2h (includes manual verification) | - |
| 04-core-video-creation | 5 | 27m | 3.4m |
| 05-video-library-dashboard | 1 | 3m | 3m |

**Recent Trend:**
- Last 5 plans: 04-02 (2m), 04-03 (1m), 04-04 (4m), 04-05 (15m checkpoint + fixes), 05-01 (3m)
- Trend: Excellent (autonomous plans execute very fast, components build cleanly)

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

**From 03-06 (Verification & Fixes):**
- Re-throw NEXT_REDIRECT errors (D-03-06-001) — Next.js redirect() throws special digest error that must be re-thrown
- Fallback for Stripe period dates (D-03-06-002) — Use subscription.created + 30 days when period dates undefined
- Prevent duplicate subscriptions (D-03-06-003) — Block checkout if active subscription exists, direct to portal
- Credits-only subscription status (D-03-06-004) — Use 'cancelled' status for single credit purchases without subscription
- Show all credits regardless of status (D-03-06-005) — Remove status filter from getCreditBalance() to include overage credits
- Contextual upgrade/downgrade CTAs (D-03-06-006) — Button text reflects action: "Upgrade to X" vs "Switch to X"
- Direct portal access from subscribe (D-03-06-007) — Plan change buttons open Stripe portal directly, no intermediate page

**From 04-01:**
- 25MB body size limit for Server Actions (D-04-01-001) — Matches Supabase Storage limit for logo uploads
- node-vibrant/browser for color extraction (D-04-01-002) — Browser-specific export with object URLs
- Magic byte validation for file security (D-04-01-003) — file-type library, never trust client MIME types
- Duration options: 4s, 6s, 8s, 15s (D-04-01-004) — Default 15s for professional animations
- Quality options: standard, premium, 1080p, 4k (D-04-01-005) — Default 1080p balanced quality
- Style presets: 8 options (D-04-01-006) — modern (default), minimal, bold, elegant, playful, corporate, cinematic, custom
- Allowed formats: JPG, PNG, WebP only (D-04-01-007) — No SVG per Veo 3 requirements

**From 04-02:**
- Fire-and-forget n8n webhook pattern (D-04-02-001) — Don't block Server Action response, webhook failure logged but not fatal
- Service role client for webhooks (D-04-02-002) — Bypasses RLS for system operations, secured by webhook secret
- Rollback on credit deduction failure (D-04-02-003) — Delete video record and uploaded file to ensure atomicity
- Idempotent webhook processing (D-04-02-004) — Use n8n_execution_id to prevent duplicate processing and retry loops

**From 04-03:**
- Public read access for logos bucket (D-04-03-001) — n8n workflow needs to download logos without auth, safe with UUID paths
- User-scoped uploads via foldername() RLS pattern (D-04-03-002) — foldername(name)[1] = auth.uid()::text ensures user folder isolation
- Composite index on videos(user_id, status) (D-04-03-003) — Optimizes dashboard queries filtering by user and status

**From 04-04:**
- Step-by-step validation pattern (D-04-04-001) — Validate fields for current step before allowing Continue button to proceed
- Centralized form state with step-specific components (D-04-04-002) — CreateVideoForm manages file state, step components are pure presentation
- Credit gate at page level (D-04-04-003) — Check credits in Server Component before rendering form, show upgrade prompt if 0 credits

**From 04-05 (Verification & Refinement):**
- Remove color extraction from client (D-04-05-001) — Let n8n/veo3 workflow determine colors from logo for better accuracy
- Simplified duration options (D-04-05-002) — Changed from ['4s', '6s', '8s', '15s'] to ['4', '6', '8'] for clarity
- Simplified quality options (D-04-05-003) — Changed from 4 options to 2 tiers: 'standard' (720p) and 'premium' (1080p)
- Database cleanup migration (D-04-05-004) — Created migration to drop unused primary_color and secondary_color columns

**From 05-01:**
- AlertDialog over Dialog for delete confirmation (D-05-01-001) — Forces explicit user choice before closing, prevents accidental deletions
- Extract storage paths from URLs via regex (D-05-01-002) — Supabase returns full public URLs, storage.remove() expects paths
- Revalidate both /videos and /dashboard after delete (D-05-01-003) — Video list appears on multiple pages, ensures cache refresh
- Show status icon placeholder when no thumbnail (D-05-01-004) — Videos in pending/processing status don't have thumbnails yet
- TypeScript null check in download link (D-05-01-005) — Explicit null check satisfies TypeScript type narrowing

### Pending Todos

None yet.

### Blockers/Concerns

None yet.

## Session Continuity

Last session: 2026-02-01
Stopped at: Completed 05-01-PLAN.md (Video Library Components)
Resume file: None
Next: Ready for 05-02 (Dashboard integration) and 05-03 (Videos page)
