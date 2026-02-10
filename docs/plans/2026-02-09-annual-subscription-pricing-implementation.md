# Annual Subscription Pricing - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add annual billing option ($300/yr Starter, $750/yr Pro) with monthly credit grants and rollover caps (3/10 credits).

**Architecture:** Extend existing Stripe webhook system to support annual subscriptions. Add database columns for billing interval and rollover caps. Update config to map price IDs to intervals. Apply rollover logic on monthly credit grants.

**Tech Stack:** Next.js 16, TypeScript, Supabase (PostgreSQL), Stripe API, Tailwind CSS 4

---

## Task 1: Database Schema Migration

**Files:**
- Create: `supabase/migrations/00010_add_annual_billing_support.sql`

**Step 1: Write the migration SQL**

Create file `supabase/migrations/00010_add_annual_billing_support.sql`:

```sql
-- Add annual billing support to subscriptions table
-- Adds billing_interval (month/year) and rollover_cap columns

ALTER TABLE public.subscriptions
  ADD COLUMN billing_interval text NOT NULL DEFAULT 'month'
    CHECK (billing_interval IN ('month', 'year')),
  ADD COLUMN rollover_cap int NOT NULL DEFAULT 0
    CHECK (rollover_cap >= 0);

COMMENT ON COLUMN public.subscriptions.billing_interval IS
  'Billing frequency: month or year';
COMMENT ON COLUMN public.subscriptions.rollover_cap IS
  'Max credits that can roll over each period (0 = no rollover)';

-- Backfill existing subscriptions with monthly defaults
UPDATE public.subscriptions
SET billing_interval = 'month', rollover_cap = 0
WHERE billing_interval IS NULL OR rollover_cap IS NULL;
```

**Step 2: Test the migration locally**

If you have Supabase CLI installed:
```bash
supabase db reset
```

Or manually apply to your local Supabase instance via SQL editor.

Expected: Migration runs successfully, columns added with constraints.

**Step 3: Verify schema changes**

Query the table schema:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name IN ('billing_interval', 'rollover_cap');
```

Expected output:
```
billing_interval | text | 'month'::text
rollover_cap     | integer | 0
```

**Step 4: Commit**

```bash
git add supabase/migrations/00010_add_annual_billing_support.sql
git commit -m "feat(db): add annual billing support to subscriptions

- Add billing_interval column (month/year)
- Add rollover_cap column for credit rollover limits
- Backfill existing subscriptions with monthly defaults
- Add constraints and comments"
```

---

## Task 2: Update Stripe Configuration

**Files:**
- Modify: `lib/stripe/config.ts`
- Modify: `.env.example`

**Step 1: Update Stripe config structure**

Modify `lib/stripe/config.ts`:

```typescript
// Subscription plan configuration
// Price IDs are environment-specific (test vs live mode)

export const PLANS = {
  starter: {
    name: 'Starter',
    description: '10 videos per month',
    credits: 10,
    monthly: {
      priceId: process.env.STRIPE_PRICE_STARTER || '',
      price: 30,
      displayPrice: '$30/month',
      rolloverCap: 0,
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_STARTER_ANNUAL || '',
      price: 300,
      displayPrice: '$300/year',
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
      price: 75,
      displayPrice: '$75/month',
      rolloverCap: 0,
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL || '',
      price: 750,
      displayPrice: '$750/year',
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

export type PlanId = keyof typeof PLANS
export type BillingInterval = 'month' | 'year'

// Helper to get plan details by price ID (for webhook processing)
export function getPlanByPriceId(priceId: string): {
  planId: PlanId
  interval: BillingInterval
  rolloverCap: number
} | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.monthly.priceId === priceId) {
      return {
        planId: planId as PlanId,
        interval: 'month',
        rolloverCap: plan.monthly.rolloverCap,
      }
    }
    if (plan.annual.priceId === priceId) {
      return {
        planId: planId as PlanId,
        interval: 'year',
        rolloverCap: plan.annual.rolloverCap,
      }
    }
  }
  return null
}

