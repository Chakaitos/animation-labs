import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanId, type BillingInterval } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  try {
    const { plan, interval, promoCode } = await req.json() as {
      plan: PlanId
      interval: BillingInterval
      promoCode?: string
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

    // Prepare checkout session config
    const sessionConfig: Record<string, unknown> = {
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
    }

    // Handle promo code: either pre-apply it OR enable Stripe's promo field
    // Note: Can't use both allow_promotion_codes and discounts at the same time
    if (promoCode && promoCode.trim()) {
      try {
        const promoCodes = await stripe.promotionCodes.list({
          code: promoCode.trim().toUpperCase(),
          active: true,
          limit: 1,
        })

        if (promoCodes.data.length > 0) {
          // Valid code found - pre-apply it (don't set allow_promotion_codes)
          sessionConfig.discounts = [{
            promotion_code: promoCodes.data[0].id,
          }]
        } else {
          // Invalid code - still enable Stripe's field so user can try again
          sessionConfig.allow_promotion_codes = true
        }
      } catch (err) {
        console.error('Error validating promo code:', err)
        // On error, enable Stripe's field so user can enter code there
        sessionConfig.allow_promotion_codes = true
      }
    } else {
      // No code provided - enable Stripe's promo code field
      sessionConfig.allow_promotion_codes = true
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
