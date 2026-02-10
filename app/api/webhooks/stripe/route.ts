import { stripe } from '@/lib/stripe/client'
import { PLANS, getPlanByPriceId, getCreditPackByPriceId, CREDIT_PACKS } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { sendPaymentFailedEmail } from '@/lib/email/send'

// Create Supabase client with service role - lazy init to avoid build errors
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables not set')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text() // CRITICAL: Must use .text(), not .json()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing Stripe signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Use preview webhook secret if available (for preview deployments)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_PREVIEW || process.env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check - prevent duplicate processing
  const { data: existing } = await getSupabaseAdmin()
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existing) {
    return NextResponse.json({ received: true })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        // Silently ignore unhandled event types
    }

    // Log event to prevent duplicate processing
    await getSupabaseAdmin().from('webhook_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error)
    // Return 500 so Stripe will retry
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}

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

    // Access period dates via type assertion (runtime property exists but TypeScript doesn't know)
    const subWithPeriod = subscription as Stripe.Subscription & {
      current_period_start?: number
      current_period_end?: number
    }

    const priceId = subscription.items.data[0]?.price.id
    const planData = priceId ? getPlanByPriceId(priceId) : null
    const plan = planData ? PLANS[planData.planId] : null

    if (!plan || !planData) {
      // Debug: Log configured price IDs
      console.error('Stripe webhook: Unknown price ID', {
        receivedPriceId: priceId,
        configuredPriceIds: {
          starter_monthly: PLANS.starter.monthly.priceId,
          starter_annual: PLANS.starter.annual.priceId,
          professional_monthly: PLANS.professional.monthly.priceId,
          professional_annual: PLANS.professional.annual.priceId,
        }
      })
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

      // Use created timestamp as fallback for period dates (they'll be updated by invoice.payment_succeeded)
      const periodStart = subWithPeriod.current_period_start || subscription.created
      const periodEnd = subWithPeriod.current_period_end || (subscription.created + 30 * 24 * 60 * 60) // 30 days

      const { error: updateError } = await getSupabaseAdmin()
        .from('subscriptions')
        .update({
          plan: planData.planId,
          status: 'active',
          credits_remaining: plan.credits,
          credits_total: plan.credits,
          billing_interval: planData.interval,
          rollover_cap: planData.rolloverCap,
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
        description: `${plan.name} plan (${planData.interval === 'year' ? 'annual' : 'monthly'}) subscription activated`,
      })

      if (txError) {
        console.error('Stripe webhook: Error logging transaction', { userId })
        throw txError
      }
    } else {
      // Create new subscription

      // Use created timestamp as fallback for period dates (they'll be updated by invoice.payment_succeeded)
      const periodStart = subWithPeriod.current_period_start || subscription.created
      const periodEnd = subWithPeriod.current_period_end || (subscription.created + 30 * 24 * 60 * 60) // 30 days

      const { data: newSub, error: insertError } = await getSupabaseAdmin()
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: planData.planId,
          status: 'active',
          credits_remaining: plan.credits,
          credits_total: plan.credits,
          billing_interval: planData.interval,
          rollover_cap: planData.rolloverCap,
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
          description: `${plan.name} plan (${planData.interval === 'year' ? 'annual' : 'monthly'}) subscription started`,
        })

        if (txError) {
          console.error('Stripe webhook: Error logging transaction', { userId })
          throw txError
        }
      }
    }
  }

  // Handle one-time credit pack purchase
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
          plan: 'starter', // Default to starter for credits-only accounts
          status: 'cancelled', // No active subscription - using 'cancelled' for credits-only state
          credits_remaining: 0,
          credits_total: 0,
          overage_credits: 0,
          billing_interval: 'month',
          rollover_cap: 0,
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

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Access period dates via type assertion (runtime property exists but TypeScript doesn't know)
  const subWithPeriod = subscription as Stripe.Subscription & {
    current_period_start?: number
    current_period_end?: number
  }

  const priceId = subscription.items.data[0]?.price.id
  const planData = priceId ? getPlanByPriceId(priceId) : null
  const plan = planData ? PLANS[planData.planId] : null

  // Use fallback for period dates (same as checkout handler)
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

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id)
}

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

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === 'string'
    ? (invoice as any).subscription
    : (invoice as any).subscription?.id

  if (!subscriptionId) return

  // Update subscription status
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)

  // Get subscription details for email
  const { data: sub } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('id, user_id, plan')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (sub) {
    // Get plan name for email
    const planId = sub.plan as keyof typeof PLANS
    const plan = PLANS[planId]
    const planName = plan?.name || 'your subscription'

    // Get amount due (convert cents to dollars)
    const amountDue = (invoice.amount_due || 0) / 100

    // Get retry URL (Stripe hosted invoice page)
    const retryUrl = invoice.hosted_invoice_url || 'https://animationlabs.com/billing'

    // Send email (fire-and-forget)
    sendPaymentFailedEmail(
      sub.user_id,
      planName,
      amountDue,
      retryUrl
    ).catch(err => {
      console.error('Stripe webhook: Payment failed email error', { subscriptionId })
    })
  }
}