// Keep existing credit pack config unchanged
export const CREDIT_PACKS = {
  single: {
    name: '1 Credit',
    credits: 1,
    priceId: process.env.STRIPE_PRICE_SINGLE_CREDIT || '',
    requiresSubscription: false,
  },
  small: {
    name: '5 Credits',
    credits: 5,
    priceId: process.env.STRIPE_PRICE_CREDITS_SMALL || '',
    requiresSubscription: true,
  },
  medium: {
    name: '10 Credits',
    credits: 10,
    priceId: process.env.STRIPE_PRICE_CREDITS_MEDIUM || '',
    requiresSubscription: true,
  },
  large: {
    name: '20 Credits',
    credits: 20,
    priceId: process.env.STRIPE_PRICE_CREDITS_LARGE || '',
    requiresSubscription: true,
  },
} as const

export type CreditPackId = keyof typeof CREDIT_PACKS

// Helper to get credit pack by price ID
export function getCreditPackByPriceId(priceId: string): CreditPackId | null {
  for (const [packId, pack] of Object.entries(CREDIT_PACKS)) {
    if (pack.priceId === priceId) {
      return packId as CreditPackId
    }
  }
  return null
}
```

**Step 2: Add annual price IDs to .env.example**

Modify `.env.example`, add after existing Stripe price IDs:

```bash
# Stripe Price IDs - Create products in Stripe Dashboard
# Test mode: https://dashboard.stripe.com/test/products
# Live mode: https://dashboard.stripe.com/products
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_...
STRIPE_PRICE_SINGLE_CREDIT=price_...
STRIPE_PRICE_CREDITS_SMALL=price_...
STRIPE_PRICE_CREDITS_MEDIUM=price_...
STRIPE_PRICE_CREDITS_LARGE=price_...
```

**Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

**Step 4: Commit**

```bash
git add lib/stripe/config.ts .env.example
git commit -m "feat(stripe): add annual pricing configuration

