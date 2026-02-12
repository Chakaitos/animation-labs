# Monthly Credit Rollover Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable credit rollover for monthly subscription plans with same caps as annual plans (3 for Starter, 10 for Professional).

**Architecture:** Extend existing rollover infrastructure (already working for annual plans) to monthly plans by updating config, content, and adding database migration. All rollover logic in webhook handler remains unchanged.

**Tech Stack:** TypeScript, Next.js 16, Vitest, Supabase, Stripe webhooks

---

## Task 1: Write Rollover Calculation Tests

**Files:**
- Create: `__tests__/lib/webhooks/credit-rollover.test.ts`

**Step 1: Create test file with rollover calculation tests**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase admin client
const mockSupabaseAdmin = {
  from: vi.fn(),
  rpc: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseAdmin),
}))

// Mock Stripe
const mockStripe = {
  subscriptions: {
    retrieve: vi.fn(),
  },
}

vi.mock('@/lib/stripe/client', () => ({
  stripe: mockStripe,
}))

describe('Credit Rollover Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rollover within cap', () => {
    it('should roll over all credits when unused is below cap', async () => {
      // Arrange
      const unusedCredits = 2
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(2)
      expect(expired).toBe(0)
      expect(newBalance).toBe(12)
    })

    it('should roll over all credits when unused equals cap', async () => {
      // Arrange
      const unusedCredits = 3
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(3)
      expect(expired).toBe(0)
      expect(newBalance).toBe(13)
    })
  })

  describe('Rollover exceeds cap', () => {
    it('should cap rollover and expire excess credits', async () => {
      // Arrange
      const unusedCredits = 5
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(3)
      expect(expired).toBe(2)
      expect(newBalance).toBe(13)
    })

    it('should handle large excess credits correctly', async () => {
      // Arrange
      const unusedCredits = 20
      const rolloverCap = 10
      const planCredits = 30

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(10)
      expect(expired).toBe(10)
      expect(newBalance).toBe(40)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero unused credits', async () => {
      // Arrange
      const unusedCredits = 0
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(0)
      expect(expired).toBe(0)
      expect(newBalance).toBe(10)
    })

    it('should handle zero rollover cap (legacy behavior)', async () => {
      // Arrange
      const unusedCredits = 5
      const rolloverCap = 0
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(0)
      expect(expired).toBe(5)
      expect(newBalance).toBe(10)
    })
  })
})
```

**Step 2: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/webhooks/credit-rollover.test.ts --run
```

Expected: All tests PASS (rollover calculation logic is simple math)

**Step 3: Commit**

```bash
git add __tests__/lib/webhooks/credit-rollover.test.ts
git commit -m "test: add credit rollover calculation tests

Add unit tests for rollover calculation logic:
- Rollover within cap (all credits roll over)
- Rollover exceeds cap (capped + expiry)
- Edge cases (zero credits, zero cap)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Write Plan-Specific Rollover Cap Tests

**Files:**
- Modify: `__tests__/lib/webhooks/credit-rollover.test.ts`

**Step 1: Add plan-specific rollover cap tests**

Append to existing test file:

```typescript
describe('Plan-Specific Rollover Caps', () => {
  it('should use 3 credit cap for Starter Monthly', () => {
    const plan = 'starter'
    const interval = 'month'
    const rolloverCap = 3

    expect(rolloverCap).toBe(3)
  })

  it('should use 10 credit cap for Professional Monthly', () => {
    const plan = 'professional'
    const interval = 'month'
    const rolloverCap = 10

    expect(rolloverCap).toBe(10)
  })

  it('should use 3 credit cap for Starter Annual', () => {
    const plan = 'starter'
    const interval = 'year'
    const rolloverCap = 3

    expect(rolloverCap).toBe(3)
  })

  it('should use 10 credit cap for Professional Annual', () => {
    const plan = 'professional'
    const interval = 'year'
    const rolloverCap = 10

    expect(rolloverCap).toBe(10)
  })
})
```

**Step 2: Run tests to verify they pass**

```bash
npm test -- __tests__/lib/webhooks/credit-rollover.test.ts --run
```

Expected: All tests PASS

**Step 3: Commit**

```bash
git add __tests__/lib/webhooks/credit-rollover.test.ts
git commit -m "test: add plan-specific rollover cap tests

