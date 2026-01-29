'use server'

import { stripe } from '@/lib/stripe/client'
import { PLANS, type PlanId } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// Helper to get site URL for redirects
async function getSiteUrl() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}`
}

// Create Stripe Customer Portal session for subscription management
export async function createPortalSession() {
  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!subscription?.stripe_customer_id) {
    return { error: 'No subscription found. Please subscribe first.' }
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/billing`,
    })

    redirect(session.url)
  } catch (error) {
    // Re-throw redirect errors (Next.js navigation)
    if (error instanceof Error && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    console.error('Portal session error:', error)
    return { error: 'Failed to open billing portal. Please try again.' }
  }
}

// Get user's current subscription details
export async function getSubscription() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching subscription:', error)
    return { error: 'Failed to fetch subscription' }
  }

  if (!subscription) {
    return { subscription: null }
  }

  // Get plan details
  const plan = PLANS[subscription.plan as PlanId]

  return {
    subscription: {
      id: subscription.id,
      plan: subscription.plan as PlanId,
      planName: plan?.name || subscription.plan,
      planFeatures: plan?.features || [],
      status: subscription.status,
      creditsRemaining: subscription.credits_remaining,
      creditsTotal: subscription.credits_total,
      overageCredits: subscription.overage_credits || 0,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
    },
  }
}

// Get user's credit balance (total available)
export async function getCreditBalance() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('credits_remaining, overage_credits, status')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching credits:', error)
    return { error: 'Failed to fetch credit balance' }
  }

  if (!subscription) {
    return {
      balance: {
        subscription: 0,
        overage: 0,
        total: 0,
      },
    }
  }

  return {
    balance: {
      subscription: subscription.credits_remaining || 0,
      overage: subscription.overage_credits || 0,
      total: (subscription.credits_remaining || 0) + (subscription.overage_credits || 0),
    },
  }
}

// Get credit transaction history
export async function getCreditHistory(limit = 20) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: transactions, error } = await supabase
    .from('credit_transactions')
    .select('id, amount, type, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching credit history:', error)
    return { error: 'Failed to fetch credit history' }
  }

  return { transactions: transactions || [] }
}