- Restructure PLANS with monthly/annual nested objects
- Add rolloverCap field for credit rollover limits
- Update getPlanByPriceId to return interval and rollover cap
- Add annual price ID env vars to .env.example"
```

---

## Task 3: Update Webhook - Checkout Completed Handler

**Files:**
- Modify: `app/api/webhooks/stripe/route.ts:103-231`

**Step 1: Update handleCheckoutCompleted function**

In `app/api/webhooks/stripe/route.ts`, replace the `handleCheckoutCompleted` function:

```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('Stripe webhook: No user_id in checkout session metadata')
    return
  }

  // Handle subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id

    // Get subscription details from Stripe with expanded data
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price', 'default_payment_method']
    }) as Stripe.Subscription

    // Access period dates via type assertion
    const subWithPeriod = subscription as Stripe.Subscription & {
      current_period_start?: number
      current_period_end?: number
    }

    const priceId = subscription.items.data[0]?.price.id
    const planData = priceId ? getPlanByPriceId(priceId) : null
    const plan = planData ? PLANS[planData.planId] : null

    if (!plan || !planData) {
      console.error('Stripe webhook: Unknown price ID', { priceId })
      return
    }

    // Check if user already has a subscription
    const { data: existingSub, error: checkError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Stripe webhook: Error checking subscription', { userId })
      throw checkError
    }

    if (existingSub) {
      // Update existing subscription
      const periodStart = subWithPeriod.current_period_start || subscription.created
      const periodEnd = subWithPeriod.current_period_end || (subscription.created + 30 * 24 * 60 * 60)

      const { error: updateError } = await getSupabaseAdmin()
        .from('subscriptions')
        .update({
          plan: planData.planId,
          billing_interval: planData.interval,
          rollover_cap: planData.rolloverCap,
          status: 'active',
          credits_remaining: plan.credits,
          credits_total: plan.credits,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          current_period_start: new Date(periodStart * 1000).toISOString(),
          current_period_end: new Date(periodEnd * 1000).toISOString(),
        })
        .eq('id', existingSub.id)

      if (updateError) {
        console.error('Stripe webhook: Error updating subscription', { userId })
        throw updateError
      }

      // Log credit grant
      const { error: txError } = await getSupabaseAdmin().from('credit_transactions').insert({
        user_id: userId,
        subscription_id: existingSub.id,
        amount: plan.credits,
        type: 'subscription',
        description: `${plan.name} plan subscription activated (${planData.interval === 'year' ? 'annual' : 'monthly'})`,
      })

      if (txError) {
        console.error('Stripe webhook: Error logging transaction', { userId })
        throw txError
      }
    } else {
      // Create new subscription
      const periodStart = subWithPeriod.current_period_start || subscription.created
      const periodEnd = subWithPeriod.current_period_end || (subscription.created + 30 * 24 * 60 * 60)

      const { data: newSub, error: insertError } = await getSupabaseAdmin()
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: planData.planId,
          billing_interval: planData.interval,
          rollover_cap: planData.rolloverCap,
          status: 'active',
          credits_remaining: plan.credits,
          credits_total: plan.credits,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          current_period_start: new Date(periodStart * 1000).toISOString(),
          current_period_end: new Date(periodEnd * 1000).toISOString(),
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Stripe webhook: Error creating subscription', { userId })
        throw insertError
      }

      if (newSub) {
        // Log credit grant
        const { error: txError } = await getSupabaseAdmin().from('credit_transactions').insert({
          user_id: userId,
          subscription_id: newSub.id,
          amount: plan.credits,
          type: 'subscription',
          description: `${plan.name} plan subscription started (${planData.interval === 'year' ? 'annual' : 'monthly'})`,
        })

        if (txError) {
          console.error('Stripe webhook: Error logging transaction', { userId })
          throw txError
        }
      }
    }
  }

  // Handle one-time credit pack purchase (keep existing logic unchanged)
  if (session.mode === 'payment') {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const priceId = lineItems.data[0]?.price?.id
    const packId = priceId ? getCreditPackByPriceId(priceId) : null
    const pack = packId ? CREDIT_PACKS[packId] : null

    if (!pack) {
      console.error('Stripe webhook: Unknown credit pack price ID', { priceId })
      return
    }

    // Get user's subscription (or create one for single credit purchases)
    const { data: sub, error: subError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Stripe webhook: Error fetching subscription', { userId })
      throw subError
    }

    let subscriptionId = sub?.id

    // If no subscription exists and this is a single credit purchase, create a credits-only record
    if (!sub && !pack.requiresSubscription) {
      const { data: newSub, error: insertError } = await getSupabaseAdmin()
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: 'starter',
          billing_interval: 'month',
          rollover_cap: 0,
          status: 'cancelled',
          credits_remaining: 0,
          credits_total: 0,
          overage_credits: 0,
          stripe_customer_id: session.customer as string,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Stripe webhook: Error creating credits-only subscription', { userId })
        throw insertError
      }

      subscriptionId = newSub?.id
    }

    if (subscriptionId) {
      // Add overage credits using RPC function for atomic increment
      const { error: rpcError } = await getSupabaseAdmin().rpc('add_overage_credits', {
        p_subscription_id: subscriptionId,
        p_credits: pack.credits,
      })

      if (rpcError) {
        console.error('Stripe webhook: Error adding overage credits', { userId })
        throw rpcError
      }

      // Log credit grant
      const { error: txError } = await getSupabaseAdmin().from('credit_transactions').insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount: pack.credits,
        type: 'purchase',
        description: `Purchased ${pack.name} credit pack`,
      })

      if (txError) {
        console.error('Stripe webhook: Error logging transaction', { userId })
        throw txError
      }
    } else {
      console.error('Stripe webhook: No subscription ID available for credit pack', { userId })
    }
  }
}
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat(webhook): support annual billing in checkout handler

