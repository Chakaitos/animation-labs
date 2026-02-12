# Monthly Credit Rollover Design

**Date:** 2026-02-12
**Status:** Approved
**Author:** Claude + User

## Overview

Enable credit rollover for monthly subscription plans with the same rollover caps as annual plans (3 credits for Starter, 10 credits for Professional).

## Background

Currently, only annual plans have credit rollover enabled:
- Starter Annual: 3 credit rollover cap
- Professional Annual: 10 credit rollover cap
- Monthly plans: 0 rollover cap (credits reset each cycle)

The rollover infrastructure already exists and works correctly for annual plans. This change extends the same benefit to monthly subscribers.

## Requirements

1. Monthly plans should have the same rollover caps as annual plans
2. Existing monthly subscribers should receive the benefit at their next renewal
3. FAQs and pricing pages must reflect the unified rollover policy
4. Comprehensive unit tests must validate rollover logic

## Decision: Rollover Caps

**Option A (Selected):** Same caps as annual
- Starter Monthly: 3 credits
- Professional Monthly: 10 credits

**Rationale:** Simplifies customer communication, improves customer satisfaction, and annual discount (17%) already provides strong incentive for annual plans.

## Technical Design

### 1. Configuration Changes

**File:** `lib/stripe/config.ts`

Update monthly plan configs:
```typescript
starter: {
  monthly: {
    rolloverCap: 3,  // Changed from 0
  },
}

professional: {
  monthly: {
    rolloverCap: 10,  // Changed from 0
  },
}
```

### 2. Database Migration

**File:** `supabase/migrations/00011_enable_monthly_rollover.sql`

Update existing monthly subscriptions:
```sql
-- Update Starter monthly subscribers
UPDATE public.subscriptions
SET rollover_cap = 3
WHERE billing_interval = 'month'
  AND plan = 'starter'
  AND rollover_cap = 0;

-- Update Professional monthly subscribers
UPDATE public.subscriptions
SET rollover_cap = 10
WHERE billing_interval = 'month'
  AND plan = 'professional'
  AND rollover_cap = 0;
```

**Impact:** Existing monthly subscribers benefit at their next renewal. No immediate credit balance changes.

### 3. Content Updates

**File:** `lib/content/faqs.ts`

Update "What happens to unused credits?" answer:
```
Before: "Monthly plans: Credits reset each billing cycle. Annual plans: Credits grant monthly with rollover..."

After: "Credits grant monthly with rollover benefits. Up to 3 credits (Starter) or 10 credits (Professional) can roll over to the next month. Any credits above this cap expire at renewal."
```

**File:** `lib/stripe/config.ts`

Add rollover to base features array:
```typescript
features: [
  '10 videos per month',
  'Up to 3 credits roll over monthly',  // Add this
  'Standard quality (1080p)',
  // ...
]
```

**File:** `app/pricing/page.tsx`

Remove `isAnnual &&` condition from rollover display (lines 165, 218) so rollover feature shows for all plans.

### 4. Unit Tests

**File:** `__tests__/lib/webhooks/credit-rollover.test.ts`

Test coverage:
1. **Rollover calculation:**
   - Unused < cap → all roll over
   - Unused > cap → capped rollover + expiry
   - Unused = 0 → no rollover
   - Unused = cap → all roll over

2. **Plan-specific caps:**
   - Starter monthly: 3 cap
   - Professional monthly: 10 cap
   - Starter annual: 3 cap
   - Professional annual: 10 cap

3. **Transaction logging:**
   - Expiry transactions logged
   - Rollover transactions logged
   - Renewal transactions logged

4. **Edge cases:**
   - Zero rollover cap (legacy)
   - Boundary conditions

## Implementation Order

1. **Write tests first** (TDD)
2. **Update config** (`lib/stripe/config.ts`)
3. **Update content** (FAQs, features, pricing page)
4. **Create migration** (`00011_enable_monthly_rollover.sql`)
5. **Run tests** to verify

## Risk Assessment

**Risk Level:** Low

**Mitigations:**
- Rollover logic already proven for annual plans
- Only expanding benefits (no breaking changes)
- Tests validate behavior
- Can rollback by reverting config and running reverse migration

**Rollback Plan:**
1. Revert config changes
2. Run reverse migration to set monthly rollover_cap back to 0
3. Revert content changes

## Success Criteria

1. ✅ All unit tests pass
2. ✅ Existing monthly subscribers have updated rollover_cap
3. ✅ New monthly subscriptions get correct rollover_cap
4. ✅ Rollover works correctly at renewal (test with Stripe test clock)
5. ✅ FAQs and pricing accurately reflect new policy
6. ✅ No errors in webhook processing

## Timeline

- Design: ✅ Complete
- Implementation: ~2 hours
- Testing: ~1 hour
- Deployment: ~30 minutes

## Related Documents

- Original annual billing design: `docs/plans/2026-02-09-annual-subscription-pricing-design.md`
- Annual billing implementation: `docs/plans/2026-02-09-annual-subscription-pricing-implementation.md`