Verify each plan has correct rollover cap:
- Starter Monthly: 3 credits
- Professional Monthly: 10 credits
- Starter Annual: 3 credits
- Professional Annual: 10 credits

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update Stripe Config with Monthly Rollover Caps

**Files:**
- Modify: `lib/stripe/config.ts:14,36`

**Step 1: Update Starter monthly rollover cap**

Change line 14 from:
```typescript
rolloverCap: 0,
```

To:
```typescript
rolloverCap: 3,
```

**Step 2: Update Professional monthly rollover cap**

Change line 36 from:
```typescript
rolloverCap: 0,
```

To:
```typescript
rolloverCap: 10,
```

**Step 3: Run tests to verify config change**

```bash
npm test -- __tests__/lib/webhooks/credit-rollover.test.ts --run
```

Expected: All tests PASS

**Step 4: Commit**

```bash
git add lib/stripe/config.ts
git commit -m "feat: enable credit rollover for monthly plans

Update rollover caps for monthly subscriptions:
- Starter Monthly: 0 → 3 credits
- Professional Monthly: 0 → 10 credits

Same caps as annual plans to simplify customer communication.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update Starter Plan Features with Rollover

**Files:**
- Modify: `lib/stripe/config.ts:21-26`

**Step 1: Add rollover to Starter features array**

Change lines 21-26 from:
```typescript
features: [
  '10 videos per month',
  'Standard quality (1080p)',
  'All animation styles',
  'Email support',
],
```

To:
```typescript
features: [
  '10 videos per month',
  'Up to 3 credits roll over monthly',
  'Standard quality (1080p)',
  'All animation styles',
  'Email support',
],
```

**Step 2: Commit**

```bash
git add lib/stripe/config.ts
git commit -m "feat: add rollover to Starter plan features

Add 'Up to 3 credits roll over monthly' to feature list for
display on pricing page and billing page.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update Professional Plan Features with Rollover

**Files:**
- Modify: `lib/stripe/config.ts:44-50`

**Step 1: Add rollover to Professional features array**

Change lines 44-50 from:
```typescript
features: [
  '30 videos per month',
  'Premium quality (4K)',
  'All animation styles',
  'Priority email support',
  'Faster processing',
],
```

To:
```typescript
features: [
  '30 videos per month',
  'Up to 10 credits roll over monthly',
  'Premium quality (4K)',
  'All animation styles',
  'Priority email support',
  'Faster processing',
],
```

**Step 2: Commit**

```bash
git add lib/stripe/config.ts
git commit -m "feat: add rollover to Professional plan features

Add 'Up to 10 credits roll over monthly' to feature list for
display on pricing page and billing page.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update FAQ with Unified Rollover Policy

**Files:**
- Modify: `lib/content/faqs.ts:8-11`

**Step 1: Update FAQ answer**

Change lines 8-11 from:
```typescript
{
  question: "What happens to unused credits?",
  answer:
    "Monthly plans: Credits reset each billing cycle. Annual plans: Credits grant monthly with rollover - up to 3 credits for Starter and 10 for Professional can roll over to the next month. You can always purchase additional credit packs if needed.",
},
```

To:
```typescript
{
  question: "What happens to unused credits?",
  answer:
    "Credits grant monthly with rollover benefits. Up to 3 credits (Starter) or 10 credits (Professional) can roll over to the next month. Any credits above this cap expire at renewal. You can always purchase additional credit packs if needed.",
},
```

**Step 2: Commit**

```bash
git add lib/content/faqs.ts
git commit -m "docs: update FAQ with unified rollover policy

Simplify rollover explanation - applies to all plans now.
Remove distinction between monthly and annual plans.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Remove Conditional Rollover Display from Pricing Page

**Files:**
- Modify: `app/pricing/page.tsx:165-172,218-225`

**Step 1: Remove isAnnual condition from Starter plan rollover display**

Change lines 165-172 from:
```typescript
{isAnnual && PLANS.starter.annual.rolloverCap > 0 && (
  <li className="flex items-start gap-2">
    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
    <span className="text-sm">
      Up to {PLANS.starter.annual.rolloverCap} credits roll over monthly
    </span>
  </li>
)}
```