- Set billing_interval and rollover_cap on subscription creation
- Use getPlanByPriceId to get interval and rollover data
- Add interval to transaction description for clarity"
```

---

## Task 4: Update Webhook - Payment Succeeded Handler (Rollover Logic)

**Files:**
- Modify: `app/api/webhooks/stripe/route.ts:357-407`

**Step 1: Replace handlePaymentSucceeded with rollover logic**

In `app/api/webhooks/stripe/route.ts`, replace the `handlePaymentSucceeded` function:

```typescript
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Only reset credits for subscription renewals (not initial purchase)
  if (invoice.billing_reason !== 'subscription_cycle') {
    return
  }

  const subscriptionId = typeof (invoice as any).subscription === 'string'
    ? (invoice as any).subscription
    : (invoice as any).subscription?.id

  if (!subscriptionId) return

  // Get subscription from Stripe to find plan
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price']
  }) as any
  const priceId = subscription.items.data[0]?.price.id
  const planData = priceId ? getPlanByPriceId(priceId) : null
  const plan = planData ? PLANS[planData.planId] : null

  if (!plan || !planData) return

  // Get our subscription record
  const { data: sub } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('id, user_id, credits_remaining, rollover_cap, billing_interval')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!sub) return

  // Calculate rollover (capped)
  const unused = sub.credits_remaining
  const rollover = Math.min(unused, sub.rollover_cap)
  const expired = unused - rollover
  const newBalance = plan.credits + rollover

  // Update subscription credits
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      credits_remaining: newBalance,
      credits_total: plan.credits,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', sub.id)

  // Log expired credits if any
  if (expired > 0) {
    await getSupabaseAdmin().from('credit_transactions').insert({
      user_id: sub.user_id,
      subscription_id: sub.id,
      amount: -expired,
      type: 'expiry',
      description: `${expired} credit${expired > 1 ? 's' : ''} expired (rollover cap: ${sub.rollover_cap})`,
    })
  }

  // Log rolled over credits if any
  if (rollover > 0) {
    await getSupabaseAdmin().from('credit_transactions').insert({
      user_id: sub.user_id,
      subscription_id: sub.id,
      amount: rollover,
      type: 'bonus',
      description: `${rollover} credit${rollover > 1 ? 's' : ''} rolled over from previous period`,
    })
  }

  // Log renewal credit grant
  await getSupabaseAdmin().from('credit_transactions').insert({
    user_id: sub.user_id,
    subscription_id: sub.id,
    amount: plan.credits,
    type: 'subscription',
    description: `${plan.name} plan renewed - ${plan.credits} credits granted (${sub.billing_interval === 'year' ? 'annual' : 'monthly'})`,
  })
}
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat(webhook): implement credit rollover logic

- Calculate rollover based on rollover_cap
- Log expired credits beyond cap
- Log rolled over credits as 'bonus' type
- Apply rollover on monthly credit grants for annual plans"
```

---

## Task 5: Update Webhook - Subscription Updated Handler

**Files:**
- Modify: `app/api/webhooks/stripe/route.ts:314-348`

**Step 1: Update handleSubscriptionUpdated for interval changes**

In `app/api/webhooks/stripe/route.ts`, replace the `handleSubscriptionUpdated` function:

```typescript
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Access period dates via type assertion
  const subWithPeriod = subscription as Stripe.Subscription & {
    current_period_start?: number
    current_period_end?: number
  }

  const priceId = subscription.items.data[0]?.price.id
  const planData = priceId ? getPlanByPriceId(priceId) : null
  const plan = planData ? PLANS[planData.planId] : null

  // Use fallback for period dates
  const periodStart = subWithPeriod.current_period_start || subscription.created
  const periodEnd = subWithPeriod.current_period_end || (subscription.created + 30 * 24 * 60 * 60)

  const updateData: any = {
    status: subscription.status === 'active' ? 'active' :
            subscription.status === 'past_due' ? 'past_due' :
            subscription.status === 'canceled' ? 'cancelled' : 'active',
    current_period_start: new Date(periodStart * 1000).toISOString(),
    current_period_end: new Date(periodEnd * 1000).toISOString(),
  }

  // Update plan, interval, rollover, and reset credits if plan changed
  if (planData && plan) {
    updateData.plan = planData.planId
    updateData.billing_interval = planData.interval
    updateData.rollover_cap = planData.rolloverCap
    updateData.credits_remaining = plan.credits
    updateData.credits_total = plan.credits
  }

  await getSupabaseAdmin()
    .from('subscriptions')
    .update(updateData)
    .eq('stripe_subscription_id', subscription.id)
}
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat(webhook): handle interval changes in subscription updates

