---
phase: 03-subscription-and-credits
plan: 01
subsystem: payments
tags: [stripe, subscriptions, payments, credit-system]

# Dependency graph
requires:
  - phase: 01-foundation-setup
    provides: Next.js 16 project structure with TypeScript
  - phase: 01-foundation-setup
    provides: Environment variable configuration pattern
provides:
  - Stripe SDK v20.2.0 server-side client initialization
  - Subscription plan configuration (Starter: 10 credits, Professional: 30 credits)
  - Credit pack configuration for overage purchases (5, 10, 25 credits)
  - Type-safe helper functions for webhook price ID mapping
affects: [03-02-checkout, 03-03-webhooks, 03-04-billing-dashboard]

# Tech tracking
tech-stack:
  added: [stripe@20.2.0, @stripe/stripe-js@8.6.4]
  patterns: [environment-based price IDs, const type exports for type safety]

key-files:
  created:
    - lib/stripe/client.ts
    - lib/stripe/config.ts
  modified:
    - .env.example
    - package.json

key-decisions:
  - "Stripe API version 2025-12-15.clover selected (TypeScript SDK requirement)"
  - "Two-tier subscription model: Starter (10 credits/$X) and Professional (30 credits/$Y)"
  - "Credit packs for overage: 5, 10, 25 credit bundles"
  - "Price IDs as environment variables for test/live mode separation"

patterns-established:
  - "Stripe client export pattern: lib/stripe/client.ts exports configured singleton"
  - "Configuration as const pattern: PLANS and CREDIT_PACKS with 'as const' for type inference"
  - "Helper functions for webhook processing: getPlanByPriceId() and getCreditPackByPriceId()"

# Metrics
duration: 2min
completed: 2026-01-28
---

# Phase 3 Plan 1: Stripe Foundation Summary

**Stripe SDK v20 installed with subscription plans (10/30 credits) and credit packs (5/10/25) configured for webhook-driven billing**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-28T18:40:24Z
- **Completed:** 2026-01-28T18:42:10Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Stripe SDK packages installed (stripe v20.2.0 for server, @stripe/stripe-js v8.6.4 for client)
- Server-side Stripe client configured with API version 2025-12-15.clover
- Subscription plan configuration with Starter (10 credits) and Professional (30 credits) tiers
- Credit pack configuration for overage purchases (5, 10, 25 credit bundles)
- Type-safe helper functions for webhook price ID lookups
- Complete Stripe environment variable documentation in .env.example

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Stripe dependencies** - `2b516ec` (chore)
2. **Task 2: Create Stripe client and plan configuration** - `62b8090` (feat)

## Files Created/Modified
- `lib/stripe/client.ts` - Stripe server-side client with error handling for missing STRIPE_SECRET_KEY
- `lib/stripe/config.ts` - PLANS and CREDIT_PACKS configuration with type-safe exports and webhook helper functions
- `.env.example` - Added STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, and 5 price ID variables
- `package.json` - Added stripe and @stripe/stripe-js dependencies

## Decisions Made

**D-03-01-001: Stripe API version 2025-12-15.clover**
- Rationale: TypeScript SDK requires specific API version string. Selected latest stable version supported by stripe@20.2.0
- Impact: Ensures type safety and API compatibility

**D-03-01-002: Two-tier subscription model**
- Rationale: Simple pricing ladder (Starter → Professional) aligns with credit-based value proposition
- Impact: Starter (10 credits/month) for casual users, Professional (30 credits/month) for regular users

**D-03-01-003: Credit packs for overage**
- Rationale: Users need option to purchase additional credits without upgrading subscription
- Impact: Small (5), Medium (10), Large (25) packs provide flexibility

**D-03-01-004: Price IDs as environment variables**
- Rationale: Stripe Test mode and Live mode have separate price IDs. Environment variables enable seamless test-to-production transition
- Impact: STRIPE_PRICE_STARTER, STRIPE_PRICE_PROFESSIONAL, STRIPE_PRICE_CREDITS_5/10/25 must be configured per environment

**D-03-01-005: Configuration pattern with 'as const'**
- Rationale: TypeScript 'as const' enables full type inference for PlanId and CreditPackId union types
- Impact: Type-safe plan/pack selection throughout codebase

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected Stripe API version string**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** Plan specified apiVersion: '2025-01-27.acacia' but TypeScript SDK expected '2025-12-15.clover'
- **Fix:** Changed to '2025-12-15.clover' to match Stripe SDK v20.2.0 TypeScript definitions
- **Files modified:** lib/stripe/client.ts
- **Verification:** TypeScript compilation passed, npm run build succeeded
- **Committed in:** 62b8090 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug - API version mismatch)
**Impact on plan:** API version correction necessary for TypeScript compilation. No scope change.

## Issues Encountered
None - straightforward installation and configuration.

## User Setup Required

**External services require manual configuration.** Before using Stripe integration:

1. **Create Stripe account** (if not exists): https://dashboard.stripe.com/register
2. **Get API keys** from https://dashboard.stripe.com/apikeys
   - Copy Secret key → `STRIPE_SECRET_KEY` in .env.local
   - Copy Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in .env.local
3. **Create webhook endpoint** (in Phase 03-03):
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - Copy Webhook signing secret → `STRIPE_WEBHOOK_SECRET` in .env.local
4. **Create products and prices** in Stripe Dashboard:
   - Test mode: https://dashboard.stripe.com/test/products
   - Create "Starter" subscription (monthly recurring) → copy price ID → `STRIPE_PRICE_STARTER`
   - Create "Professional" subscription (monthly recurring) → copy price ID → `STRIPE_PRICE_PROFESSIONAL`
   - Create "5 Credits" one-time payment → copy price ID → `STRIPE_PRICE_CREDITS_5`
   - Create "10 Credits" one-time payment → copy price ID → `STRIPE_PRICE_CREDITS_10`
   - Create "25 Credits" one-time payment → copy price ID → `STRIPE_PRICE_CREDITS_25`

**Note:** All Stripe configuration uses Test mode during development. Live mode setup required before production launch.

## Next Phase Readiness

**Ready for:**
- Phase 03-02 (Checkout flow): Stripe client available, price IDs configured
- Phase 03-03 (Webhook handler): Helper functions ready for price ID → plan mapping
- Phase 03-04 (Billing dashboard): PLANS config provides UI data (name, description, features)

**Provides:**
- `stripe` export from lib/stripe/client.ts - configured Stripe instance
- `PLANS` and `CREDIT_PACKS` from lib/stripe/config.ts - plan configuration with type exports
- `getPlanByPriceId()` and `getCreditPackByPriceId()` - webhook helper functions

**No blockers.** Stripe foundation complete and verified.

---
*Phase: 03-subscription-and-credits*
*Completed: 2026-01-28*
