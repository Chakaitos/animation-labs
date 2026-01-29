import { stripe } from '@/lib/stripe/client'
import { PLANS, getPlanByPriceId, getCreditPackByPriceId, CREDIT_PACKS } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

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

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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
    console.log(`Event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true })
  }

  console.log(`Processing webhook: ${event.type} (${event.id})`)

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
        console.log(`Unhandled event type: ${event.type}`)
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
    console.error('No user_id in checkout session metadata')
    return
  }

  console.log(`[handleCheckoutCompleted] Processing for user: ${userId}, mode: ${session.mode}`)

  // Handle subscription checkout
  if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id

    // Get subscription details from Stripe
    console.log(`[handleCheckoutCompleted] Retrieving subscription: ${subscriptionId}`)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price']
    }) as any
    const priceId = subscription.items.data[0]?.price.id
    console.log(`[handleCheckoutCompleted] Price ID: ${priceId}`)
    const planId = priceId ? getPlanByPriceId(priceId) : null
    const plan = planId ? PLANS[planId] : null

    if (!plan || !planId) {
      console.error('Unknown price ID:', priceId)
      console.error('Available price IDs:', Object.values(PLANS).map(p => p.priceId))
      return
    }

    console.log(`[handleCheckoutCompleted] Plan matched: ${planId}`)

    // Check if user already has a subscription
    console.log(`[handleCheckoutCompleted] Checking for existing subscription`)
    const { data: existingSub, error: checkError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[handleCheckoutCompleted] Error checking subscription:', checkError)
      throw checkError
    }

    console.log(`[handleCheckoutCompleted] Existing sub:`, existingSub ? 'found' : 'none')

    if (existingSub) {
      // Update existing subscription
      console.log(`[handleCheckoutCompleted] Updating existing subscription`)
      const { error: updateError } = await getSupabaseAdmin()
        .from('subscriptions')
        .update({
          plan: planId,
          status: 'active',
          credits_remaining: plan.credits,
          credits_total: plan.credits,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', existingSub.id)

      if (updateError) {
        console.error('[handleCheckoutCompleted] Error updating subscription:', updateError)
        throw updateError
      }

      // Log credit grant
      console.log(`[handleCheckoutCompleted] Logging credit transaction`)
      const { error: txError } = await getSupabaseAdmin().from('credit_transactions').insert({
        user_id: userId,
        subscription_id: existingSub.id,
        amount: plan.credits,
        type: 'subscription',
        description: `${plan.name} plan subscription activated`,
      })

      if (txError) {
        console.error('[handleCheckoutCompleted] Error logging transaction:', txError)
        throw txError
      }
    } else {
      // Create new subscription
      console.log(`[handleCheckoutCompleted] Creating new subscription`)
      const { data: newSub, error: insertError } = await getSupabaseAdmin()
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: planId,
          status: 'active',
          credits_remaining: plan.credits,
          credits_total: plan.credits,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('[handleCheckoutCompleted] Error creating subscription:', insertError)
        throw insertError
      }

      console.log(`[handleCheckoutCompleted] Subscription created:`, newSub?.id)

      if (newSub) {
        // Log credit grant
        console.log(`[handleCheckoutCompleted] Logging credit transaction`)
        const { error: txError } = await getSupabaseAdmin().from('credit_transactions').insert({
          user_id: userId,
          subscription_id: newSub.id,
          amount: plan.credits,
          type: 'subscription',
          description: `${plan.name} plan subscription started`,
        })

        if (txError) {
          console.error('[handleCheckoutCompleted] Error logging transaction:', txError)
          throw txError
        }
      }
    }

    console.log(`[handleCheckoutCompleted] SUCCESS: Subscription created for user ${userId}: ${planId} (${plan.credits} credits)`)
  }

  // Handle one-time credit pack purchase
  if (session.mode === 'payment') {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const priceId = lineItems.data[0]?.price?.id
    const packId = priceId ? getCreditPackByPriceId(priceId) : null
    const pack = packId ? CREDIT_PACKS[packId] : null

    if (pack) {
      // Get user's subscription (or create one for single credit purchases)
      const { data: sub } = await getSupabaseAdmin()
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single()

      let subscriptionId = sub?.id

      // If no subscription exists and this is a single credit purchase, create a credits-only record
      if (!sub && !pack.requiresSubscription) {
        const { data: newSub } = await getSupabaseAdmin()
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan: 'starter', // Default to starter for credits-only accounts
            status: 'inactive', // No active subscription, just credits
            credits_remaining: 0,
            credits_total: 0,
            overage_credits: 0,
            stripe_customer_id: session.customer as string,
          })
          .select('id')
          .single()

        subscriptionId = newSub?.id
      }

      if (subscriptionId) {
        // Add overage credits using RPC function for atomic increment
        await getSupabaseAdmin().rpc('add_overage_credits', {
          p_subscription_id: subscriptionId,
          p_credits: pack.credits,
        })

        // Log credit grant
        await getSupabaseAdmin().from('credit_transactions').insert({
          user_id: userId,
          subscription_id: subscriptionId,
          amount: pack.credits,
          type: 'purchase',
          description: `Purchased ${pack.name} credit pack`,
        })

        console.log(`Credit pack purchased for user ${userId}: ${pack.credits} credits`)
      }
    }
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const sub = subscription as any
  const priceId = sub.items.data[0]?.price.id
  const planId = priceId ? getPlanByPriceId(priceId) : null

  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      status: sub.status === 'active' ? 'active' :
              sub.status === 'past_due' ? 'past_due' :
              sub.status === 'canceled' ? 'cancelled' : 'active',
      plan: planId || undefined,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', sub.id)

  console.log(`Subscription updated: ${sub.id} -> ${sub.status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id)

  console.log(`Subscription cancelled: ${subscription.id}`)
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
  const planId = priceId ? getPlanByPriceId(priceId) : null
  const plan = planId ? PLANS[planId] : null

  if (!plan) return

  // Get our subscription record
  const { data: sub } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!sub) return

  // Reset subscription credits (overage credits persist)
  await getSupabaseAdmin()
    .from('subscriptions')
    .update({
      credits_remaining: plan.credits,
      credits_total: plan.credits,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', sub.id)

  // Log renewal
  await getSupabaseAdmin().from('credit_transactions').insert({
    user_id: sub.user_id,
    subscription_id: sub.id,
    amount: plan.credits,
    type: 'subscription',
    description: `${plan.name} plan renewed - credits reset`,
  })

  console.log(`Subscription renewed: ${subscriptionId} (${plan.credits} credits reset)`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = typeof (invoice as any).subscription === 'string'
    ? (invoice as any).subscription
    : (invoice as any).subscription?.id

  if (!subscriptionId) return

  await getSupabaseAdmin()
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)

  console.log(`Payment failed for subscription: ${subscriptionId}`)
}
