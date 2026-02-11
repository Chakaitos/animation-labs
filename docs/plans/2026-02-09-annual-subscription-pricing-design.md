# Annual Subscription Pricing - Design Document

**Created:** 2026-02-09
**Status:** Approved, Ready for Implementation

## Overview

Add annual billing option for Animation Labs subscriptions with "2 months free" incentive (16.7% discount). Annual plans bill yearly but grant credits monthly with rollover caps to encourage consistent usage.

## Pricing Structure

### Plans & Pricing

| Plan | Monthly | Annual | Savings | Credits/Month | Rollover Cap |
|------|---------|--------|---------|---------------|--------------|
| Starter | $30/month | $300/year | $60 (17%) | 10 | 3 |
| Professional | $75/month | $750/year | $150 (17%) | 30 | 10 |

### Credit Allocation

- **Monthly Plans:** Credits granted monthly, no rollover (existing behavior)
- **Annual Plans:**
  - Bill once per year ($300 or $750)
  - Credits granted monthly (10 or 30)
  - Unused credits roll over up to cap each month
  - Credits beyond cap expire

### Rollover Logic

**Example: Starter Annual (10 credits/month, max 3 rollover)**

- Month 1: Grant 10 → Use 3 → 7 remaining
- Month 2: Rollover 3 (cap), **expire 4** → Grant 10 + 3 = **13 total**
- Month 3: Use 1 → 12 remaining
- Month 4: Rollover 3 (cap), **expire 9** → Grant 10 + 3 = **13 total**

**Example: Professional Annual (30 credits/month, max 10 rollover)**

- Month 1: Grant 30 → Use 20 → 10 remaining
- Month 2: Rollover 10 (cap), **expire 0** → Grant 30 + 10 = **40 total**

## Technical Implementation

### 1. Database Schema Changes

**Add columns to `subscriptions` table:**

```sql
-- Migration: 00010_add_annual_billing_support.sql

ALTER TABLE public.subscriptions
  ADD COLUMN billing_interval text NOT NULL DEFAULT 'month'
    CHECK (billing_interval IN ('month', 'year')),
  ADD COLUMN rollover_cap int NOT NULL DEFAULT 0
    CHECK (rollover_cap >= 0);

COMMENT ON COLUMN public.subscriptions.billing_interval IS
  'Billing frequency: month or year';
COMMENT ON COLUMN public.subscriptions.rollover_cap IS
  'Max credits that can roll over each period (0 = no rollover)';

-- Backfill existing subscriptions
UPDATE public.subscriptions
SET billing_interval = 'month', rollover_cap = 0
WHERE billing_interval IS NULL;
```

**Updated subscription record structure:**

```typescript
{
  plan: 'starter',              // Plan tier
  billing_interval: 'year',     // 'month' or 'year'
  credits_remaining: 13,        // Current balance
  credits_total: 10,            // Monthly allocation
  rollover_cap: 3,              // Max rollover per period
  stripe_subscription_id: 'sub_xxx',
  current_period_start: '2025-01-01',
  current_period_end: '2025-02-01'  // Monthly intervals even on annual
}
```

### 2. Stripe Configuration

**Products & Prices:**

```
Product: Starter
├─ Price: price_starter_monthly → $30/month (existing)
└─ Price: price_starter_annual → $300/year (NEW)

Product: Professional
├─ Price: price_professional_monthly → $75/month (existing)
└─ Price: price_professional_annual → $750/year (NEW)
```

**Environment Variables:**

```bash
# Add to .env.local and .env.example
STRIPE_PRICE_STARTER_ANNUAL=price_xxx
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_xxx
```

**How Annual Subscriptions Work:**

- Stripe charges $300/$750 immediately on signup
- Subscription has `interval: 'year'`, `interval_count: 1`
- Stripe sends `invoice.payment_succeeded` events **monthly** (no charge occurs)
- Monthly events trigger credit grants via webhook
- After 12 months, Stripe bills again and cycle repeats

### 3. Code Changes

#### `lib/stripe/config.ts`