- Update billing_interval and rollover_cap on plan changes
- Reset credits when switching between monthly/annual
- Support monthly → annual upgrades via Stripe"
```

---

## Task 6: Create Pricing Page with Toggle

**Files:**
- Create: `app/(routes)/pricing/page.tsx`

**Step 1: Create pricing page component**

Create file `app/(routes)/pricing/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { PLANS } from '@/lib/stripe/config'

export default function PricingPage() {
  const [interval, setInterval] = useState<'month' | 'year'>('month')

  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Choose the plan that fits your needs
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
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
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <PlanCard
          planId="starter"
          interval={interval}
        />
        <PlanCard
          planId="professional"
          interval={interval}
        />
      </div>
    </div>
  )
}

interface PlanCardProps {
  planId: 'starter' | 'professional'
  interval: 'month' | 'year'
}

function PlanCard({ planId, interval }: PlanCardProps) {
  const plan = PLANS[planId]
  const pricing = interval === 'month' ? plan.monthly : plan.annual

  const handleSubscribe = async () => {
    // TODO: Implement checkout flow in next task
    console.log('Subscribe to', planId, interval)
  }

  return (
    <Card className={planId === 'professional' ? 'border-primary shadow-lg' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          {planId === 'professional' && (
            <Badge>Popular</Badge>
          )}
        </div>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">${pricing.price}</span>
          <span className="text-muted-foreground">
            /{interval === 'month' ? 'month' : 'year'}
          </span>
        </div>
        {interval === 'year' && (
          <p className="text-sm text-muted-foreground mt-2">
            ${pricing.price / 12}/month billed annually
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Button className="w-full mb-6" onClick={handleSubscribe}>
          Get Started
        </Button>

        <ul className="space-y-3">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          {interval === 'year' && pricing.rolloverCap > 0 && (
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">
                Up to {pricing.rolloverCap} credits roll over monthly
              </span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify page builds**

Run:
```bash
npm run build
```

Expected: Build succeeds, pricing page renders without errors.

**Step 3: Test in browser**

Start dev server:
```bash
npm run dev
```

Navigate to `http://localhost:3000/pricing`

Expected: Toggle switches between monthly/annual, prices update, rollover badge shows on annual.

**Step 4: Commit**

```bash
git add app/(routes)/pricing/page.tsx
git commit -m "feat(ui): create pricing page with billing toggle

- Add monthly/annual toggle switch
- Display plan cards with interval-based pricing
- Show rollover cap on annual plans
- Add 'Save 17%' badge for annual billing"
```

---

## Task 7: Create Checkout API Endpoint

**Files:**
- Create: `app/api/checkout/route.ts`

**Step 1: Create checkout API route**

Create file `app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanId, type BillingInterval } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  try {
    const { plan, interval } = await req.json() as {
      plan: PlanId
      interval: BillingInterval
    }

    // Validate input
    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (interval !== 'month' && interval !== 'year') {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get price ID for plan and interval
    const pricing = interval === 'month' ? PLANS[plan].monthly : PLANS[plan].annual
    const priceId = pricing.priceId

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this plan/interval' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        user_id: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

**Step 2: Update pricing page to use checkout API**

Modify `app/(routes)/pricing/page.tsx`, update the `handleSubscribe` function:

```typescript
const handleSubscribe = async () => {
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: planId, interval }),
    })

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('Checkout error:', data.error)
      alert('Failed to start checkout. Please try again.')
    }
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Failed to start checkout. Please try again.')
  }
}
```

**Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

**Step 4: Test checkout flow (requires Stripe test mode)**

1. Start dev server: `npm run dev`
2. Navigate to `/pricing`
3. Toggle to annual
4. Click "Get Started" (will redirect to Stripe test checkout)

Expected: Redirects to Stripe checkout with correct price.

**Step 5: Commit**

```bash
git add app/api/checkout/route.ts app/(routes)/pricing/page.tsx
git commit -m "feat(checkout): add checkout API for annual/monthly plans

- Create /api/checkout endpoint accepting plan and interval
- Pass plan and interval to Stripe checkout session
- Update pricing page to call checkout API
- Add success/cancel redirect URLs"
```

---

## Task 8: Create Billing Settings - Upgrade to Annual

**Files:**
- Create: `app/api/billing/upgrade-to-annual/route.ts`
- Modify: `app/(routes)/billing/page.tsx` (if exists, otherwise skip)

**Step 1: Create upgrade API endpoint**

Create file `app/api/billing/upgrade-to-annual/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanId } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (subError || !sub) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    // Check if already annual
    if (sub.billing_interval === 'year') {
      return NextResponse.json(
        { error: 'Subscription is already annual' },
        { status: 400 }
      )
    }

    // Get annual price for current plan
    const plan = PLANS[sub.plan as PlanId]
    const annualPriceId = plan.annual.priceId

    if (!annualPriceId) {
      return NextResponse.json(
        { error: 'Annual pricing not configured for this plan' },
        { status: 500 }
      )
    }

    // Get Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      sub.stripe_subscription_id
    )

    // Update to annual price (Stripe handles proration)
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: annualPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })

    // Webhook will update our database

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upgrade to annual error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade subscription' },
      { status: 500 }
    )
  }
}
```

**Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

**Step 3: Test upgrade flow (optional - requires existing monthly subscription)**

1. Create a test monthly subscription
2. Call POST `/api/billing/upgrade-to-annual`
3. Check Stripe dashboard for proration invoice
4. Verify webhook updates billing_interval in database

Expected: Subscription upgraded, prorated invoice created, database updated.

**Step 4: Commit**

```bash
git add app/api/billing/upgrade-to-annual/route.ts
git commit -m "feat(billing): add upgrade to annual API endpoint

