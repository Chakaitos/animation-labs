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