```typescript
export const PLANS = {
  starter: {
    name: 'Starter',
    description: '10 videos per month',
    credits: 10,
    monthly: {
      priceId: process.env.STRIPE_PRICE_STARTER || '',
      price: '$30/month',
      rolloverCap: 0,
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_STARTER_ANNUAL || '',
      price: '$300/year',
      rolloverCap: 3,
    },
    features: [
      '10 videos per month',
      'Standard quality (1080p)',
      'All animation styles',
      'Email support',
    ],
  },
  professional: {
    name: 'Professional',
    description: '30 videos per month',
    credits: 30,
    monthly: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
      price: '$75/month',
      rolloverCap: 0,
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL || '',
      price: '$750/year',
      rolloverCap: 10,
    },
    features: [
      '30 videos per month',
      'Premium quality (4K)',
      'All animation styles',
      'Priority email support',
      'Faster processing',
    ],
  },
} as const

// Updated helper: returns plan details with interval
export function getPlanByPriceId(priceId: string): {
  planId: PlanId
  interval: 'month' | 'year'
  rolloverCap: number
} | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.monthly.priceId === priceId) {
      return {
        planId: planId as PlanId,
        interval: 'month',
        rolloverCap: plan.monthly.rolloverCap
      }
    }
    if (plan.annual.priceId === priceId) {
      return {
        planId: planId as PlanId,
        interval: 'year',
        rolloverCap: plan.annual.rolloverCap
      }
    }
  }
  return null
}
```

#### Webhook Handler Updates

**`handleCheckoutCompleted()` - Set billing interval on new subscriptions:**

```typescript
const planData = getPlanByPriceId(priceId)

await supabase.from('subscriptions').insert({
  user_id: userId,
  plan: planData.planId,
  billing_interval: planData.interval,  // NEW
  rollover_cap: planData.rolloverCap,   // NEW
  status: 'active',
  credits_remaining: plan.credits,
  credits_total: plan.credits,
  // ... rest of fields
})
```

**`handlePaymentSucceeded()` - Apply rollover logic before granting credits:**

```typescript
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only handle subscription renewals
  if (invoice.billing_reason !== 'subscription_cycle') return

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const planData = getPlanByPriceId(subscription.items.data[0].price.id)
  const plan = PLANS[planData.planId]

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, credits_remaining, rollover_cap')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!sub) return

  // Calculate rollover
  const unused = sub.credits_remaining
  const rollover = Math.min(unused, sub.rollover_cap)
  const expired = unused - rollover
  const newBalance = plan.credits + rollover

  // Update credits
  await supabase
    .from('subscriptions')
    .update({
      credits_remaining: newBalance,
      credits_total: plan.credits,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
    .eq('id', sub.id)

  // Log transactions
  if (expired > 0) {
    await supabase.from('credit_transactions').insert({
      user_id: sub.user_id,
      subscription_id: sub.id,
      amount: -expired,
      type: 'expiry',
      description: `${expired} credits expired (rollover cap: ${sub.rollover_cap})`,
    })
  }

  if (rollover > 0) {
    await supabase.from('credit_transactions').insert({
      user_id: sub.user_id,
      subscription_id: sub.id,
      amount: rollover,
      type: 'bonus',  // Use 'bonus' type for rollover
      description: `${rollover} credits rolled over from previous period`,
    })
  }

  await supabase.from('credit_transactions').insert({
    user_id: sub.user_id,
    subscription_id: sub.id,
    amount: plan.credits,
    type: 'subscription',
    description: `${plan.name} plan renewed - ${plan.credits} credits granted`,
  })
}
```

**`handleSubscriptionUpdated()` - Handle monthly → annual upgrades:**

```typescript
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const planData = getPlanByPriceId(subscription.items.data[0].price.id)
  const plan = PLANS[planData.planId]

  const updateData = {
    plan: planData.planId,
    billing_interval: planData.interval,
    rollover_cap: planData.rolloverCap,
    status: subscription.status === 'active' ? 'active' :
            subscription.status === 'past_due' ? 'past_due' :
            subscription.status === 'canceled' ? 'cancelled' : 'active',
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    // Reset credits on interval change (monthly → annual upgrade)
    credits_remaining: plan.credits,
    credits_total: plan.credits,
  }

  await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)
}
```

### 4. UI Implementation

#### Pricing Page with Toggle