- Create /api/billing/upgrade-to-annual endpoint
- Validate user has monthly subscription
- Update Stripe subscription to annual price with proration
- Return success for webhook to handle DB updates"
```

---

## Task 9: Update Environment Variables Documentation

**Files:**
- Modify: `.env.example`

**Step 1: Add instructions for annual price IDs**

This was already done in Task 2, but verify it's complete. The `.env.example` should have:

```bash
# Stripe Price IDs - Create products in Stripe Dashboard
# Test mode: https://dashboard.stripe.com/test/products
# Live mode: https://dashboard.stripe.com/products
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...         # NEW
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_...    # NEW
STRIPE_PRICE_SINGLE_CREDIT=price_...
STRIPE_PRICE_CREDITS_SMALL=price_...
STRIPE_PRICE_CREDITS_MEDIUM=price_...
STRIPE_PRICE_CREDITS_LARGE=price_...
```

**Step 2: Add note about creating annual prices in Stripe**

Add comment block before Stripe section in `.env.example`:

```bash
# Stripe - Get from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs - Create products in Stripe Dashboard
# Test mode: https://dashboard.stripe.com/test/products
# Live mode: https://dashboard.stripe.com/products
#
# To create annual prices:
# 1. Go to Products in Stripe Dashboard
# 2. Select "Starter" or "Professional" product
# 3. Click "Add another price"
# 4. Set billing period to "Yearly"
# 5. Set price to $300 (Starter) or $750 (Professional)
# 6. Copy the price ID (starts with price_...)
# 7. Add to .env.local as STRIPE_PRICE_STARTER_ANNUAL or STRIPE_PRICE_PROFESSIONAL_ANNUAL
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_...
STRIPE_PRICE_SINGLE_CREDIT=price_...
STRIPE_PRICE_CREDITS_SMALL=price_...
STRIPE_PRICE_CREDITS_MEDIUM=price_...
STRIPE_PRICE_CREDITS_LARGE=price_...
```

**Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: add instructions for creating annual Stripe prices

- Add comments on how to create annual prices in Stripe
- Document both test and live mode setup"
```

---

## Task 10: Testing & Verification

**Files:**
- None (manual testing)

**Step 1: Verify database migration**

Run migration locally (if using Supabase CLI):
```bash
supabase db reset
```

Or apply manually via Supabase SQL editor.

