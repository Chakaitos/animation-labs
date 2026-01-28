---
phase: 03-subscription-and-credits
plan: 03
subsystem: payments
tags: [stripe, checkout, billing, server-actions]

# Dependency graph
requires:
  - phase: 03-01
    provides: Stripe SDK client and configuration with plans and credit packs
provides:
  - Checkout Server Actions for subscription and credit pack purchases
  - Billing Server Actions for portal access and subscription management
  - Credit balance and transaction history queries
affects: [03-04, 03-05, 04-video-creation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Actions for Stripe checkout sessions with metadata attachment"
    - "Customer Portal sessions for subscription self-service"
    - "Credit balance aggregation (subscription + overage credits)"

key-files:
  created:
    - lib/actions/checkout.ts
    - lib/actions/billing.ts
  modified: []

key-decisions:
  - "Attach user_id to checkout session metadata for webhook processing"
  - "Require active subscription before allowing credit pack purchases"
  - "Customer Portal return URL always points to /billing page"
  - "getCreditBalance returns breakdown (subscription vs overage credits)"

patterns-established:
  - "Server Actions follow auth.ts pattern: 'use server', redirect on auth failure, getSiteUrl helper"
  - "Checkout success URLs include query params for post-purchase feedback"
  - "Error responses return { error: string }, redirects use next/navigation redirect()"

# Metrics
duration: 1min
completed: 2026-01-28
---

# Phase 03 Plan 03: Checkout & Billing Actions Summary

**Server Actions for Stripe checkout sessions and billing management with user_id metadata attachment**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-28T18:44:05Z
- **Completed:** 2026-01-28T18:45:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Checkout Server Actions for subscription and credit pack purchases with metadata
- Billing Server Actions for Customer Portal access and subscription queries
- Credit balance aggregation combining subscription and overage credits
- Transaction history query with pagination support

## Task Commits

Each task was committed atomically:

1. **Task 1: Create checkout Server Actions** - `213c38e` (feat)
2. **Task 2: Create billing management Server Actions** - `db53fd8` (feat)

**Plan metadata:** _(to be added in final commit)_

## Files Created/Modified

- `lib/actions/checkout.ts` - createSubscriptionCheckout and createCreditPackCheckout Server Actions
- `lib/actions/billing.ts` - createPortalSession, getSubscription, getCreditBalance, getCreditHistory Server Actions

## Decisions Made

**D-03-03-001: User ID metadata attachment**
- Attach user_id to checkout session metadata and subscription_data.metadata
- Rationale: Enables webhook to identify user without database lookups before session completes

**D-03-03-002: Credit pack purchase requires active subscription**
- Credit packs can only be purchased by users with active subscriptions
- Rationale: Prevents orphaned overage credits, ensures users are paying customers

**D-03-03-003: Customer Portal return URL**
- Portal sessions always return to /billing page
- Rationale: Consistent user experience, centralized billing management

**D-03-03-004: Credit balance breakdown**
- getCreditBalance returns subscription, overage, and total credits separately
- Rationale: UI can show credit source breakdown, helps users understand renewal vs purchases

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all TypeScript compilation passed, build succeeded.

## User Setup Required

None - no external service configuration required. Stripe checkout and portal sessions will work once environment variables are configured (handled in 03-01).

## Next Phase Readiness

**Ready for:**
- 03-04: Billing dashboard UI (can use getSubscription, getCreditBalance, getCreditHistory)
- 03-05: Webhook handlers (metadata user_id enables user identification)

**Implementation notes:**
- Checkout sessions redirect to success/cancel URLs with query parameters
- Portal sessions handle subscription changes (upgrade, downgrade, cancel)
- All Server Actions follow established auth.ts pattern for consistency

---
*Phase: 03-subscription-and-credits*
*Completed: 2026-01-28*