```tsx
// app/(routes)/pricing/page.tsx

'use client'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  return (
    <div className="container py-12">
      {/* Toggle Switch */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span className={interval === 'month' ? 'font-semibold' : 'text-muted-foreground'}>
          Monthly
        </span>
        <Switch
          checked={interval === 'year'}
          onCheckedChange={(checked) => setInterval(checked ? 'year' : 'month')}
        />
        <span className={interval === 'year' ? 'font-semibold' : 'text-muted-foreground'}>
          Annual
        </span>
        {interval === 'year' && (
          <Badge variant="secondary" className="ml-2">
            Save 17%
          </Badge>
        )}
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PlanCard
          plan="starter"
          interval={interval}
          price={interval === 'month' ? 30 : 300}
          credits={10}
          rollover={interval === 'year' ? 3 : 0}
        />
        <PlanCard
          plan="professional"
          interval={interval}
          price={interval === 'month' ? 75 : 750}
          credits={30}
          rollover={interval === 'year' ? 10 : 0}
        />
      </div>
    </div>
  )
}

interface PlanCardProps {
  plan: 'starter' | 'professional'
  interval: 'month' | 'year'
  price: number
  credits: number
  rollover: number
}

function PlanCard({ plan, interval, price, credits, rollover }: PlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan === 'starter' ? 'Starter' : 'Professional'}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">
            /{interval === 'month' ? 'month' : 'year'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <li>✓ {credits} videos per month</li>
          {rollover > 0 && (
            <li>✓ Up to {rollover} credits roll over monthly</li>
          )}
          <li>✓ All animation styles</li>
          <li>✓ {plan === 'professional' ? '4K quality' : '1080p quality'}</li>
        </ul>
        <Button
          className="w-full mt-6"
          onClick={() => handleCheckout(plan, interval)}
        >
          Get Started
        </Button>
      </CardContent>
    </Card>
  )
}

async function handleCheckout(plan: string, interval: 'month' | 'year') {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan, interval }),
  })
  const { url } = await response.json()
  window.location.href = url
}
```

#### Billing Settings - Upgrade to Annual

```tsx
// app/(routes)/billing/page.tsx (excerpt)

{subscription.billing_interval === 'month' && (
  <Card>
    <CardHeader>
      <CardTitle>Switch to Annual Billing</CardTitle>
      <CardDescription>
        Save ${subscription.plan === 'starter' ? '60' : '150'} per year
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <ul className="space-y-2 text-sm">
          <li>✓ Pay ${subscription.plan === 'starter' ? '300' : '750'}/year
              instead of ${subscription.plan === 'starter' ? '360' : '900'}/year</li>
          <li>✓ Same {subscription.plan === 'starter' ? '10' : '30'} credits per month</li>
          <li>✓ Up to {subscription.plan === 'starter' ? '3' : '10'} credits roll over each month</li>
          <li>✓ Prorated credit for remaining time on current plan</li>
        </ul>
        <Button onClick={handleUpgradeToAnnual}>
          Upgrade to Annual Billing
        </Button>
      </div>
    </CardContent>
  </Card>
)}

async function handleUpgradeToAnnual() {
  await fetch('/api/billing/upgrade-to-annual', { method: 'POST' })
  router.refresh()
}
```

#### Upgrade API Endpoint

```typescript
// app/api/billing/upgrade-to-annual/route.ts

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!sub || sub.billing_interval === 'year') {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  // Update Stripe subscription to annual price
  const newPriceId = PLANS[sub.plan as PlanId].annual.priceId

  const stripeSubscription = await stripe.subscriptions.retrieve(
    sub.stripe_subscription_id
  )

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{
      id: stripeSubscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations',  // Auto-prorate
  })

  // Webhook will handle the subscription.updated event to update our DB

  return NextResponse.json({ success: true })
}
```

## User Flows

### 1. New Annual Subscription

1. User visits pricing page
2. Toggles to "Annual" view
3. Clicks "Get Started" on Starter ($300/year) or Professional ($750/year)
4. Redirected to Stripe Checkout
5. Completes payment
6. Webhook creates subscription with:
   - `billing_interval: 'year'`
   - `rollover_cap: 3` or `10`
   - `credits_remaining: 10` or `30`
7. User receives immediate access with first month's credits
8. Each month, webhook grants new credits + applies rollover

### 2. Monthly → Annual Upgrade

1. User with monthly subscription visits billing settings
2. Sees "Switch to Annual Billing" card with savings amount
3. Clicks "Upgrade to Annual Billing"
4. Stripe:
   - Calculates prorated refund for unused monthly time
   - Charges annual amount minus proration
   - Updates subscription interval to yearly
5. Webhook receives `subscription.updated` event:
   - Updates `billing_interval: 'year'`
   - Sets `rollover_cap: 3` or `10`
   - **Resets credits to monthly allocation** (10 or 30)
6. User now on annual billing with rollover benefits

### 3. Credit Rollover (Monthly Grant)

1. User has 7 unused credits at end of month (Starter Annual)
2. Stripe sends `invoice.payment_succeeded` (subscription_cycle)
3. Webhook:
   - Calculates rollover: `min(7, 3) = 3`
   - Logs expiry: `4 credits expired`
   - Logs rollover: `3 credits rolled over`
   - Grants new credits: `10 credits granted`
   - Updates balance: `13 total credits`
4. User sees in credit history:
   - `-4 credits expired (rollover cap reached)`
   - `+3 credits rolled over from previous period`
   - `+10 Starter plan renewed - 10 credits granted`

