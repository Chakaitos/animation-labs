# Phase 3: Subscription & Credits - Research

**Researched:** 2026-01-28
**Domain:** Stripe subscription billing, credit systems, payment webhooks
**Confidence:** HIGH

## Summary

Phase 3 implements subscription management and credit tracking using Stripe for payments and Supabase for credit ledger. The research reveals a mature, well-documented ecosystem with established patterns for Next.js 15+ App Router integration.

**Key findings:**
- Stripe provides comprehensive subscription APIs with built-in lifecycle management (upgrade, downgrade, cancel)
- Next.js App Router patterns favor Server Actions for payment flows and Route Handlers for webhooks
- The existing database schema (from Phase 1) already implements credit system with SECURITY DEFINER functions
- Webhook signature verification requires raw request body handling - critical gotcha in Next.js
- Idempotency protection is essential to prevent duplicate credit grants from webhook retries

**Primary recommendation:** Use Stripe Checkout Sessions for payment collection, Server Actions for subscription management, Stripe Customer Portal for self-service, and dedicated webhook route handler with signature verification for syncing subscription state to Supabase.

## Standard Stack

The established libraries/tools for Stripe + Next.js + Supabase:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe | ^17.x | Stripe API client (Node.js) | Official SDK, supports all Stripe features |
| @stripe/stripe-js | ^5.x | Stripe.js loader (browser) | Official browser SDK for Checkout redirect |
| next | 16.x | Full-stack framework | App Router with Server Actions eliminates ~60% API boilerplate |
| @supabase/supabase-js | Latest | Supabase client | Database + Auth integration |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | ^3.x | Schema validation | Already in project (D-02-01-001), use for webhook payloads |
| sonner | Latest | Toast notifications | Already in project (D-02-01-002), use for payment errors |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Stripe Checkout | Stripe Elements | Elements = custom UI control, more code. Checkout = hosted page, faster implementation, better UX |
| Customer Portal | Custom dashboard | Custom = full control but weeks of work. Portal = Stripe-hosted, instant, handles edge cases |
| Server Actions | API Routes | Routes = traditional pattern. Actions = 60% less code, type-safe, no client-side API calls |

**Installation:**
```bash
npm install stripe @stripe/stripe-js
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── actions/
│   ├── checkout.ts           # Create Checkout Sessions (Server Action)
│   ├── subscriptions.ts      # Manage subscriptions (Server Action)
│   └── customer-portal.ts    # Create portal sessions (Server Action)
├── api/
│   └── webhooks/
│       └── stripe/
│           └── route.ts      # Webhook handler (Route Handler)
└── (routes)/
    ├── subscribe/
    │   └── page.tsx          # Plan selection page
    ├── billing/
    │   └── page.tsx          # Current plan + portal button
    └── dashboard/
        └── page.tsx          # Show credit balance

lib/
├── stripe/
│   ├── config.ts             # Products, prices, plans config
│   └── client.ts             # Stripe server-side client
└── supabase/
    ├── server.ts             # Already exists
    └── client.ts             # Already exists

supabase/
└── migrations/
    └── 00002_stripe_columns.sql  # Add Stripe-specific columns if needed
```

### Pattern 1: Checkout Flow (Server Action)
**What:** User selects plan → Server Action creates Stripe Checkout Session → Redirect to Stripe
**When to use:** Any subscription purchase or credit pack purchase
**Example:**
```typescript
// app/actions/checkout.ts
'use server'

import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createCheckoutSession(priceId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const session = await stripe.checkout.sessions.create({
    customer: subscription?.stripe_customer_id,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe`,
    metadata: {
      user_id: user.id, // Critical: enables webhook to identify user
    },
  })

  redirect(session.url!)
}
```
**Source:** [Stripe Checkout Sessions API](https://docs.stripe.com/api/checkout/sessions/create), verified in [Pedro Alonso's 2025 Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)

### Pattern 2: Webhook Handler (Route Handler)
**What:** Stripe sends events → Verify signature → Update Supabase → Return 200
**When to use:** All subscription lifecycle events (created, updated, deleted, payment_succeeded, etc.)
**Example:**
```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// CRITICAL: Use service role key for webhook (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // NOT anon key
)

