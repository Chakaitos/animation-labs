import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanId } from '@/lib/stripe/config'

export async function POST() {
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
