'use server'

import { stripe } from '@/lib/stripe/client'
import { PLANS, CREDIT_PACKS, type PlanId, type CreditPackId } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Helper to get site URL for redirects (same pattern as auth.ts)
async function getSiteUrl() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}`
}

export async function createSubscriptionCheckout(planId: PlanId) {
  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?next=/subscribe')
  }

  const plan = PLANS[planId]
  if (!plan || !plan.monthly.priceId) {
    return { error: 'Invalid plan selected' }
  }

  // Check if user already has a subscription
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, status, stripe_subscription_id')
    .eq('user_id', user.id)
    .single()

  // Prevent creating duplicate subscriptions - redirect to billing portal instead
  if (existingSub?.stripe_subscription_id && existingSub.status === 'active') {
    return {
      error: 'You already have an active subscription. Please use the billing portal to change your plan.',
      redirectTo: '/billing'
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: existingSub?.stripe_customer_id || undefined,
      customer_email: existingSub?.stripe_customer_id ? undefined : user.email,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.monthly.priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/subscribe?checkout=cancelled`,
      metadata: {
        user_id: user.id, // Critical: enables webhook to identify user
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
    })

    if (!session.url) {
      return { error: 'Failed to create checkout session' }
    }

    redirect(session.url)
  } catch (error) {
    // Re-throw redirect errors (Next.js navigation)
    if (error instanceof Error && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Checkout session error:', error)
    return { error: 'Failed to create checkout session. Please try again.' }
  }
}

export async function createCreditPackCheckout(packId: CreditPackId) {
  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?next=/billing')
  }

  const pack = CREDIT_PACKS[packId]
  if (!pack || !pack.priceId) {
    return { error: 'Invalid credit pack selected' }
  }

  // Check if pack requires subscription (all except 'single')
  if (pack.requiresSubscription) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return { error: 'You must have an active subscription to purchase credit packs' }
    }
  }

  // Get existing customer ID if available (for any user)
  const { data: existingCustomer } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  try {
    const session = await stripe.checkout.sessions.create({
      customer: existingCustomer?.stripe_customer_id || undefined,
      customer_email: existingCustomer?.stripe_customer_id ? undefined : user.email,
      mode: 'payment', // One-time payment for credit pack
      payment_method_types: ['card'],
      line_items: [
        {
          price: pack.priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/billing?checkout=success&credits=${pack.credits}`,
      cancel_url: `${siteUrl}/billing?checkout=cancelled`,
      metadata: {
        user_id: user.id,
        pack_id: packId,
        credits: pack.credits.toString(),
      },
    })

    if (!session.url) {
      return { error: 'Failed to create checkout session' }
    }

    redirect(session.url)
  } catch (error) {
    // Re-throw redirect errors (Next.js navigation)
    if (error instanceof Error && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Credit pack checkout error:', error)
    return { error: 'Failed to create checkout session. Please try again.' }
  }
}