## Edge Cases

### 1. Annual → Monthly Downgrade
- **Not allowed mid-cycle**
- User must wait until annual subscription expires
- Can cancel renewal to prevent auto-renewal to annual
- At expiration, can subscribe to monthly plan

### 2. Cancellation
- User can cancel anytime (renew = off)
- Keeps full access until `current_period_end`
- Credits remain available until expiration
- No refunds for unused time (standard policy)

### 3. Plan Change (Starter Annual → Professional Annual)
- Allowed via Stripe subscription update
- Stripe prorates the difference
- Webhook resets credits to new tier (30 credits)
- Rollover cap updates to new tier (10)

### 4. First Month on Annual Plan
- New annual subscription gets full monthly allocation immediately
- No rollover on first month (nothing to roll over)
- Rollover logic starts on second monthly interval

### 5. Expired Credits Display
- Show in credit transaction history
- Type: `'expiry'`, negative amount
- Description: `"4 credits expired (rollover cap: 3)"`
- Helps users understand rollover behavior

## Testing Plan

### Stripe Test Mode

1. **Create Annual Prices:**
   - Starter Annual: $300/year (test mode)
   - Professional Annual: $750/year (test mode)

2. **Test New Annual Subscription:**
   - Complete checkout for annual plan
   - Verify subscription created with correct fields
   - Use Stripe CLI to trigger monthly `invoice.payment_succeeded`
   - Verify credits granted correctly

3. **Test Rollover Logic:**
   - Manually update `credits_remaining` in database
   - Trigger `invoice.payment_succeeded` webhook
   - Verify rollover calculation and expiry logging

4. **Test Monthly → Annual Upgrade:**
   - Create monthly subscription
   - Call upgrade API
   - Verify Stripe proration
   - Verify webhook updates fields and resets credits

5. **Test Plan Changes:**
   - Upgrade Starter Annual → Professional Annual
   - Verify proration and credit reset

### Manual Testing

- [ ] UI toggle switch updates prices correctly
- [ ] Rollover badge shows on annual plans only
- [ ] Billing settings shows upgrade option for monthly users
- [ ] Credit history displays rollovers and expiries clearly
- [ ] Edge cases handled gracefully (cancellations, upgrades)

## Implementation Checklist

### Database
- [ ] Create migration `00010_add_annual_billing_support.sql`
- [ ] Add `billing_interval` and `rollover_cap` columns
- [ ] Backfill existing subscriptions with defaults
- [ ] Test migration on local database

### Stripe Setup
- [ ] Create Starter Annual price in test mode ($300/year)
- [ ] Create Professional Annual price in test mode ($750/year)
- [ ] Add price IDs to `.env.local`
- [ ] Add price IDs to `.env.example` (with placeholder values)
- [ ] Document price IDs in project notes

### Backend Code
- [ ] Update `lib/stripe/config.ts` with annual pricing
- [ ] Modify `getPlanByPriceId()` to return interval + rollover
- [ ] Update `handleCheckoutCompleted()` to set new fields
- [ ] Update `handlePaymentSucceeded()` with rollover logic
- [ ] Update `handleSubscriptionUpdated()` for upgrades
- [ ] Create `/api/billing/upgrade-to-annual` endpoint
- [ ] Update checkout API to accept `interval` parameter

### Frontend Code
- [ ] Create pricing page with toggle switch (`/pricing`)
- [ ] Build `PlanCard` component with interval props
- [ ] Add upgrade card to billing settings
- [ ] Update credit transaction display for rollover/expiry types
- [ ] Add rollover information to plan details/tooltips

### Testing
- [ ] Test new annual subscription flow (Stripe test mode)
- [ ] Test rollover logic with Stripe CLI webhook triggers
- [ ] Test monthly → annual upgrade with proration
- [ ] Test credit expiry logging
- [ ] Test UI on mobile and desktop
- [ ] Test with both Starter and Professional plans

### Documentation
- [ ] Update README with annual pricing info
- [ ] Document rollover behavior in user-facing docs
- [ ] Add Stripe webhook testing instructions to dev docs

### Deployment
- [ ] Create annual prices in Stripe live mode
- [ ] Add live price IDs to production env vars
- [ ] Deploy database migration
- [ ] Deploy code changes
- [ ] Monitor webhook logs for errors
- [ ] Test live checkout flow with real payment method

## Success Metrics

- Annual subscriptions created successfully
- Monthly credit grants working correctly
- Rollover caps applied as expected
- Upgrade flow completes without errors
- Zero webhook processing errors
- User feedback on rollover clarity

---

**Next Steps:** Review this design, then proceed with implementation starting with database migration.