Verify schema:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name IN ('billing_interval', 'rollover_cap');
```

Expected: Both columns exist with correct types and defaults.

**Step 2: Test webhook with Stripe CLI**

Install Stripe CLI: https://stripe.com/docs/stripe-cli

Forward webhooks to local:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Trigger checkout.session.completed:
```bash
stripe trigger checkout.session.completed
```

Expected: Webhook processes successfully, subscription created with billing_interval and rollover_cap.

**Step 3: Test rollover logic manually**

1. Create a test annual subscription in Supabase
2. Set `credits_remaining` to 12, `rollover_cap` to 3
3. Trigger `invoice.payment_succeeded` webhook
4. Check `credits_remaining` updated to 13 (10 new + 3 rollover)
5. Check `credit_transactions` for expiry and rollover entries

Expected: Rollover logic applies correctly, transactions logged.

**Step 4: Test pricing page**

1. Start dev server: `npm run dev`
2. Navigate to `/pricing`
3. Toggle between monthly/annual
4. Verify prices update correctly
5. Verify "Save 17%" badge shows on annual
6. Verify rollover text shows on annual plans

Expected: UI updates correctly, no console errors.

**Step 5: Test checkout flow (end-to-end)**

1. Create test annual price in Stripe ($300 for Starter Annual)
2. Add price ID to `.env.local`
3. Click "Get Started" on annual Starter plan
4. Complete test checkout in Stripe
5. Verify webhook creates subscription with:
   - `billing_interval: 'year'`
   - `rollover_cap: 3`
   - `credits_remaining: 10`

Expected: Full checkout → webhook → database flow works.

**Step 6: Document test results**

Create a test summary file (optional):

```bash
echo "## Annual Subscription Pricing - Test Results

### Database Migration
- ✅ billing_interval column added
- ✅ rollover_cap column added
- ✅ Constraints and defaults working

### Webhook Handlers
- ✅ Checkout completed sets billing_interval and rollover_cap
- ✅ Payment succeeded applies rollover logic
- ✅ Subscription updated handles interval changes

### API Endpoints
- ✅ /api/checkout accepts plan and interval
- ✅ /api/billing/upgrade-to-annual upgrades monthly → annual

### UI Components
- ✅ Pricing page toggle works
- ✅ Prices update correctly
- ✅ Rollover badge shows on annual

### End-to-End Flow
- ✅ Annual checkout → subscription creation works
- ✅ Monthly credit grants apply rollover
- ✅ Expired credits logged correctly
" > docs/plans/2026-02-09-annual-pricing-test-results.md
```

**Step 7: Commit test results (optional)**

```bash
git add docs/plans/2026-02-09-annual-pricing-test-results.md
git commit -m "docs: add annual pricing test results"
```

---

## Task 11: Final Build & Deployment Prep

**Files:**
- None (verification only)

**Step 1: Run full production build**

```bash
npm run build
```

Expected: Build completes successfully with no errors.

**Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

**Step 3: Run linter**

```bash
npm run lint
```

Expected: No linting errors (or only warnings).

**Step 4: Create deployment checklist**

Create file `docs/plans/2026-02-09-annual-pricing-deployment-checklist.md`:

```markdown
# Annual Pricing Deployment Checklist

## Pre-Deployment

- [ ] Create annual prices in Stripe **live mode**
  - [ ] Starter Annual: $300/year (recurring yearly)
  - [ ] Professional Annual: $750/year (recurring yearly)
- [ ] Add live price IDs to production environment variables
  - [ ] `STRIPE_PRICE_STARTER_ANNUAL=price_...`
  - [ ] `STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_...`
- [ ] Test webhook signature with production webhook secret
- [ ] Verify Stripe webhook endpoint configured: `/api/webhooks/stripe`

## Database Migration

- [ ] Run migration in production: `00010_add_annual_billing_support.sql`
- [ ] Verify columns added:
  ```sql
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'subscriptions'
    AND column_name IN ('billing_interval', 'rollover_cap');
  ```
- [ ] Verify existing subscriptions backfilled with defaults

## Deployment

- [ ] Deploy code to production (Vercel/hosting platform)
- [ ] Verify pricing page accessible: `/pricing`
- [ ] Verify checkout API working: `/api/checkout`
- [ ] Verify upgrade API working: `/api/billing/upgrade-to-annual`