export async function POST(req: NextRequest) {
  const body = await req.text() // MUST use .text(), not .json()
  const signature = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check
  const { data: existing } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true }) // Already processed
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.user_id

      // Grant subscription credits
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan: session.metadata?.plan,
        status: 'active',
        credits_remaining: 10, // Based on plan
        credits_total: 10,
      })
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id)
      break
    }
  }

  // Log event to prevent duplicate processing
  await supabase.from('webhook_events').insert({
    stripe_event_id: event.id,
    type: event.type,
    processed_at: new Date().toISOString(),
  })

  return NextResponse.json({ received: true })
}
```
**Source:** [Stripe Webhooks Documentation](https://docs.stripe.com/webhooks), [Next.js webhook patterns](https://dev.to/thekarlesi/how-to-handle-stripe-and-paystack-webhooks-in-nextjs-the-app-router-way-5bgi)

### Pattern 3: Customer Portal (Server Action)
**What:** Create portal session → Redirect to Stripe-hosted page for subscription management
**When to use:** User wants to change plan, update payment method, view invoices, cancel
**Example:**
```typescript
// app/actions/customer-portal.ts
'use server'

import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createPortalSession() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    throw new Error('No subscription found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing`,
  })

  redirect(session.url)
}
```
**Source:** [Stripe Customer Portal Integration](https://docs.stripe.com/customer-management/integrate-customer-portal)

### Pattern 4: Credit System with Subscription
**What:** Track subscription credits (reset monthly) vs overage credits (persist)
**When to use:** AnimateLabs credit-based billing model
**Database approach:**
```sql
-- Already implemented in 00001_initial_schema.sql
-- subscriptions.credits_remaining: Current available credits
-- subscriptions.credits_total: Total credits allocated this period
-- credit_transactions: Immutable audit trail

-- Optional enhancement: Separate overage credits
ALTER TABLE subscriptions
ADD COLUMN overage_credits INT NOT NULL DEFAULT 0;