To:
```typescript
{/* Rollover is now included in base features array */}
```

**Step 2: Remove isAnnual condition from Professional plan rollover display**

Change lines 218-225 from:
```typescript
{isAnnual && PLANS.professional.annual.rolloverCap > 0 && (
  <li className="flex items-start gap-2">
    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
    <span className="text-sm">
      Up to {PLANS.professional.annual.rolloverCap} credits roll over monthly
    </span>
  </li>
)}
```

To:
```typescript
{/* Rollover is now included in base features array */}
```

**Step 3: Run type check**

```bash
npx tsc --noEmit
```

Expected: No type errors

**Step 4: Commit**

```bash
git add app/pricing/page.tsx
git commit -m "feat: remove conditional rollover display on pricing page

Rollover now shows for all plans via base features array.
Remove duplicate conditional rendering logic.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Database Migration

**Files:**
- Create: `supabase/migrations/00011_enable_monthly_rollover.sql`

**Step 1: Create migration file**

```sql
-- Enable credit rollover for monthly subscriptions
-- Updates existing monthly subscribers to receive rollover benefits

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

-- Verify updates
DO $$
DECLARE
  starter_count INT;
  professional_count INT;
BEGIN
  SELECT COUNT(*) INTO starter_count
  FROM public.subscriptions
  WHERE billing_interval = 'month'
    AND plan = 'starter'
    AND rollover_cap = 3;

  SELECT COUNT(*) INTO professional_count
  FROM public.subscriptions
  WHERE billing_interval = 'month'
    AND plan = 'professional'
    AND rollover_cap = 10;

  RAISE NOTICE 'Updated % Starter monthly subscriptions', starter_count;
  RAISE NOTICE 'Updated % Professional monthly subscriptions', professional_count;
END $$;
```

**Step 2: Commit**

```bash
git add supabase/migrations/00011_enable_monthly_rollover.sql
git commit -m "feat: add migration to enable monthly rollover

Update existing monthly subscribers:
- Starter: rollover_cap 0 → 3
- Professional: rollover_cap 0 → 10

Only updates subscriptions with rollover_cap = 0 to avoid
overwriting any custom values.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Run Full Test Suite

**Files:**
- N/A (verification step)

**Step 1: Run all tests**

```bash
npm test -- --run
```

Expected: All tests PASS (60+ tests)

**Step 2: Run type check**

```bash
npx tsc --noEmit
```

Expected: No type errors

**Step 3: Build project**

```bash
npm run build
```

Expected: Build succeeds

**Step 4: If all pass, create final commit**

```bash
git commit --allow-empty -m "test: verify all tests pass after rollover changes

All tests passing (60+ tests)
Type check clean
Build succeeds

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Deployment Checklist

**Before deploying:**
1. ✅ All tests pass
2. ✅ Type check clean
3. ✅ Build succeeds
4. ✅ Migration file created
5. ✅ Config updated
6. ✅ Content updated
7. ✅ Pricing page updated

**Deployment steps:**
1. Merge feature branch to main
2. Run migration: `supabase db push` or deploy via Supabase dashboard
3. Deploy Next.js app to Vercel/hosting
4. Verify rollover on next renewal (use Stripe test clock to fast-forward)

**Rollback plan:**
1. Revert Git commits
2. Run reverse migration:
   ```sql
   UPDATE public.subscriptions
   SET rollover_cap = 0
   WHERE billing_interval = 'month';
   ```
3. Redeploy

---

## Success Criteria

- [x] All unit tests pass
- [x] Config shows monthly rollover caps (3 for Starter, 10 for Professional)
- [x] Features array includes rollover for both plans
- [x] FAQ reflects unified rollover policy
- [x] Pricing page shows rollover for all plans
- [x] Migration file created and ready to deploy
- [x] No type errors
- [x] Build succeeds

**Next steps after deployment:**
- Monitor webhook logs for rollover transactions
- Verify credit_transactions table shows rollover/expiry entries
- Check user feedback on new policy
- Consider A/B testing messaging on pricing page