## Post-Deployment Testing

- [ ] Test annual checkout flow (use Stripe test mode first)
- [ ] Verify webhook processes annual subscription correctly
- [ ] Check database for correct `billing_interval` and `rollover_cap`
- [ ] Test monthly credit grant (trigger webhook manually if needed)
- [ ] Verify rollover logic applies correctly
- [ ] Test monthly → annual upgrade flow

## Monitoring

- [ ] Monitor webhook logs for errors
- [ ] Monitor Stripe dashboard for successful payments
- [ ] Check Supabase logs for database errors
- [ ] Verify credit transactions logged correctly

## Rollback Plan

If issues occur:
1. Disable annual prices in Stripe (archive them)
2. Remove annual price IDs from environment variables
3. Revert code deployment if necessary
4. Database migration can stay (billing_interval defaults to 'month')
```

**Step 5: Commit deployment checklist**

```bash
git add docs/plans/2026-02-09-annual-pricing-deployment-checklist.md
git commit -m "docs: add deployment checklist for annual pricing

- Stripe live mode setup steps
- Database migration verification
- Post-deployment testing plan
- Rollback procedure"
```

**Step 6: Create summary commit**

```bash
git commit --allow-empty -m "feat: complete annual subscription pricing implementation

Summary of changes:
- Database: Added billing_interval and rollover_cap columns
- Stripe Config: Restructured PLANS with monthly/annual pricing
- Webhooks: Implemented rollover logic for annual plans
- API: Added checkout and upgrade-to-annual endpoints
- UI: Created pricing page with billing toggle
- Docs: Added deployment checklist and test results

Closes: Annual subscription pricing feature
Ready for: Testing and deployment"
```

---

## Post-Implementation Steps

After completing all tasks:

1. **Create Pull Request** (if using GitHub):
   ```bash
   git push origin feature/annual-subscription-pricing
   ```
   Then create PR from `feature/annual-subscription-pricing` → `main`

2. **Code Review**:
   - **REQUIRED SUB-SKILL:** Use superpowers:requesting-code-review after pushing
   - Have another developer review the implementation
   - Address feedback and push updates

3. **Stripe Setup**:
   - Create annual prices in Stripe test mode
   - Test full checkout flow
   - Create annual prices in Stripe live mode
   - Add live price IDs to production env vars

4. **Deployment**:
   - Follow deployment checklist
   - Monitor webhook logs
   - Test end-to-end flow in production

5. **Cleanup**:
   - **REQUIRED SUB-SKILL:** Use superpowers:finishing-a-development-branch
   - Merge PR to main
   - Delete feature branch
   - Remove worktree

---

## Dependencies & Prerequisites

**Required:**
- Stripe account with test mode enabled
- Supabase project with database access
- Environment variables configured in `.env.local`

**Optional:**
- Stripe CLI for webhook testing
- Supabase CLI for local database

**External Services:**
- Stripe API (for payments)
- Supabase (for database)

---

## Estimated Time

- Task 1 (Database): 15 minutes
- Task 2 (Config): 20 minutes
- Task 3 (Checkout Webhook): 25 minutes
- Task 4 (Payment Webhook): 30 minutes
- Task 5 (Update Webhook): 15 minutes
- Task 6 (Pricing Page): 45 minutes
- Task 7 (Checkout API): 25 minutes
- Task 8 (Upgrade API): 20 minutes
- Task 9 (Env Docs): 10 minutes
- Task 10 (Testing): 60 minutes
- Task 11 (Build): 20 minutes

**Total:** ~4.5 hours

---

## Success Criteria

- [ ] Database migration runs successfully
- [ ] Annual prices configured in Stripe config
- [ ] Webhooks handle annual subscriptions correctly
- [ ] Rollover logic applies on monthly credit grants
- [ ] Pricing page toggle works correctly
- [ ] Checkout flow creates annual subscriptions
- [ ] Upgrade API switches monthly → annual
- [ ] Full production build succeeds
- [ ] End-to-end test passes
- [ ] Deployment checklist ready