-- Deduct order: overage first, then subscription
-- Update deduct_credits() function to:
-- 1. Check overage_credits first
-- 2. If insufficient, use credits_remaining
-- 3. Log source in credit_transactions.description
```
**Source:** [Credit system patterns](https://flexprice.io/blog/how-to-implement-credit-system-in-subscription-model), [Stripe credits documentation](https://docs.stripe.com/billing/subscriptions/usage-based/use-cases/credits-based-pricing-model)

### Anti-Patterns to Avoid
- **Client-side pricing:** Never trust price from client; always use server-validated price IDs
- **Webhook without signature verification:** Security vulnerability - anyone can POST to your endpoint
- **Synchronous webhook processing:** Return 200 immediately, process async to avoid timeouts
- **Manual subscription updates:** Let webhooks be the source of truth, not success page redirects
- **Mixing test/live mode secrets:** Different webhook secrets for test vs live - keep separate

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Subscription management UI | Custom dashboard for plan changes | Stripe Customer Portal | Handles edge cases: failed payments, dunning, proration, tax, invoices. Free, maintained by Stripe. |
| Payment form | Custom card input with Stripe Elements | Stripe Checkout | PCI compliance, fraud detection, 3D Secure, multiple payment methods, localization all built-in. |
| Proration calculation | Manual credit calculation for upgrades/downgrades | Stripe automatic proration | Handles edge cases: mid-cycle changes, partial refunds, timezone issues. |
| Invoice generation | Custom PDF invoices | Stripe Invoices | Legal compliance, tax calculations, multi-currency, automatic email delivery. |
| Failed payment retry logic | Custom retry scheduler | Stripe Smart Retries | Machine learning optimizes retry timing based on card type, failure reason, historical data. |
| Credit expiration | Cron job to expire credits | Database triggers with timestamp checks | Atomic, transactional, no race conditions. Already have deduct_credits() and grant_credits() SECURITY DEFINER functions. |

**Key insight:** Stripe handles payment complexity; focus on business logic (credit tracking, video workflow) not payment infrastructure.

## Common Pitfalls

### Pitfall 1: Webhook Signature Verification Fails in Production
**What goes wrong:** Webhooks work locally with Stripe CLI but fail in production with "signature verification failed" error.

**Why it happens:**
- Next.js automatically parses request body as JSON before route handler runs
- Stripe requires raw request body (string/Buffer) for signature calculation
- Test vs Live mode webhook secret mismatch
- Middleware intercepts request and mutates body

**How to avoid:**
- Use `await req.text()` not `await req.json()` in webhook route handler
- Verify webhook secret environment variable matches test/live mode
- Check `.env.local` vs production env vars align with Stripe Dashboard mode
- Disable body parsing middleware for webhook routes

**Warning signs:**
- Webhook events show "failed" in Stripe Dashboard
- Error logs: "No signatures found matching the expected signature"
- Works with Stripe CLI locally but fails on Vercel/production

**Source:** [Debugging Stripe webhook signature errors](https://dev.to/nerdincode/debugging-stripe-webhook-signature-verification-errors-in-production-1h7c), [Stripe signature verification docs](https://docs.stripe.com/webhooks/signature)

### Pitfall 2: Race Conditions in Credit Deduction
**What goes wrong:** User creates multiple videos simultaneously → credits deducted incorrectly → negative balance or over-deduction.

**Why it happens:**
- Two requests read `credits_remaining: 10` at same time
- Both pass validation (10 >= 1)
- Both deduct 1 credit
- Final balance could be 8 instead of 9 (lost credit) or race condition allows overdraft

**How to avoid:**
- Use `FOR UPDATE` row-level locking in `deduct_credits()` function (already implemented in schema)
- PostgreSQL transaction isolation ensures atomic read-modify-write
- Server-side validation only - never trust client credit checks
- Single source of truth: SECURITY DEFINER function bypasses RLS, prevents user manipulation

**Warning signs:**
- Credit balance doesn't match transaction history sum
- Users report "missing" credits
- Negative credit balances appear

**Verification:**
```sql
-- Already implemented in 00001_initial_schema.sql:
SELECT id, credits_remaining
FROM subscriptions
WHERE user_id = p_user_id
FOR UPDATE; -- Locks row until transaction completes
```

**Source:** [Database race condition prevention](https://sqlfordevs.com/transaction-locking-prevent-race-condition), [PostgreSQL locking](https://medium.com/@doniantoro34/how-to-prevent-race-conditions-in-database-3aac965bf47b)

### Pitfall 3: Duplicate Webhook Processing (Idempotency)
**What goes wrong:** Stripe sends same webhook multiple times (network retry) → credits granted twice → financial loss.

**Why it happens:**
- Network timeout causes Stripe to retry webhook
- Webhook handler doesn't check if event already processed
- Slow database operation causes timeout before 200 response sent

**How to avoid:**
- Store processed event IDs in database before processing
- Check `stripe_event_id` exists before handling event
- Return 200 immediately, process async if needed
- Use unique constraints on critical tables (e.g., `UNIQUE(stripe_subscription_id)`)

**Warning signs:**
- Duplicate credit_transactions entries with same timestamp
- Users report "extra" credits
- Stripe Dashboard shows repeated webhook attempts

**Implementation:**
```sql
-- Add webhook events tracking table
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX webhook_events_stripe_id_idx ON webhook_events(stripe_event_id);
```

**Source:** [Stripe idempotency documentation](https://docs.stripe.com/api/idempotent_requests), [Webhook best practices](https://docs.stripe.com/webhooks)

### Pitfall 4: Test Mode Products Don't Exist in Live Mode
**What goes wrong:** Checkout works in development but fails in production with "Invalid price ID" error.

**Why it happens:**
- Products and Prices created in Stripe Test mode
- Production uses Live mode with different API keys
- Live mode has empty product catalog
- Code references test mode price IDs

**How to avoid:**
- Create separate products/prices in Stripe Dashboard for Test and Live modes
- Use environment variables for price IDs: `PRICE_ID_STARTER_TEST` vs `PRICE_ID_STARTER_LIVE`
- Document which Stripe objects need Live mode creation
- Check Stripe Dashboard mode toggle before launch

**Warning signs:**
- Checkout redirects fail with "resource not found"
- Webhooks don't fire in production
- Customer Portal shows empty subscription list

**Source:** [Stripe test vs live mode differences](https://docs.stripe.com/testing-use-cases), [Test mode gotchas](https://www.tier.run/blog/the-5-gotchas-of-stripe-test-mode)

### Pitfall 5: Metadata vs client_reference_id Confusion
**What goes wrong:** User ID not found in webhook event → can't attribute subscription to user.

**Why it happens:**
- Metadata gets attached to wrong Stripe object (Session vs Subscription)
- Webhook event data structure varies by event type
- Metadata string length limits (500 chars) exceeded
- Forgot to include metadata in checkout session creation

**How to avoid:**
- Always include `metadata: { user_id }` in checkout session
- Use both `metadata` and `client_reference_id` for redundancy
- Extract user_id from `session.metadata` in `checkout.session.completed` event
- Store Stripe customer_id → user_id mapping in database

**Warning signs:**
- Subscriptions created but not linked to users
- Users can't access their subscription
- Orphaned Stripe customers

**Source:** [Stripe metadata documentation](https://docs.stripe.com/metadata), [Metadata vs client_reference_id](https://docs.stripe.com/api/checkout/sessions/object)

### Pitfall 6: Forgetting Customer Portal Configuration
**What goes wrong:** Customer Portal redirect succeeds but user sees "No features enabled" error.

**Why it happens:**
- Stripe Customer Portal requires configuration in Dashboard
- Features (cancel subscription, update payment method) must be explicitly enabled
- Test mode and Live mode have separate portal configurations
- Forgot to set allowed products for switching plans

**How to avoid:**
- Configure portal in Stripe Dashboard → Settings → Billing → Customer Portal
- Enable: Cancel subscriptions, Update payment methods, View invoice history
- Add products for plan switching if allowing upgrades/downgrades
- Test portal in both modes before launch

**Warning signs:**
- Portal redirects to blank page
- Users can't cancel subscriptions
- "Configure your portal" error message

**Source:** [Configure Customer Portal](https://docs.stripe.com/customer-management/configure-portal)

## Code Examples

Verified patterns from official sources:

### Subscription Upgrade (Immediate with Proration)
```typescript
// app/actions/subscriptions.ts
'use server'

import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'

export async function upgradeSubscription(newPriceId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Get current subscription
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.stripe_subscription_id) {
    throw new Error('No active subscription')
  }

  // Get current subscription items from Stripe
  const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)

  // Update subscription - proration happens automatically
  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'always_invoice', // Immediate charge for prorated amount
  })

  // Webhook will update database
  return { success: true }
}
```
**Source:** [Stripe upgrade/downgrade docs](https://docs.stripe.com/billing/subscriptions/upgrade-downgrade)

### Subscription Downgrade (End of Period)
```typescript
// app/actions/subscriptions.ts
'use server'

import { stripe } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'

export async function downgradeSubscription(newPriceId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.stripe_subscription_id) {
    throw new Error('No active subscription')
  }

  const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)

  // Use subscription schedule for end-of-period change
  await stripe.subscriptionSchedules.create({
    from_subscription: sub.stripe_subscription_id,
    phases: [
      {
        items: subscription.items.data.map(item => ({
          price: item.price.id,
          quantity: item.quantity,
        })),
        start_date: subscription.current_period_start,
        end_date: subscription.current_period_end,
      },
      {
        items: [{ price: newPriceId, quantity: 1 }],
        start_date: subscription.current_period_end,
        // No end_date = continues indefinitely
      },
    ],
  })

  return { success: true, effectiveDate: subscription.current_period_end }
}
```
**Source:** [Subscription schedules](https://docs.stripe.com/billing/subscriptions/subscription-schedules)

### Check Credit Balance Before Video Creation
```typescript
// app/actions/videos.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'

export async function checkCreditsBeforeCreate() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Use SECURITY DEFINER function from schema
  const { data, error } = await supabase.rpc('check_credits', {
    p_user_id: user.id,
    p_required: 1,
  })

  if (error) throw error

  return { hasCredits: data } // boolean
}

export async function deductCreditsForVideo(videoId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Atomic deduction with FOR UPDATE lock
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: user.id,
    p_video_id: videoId,
    p_credits: 1,
    p_description: 'Video creation',
  })

  if (error || !data) {
    throw new Error('Insufficient credits')
  }

  return { success: true }
}
```
**Source:** Already implemented in `/supabase/migrations/00001_initial_schema.sql`

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API Routes for everything | Server Actions for mutations, Route Handlers for webhooks | Next.js 13+ (2023) | 60% less boilerplate, type-safe, no client API calls |
| Custom payment UI with Elements | Stripe Checkout for most use cases | 2022-present | Faster implementation, better conversion, built-in compliance |
| Manual proration calculation | Stripe automatic proration | Always available | Eliminates edge case bugs, handles timezone/currency complexity |
| Cron-based subscription renewal | Webhook-driven updates | Best practice since 2020 | Real-time sync, no polling, Stripe is source of truth |
| Optimistic locking (version field) | Pessimistic locking (FOR UPDATE) | Best practice for payments | Prevents race conditions at database level, simpler code |

**Deprecated/outdated:**
- **Charges API:** Deprecated in favor of PaymentIntents API (2019). Use PaymentIntents for all new integrations.
- **Sources API:** Deprecated in favor of PaymentMethods API (2020). Use PaymentMethods for saving cards.
- **Bitcoin payments:** Stripe discontinued Bitcoin support (2018). No cryptocurrency options.

## Open Questions

Things that couldn't be fully resolved:

1. **Overage credit persistence across subscription cancellation**
   - What we know: Hybrid models common (subscription + overage credits)
   - What's unclear: Best practice for handling overage credits when user cancels subscription
   - Recommendation: Allow overage credits to persist (user paid for them), separate from subscription renewal. Add `overage_credits` column to track separately.

2. **Credit reset timing on subscription renewal**
   - What we know: Stripe fires `invoice.payment_succeeded` on renewal
   - What's unclear: Should credits reset before or after payment succeeds? What if payment fails?
   - Recommendation: Reset credits in `invoice.payment_succeeded` webhook, not `customer.subscription.updated`. Ensures payment succeeded before granting credits.

3. **Proration edge case: Downgrade then immediate upgrade**
   - What we know: Subscription schedules handle end-of-period downgrades
   - What's unclear: If user downgrades (scheduled for end of period) then upgrades before period ends, does schedule cancel correctly?
   - Recommendation: Test this edge case thoroughly. May need to release schedule before creating new one.

## Sources

### Primary (HIGH confidence)
- [Stripe Subscriptions Overview](https://docs.stripe.com/billing/subscriptions/overview) - Core subscription concepts
- [Stripe Webhook Events](https://docs.stripe.com/billing/subscriptions/webhooks) - Essential webhook events
- [Stripe Upgrade/Downgrade](https://docs.stripe.com/billing/subscriptions/upgrade-downgrade) - Subscription change patterns
- [Stripe Credit-Based Pricing](https://docs.stripe.com/billing/subscriptions/usage-based/use-cases/credits-based-pricing-model) - Credit system architecture
- [Stripe Customer Portal Integration](https://docs.stripe.com/customer-management/integrate-customer-portal) - Portal implementation
- [Stripe Webhook Signature Verification](https://docs.stripe.com/webhooks/signature) - Security verification
- [Stripe Idempotency](https://docs.stripe.com/api/idempotent_requests) - Duplicate event handling

### Secondary (MEDIUM confidence - verified with official sources)
- [Pedro Alonso: Stripe + Next.js 15 Complete Guide 2025](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) - October 2025, comprehensive patterns
- [DEV Community: Stripe Integration Guide for Next.js 15 + Supabase](https://dev.to/flnzba/33-stripe-integration-guide-for-nextjs-15-with-supabase-13b5) - April 2025, database integration
- [DEV Community: Stripe Webhooks in Next.js App Router](https://dev.to/thekarlesi/how-to-handle-stripe-and-paystack-webhooks-in-nextjs-the-app-router-way-5bgi) - 2026, webhook patterns
- [Medium: Stripe Checkout and Webhook in Next.js 15](https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e) - November 2024, implementation guide

### Tertiary (LOW confidence - marked for validation)
- [FlexPrice: Credit System Implementation](https://flexprice.io/blog/how-to-implement-credit-system-in-subscription-model) - Credit architecture patterns
- [SQLForDevs: Transaction Locking](https://sqlfordevs.com/transaction-locking-prevent-race-condition) - Race condition prevention
- [DEV Community: Debugging Webhook Signatures](https://dev.to/nerdincode/debugging-stripe-webhook-signature-verification-errors-in-production-1h7c) - Production troubleshooting

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Stripe SDK, established Next.js patterns, verified with Context7
- Architecture: HIGH - Patterns verified in official Stripe docs and recent (2025-2026) community guides
- Pitfalls: MEDIUM-HIGH - Mix of official docs (HIGH) and community experiences (MEDIUM), all cross-referenced

**Research date:** 2026-01-28
**Valid until:** 2026-03-28 (60 days - stable payment infrastructure, slow-moving changes)

**Notes:**
- Existing database schema already implements credit system with SECURITY DEFINER functions
- No CONTEXT.md constraints - full research freedom
- Next.js 16 compatible (uses same App Router patterns as Next.js 15)
- Stripe API version-agnostic (using latest SDK handles API versioning automatically)
