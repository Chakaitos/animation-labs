import { NextResponse } from 'next/server'
import Stripe from 'stripe'

/**
 * Stripe Health Check Endpoint
 *
 * Verifies Stripe API key is valid by making a lightweight API call.
 * Returns 200 OK if Stripe is accessible, 503 if connection fails.
 *
 * Used for monitoring Stripe integration and deployment validation.
 */
export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Stripe secret key not configured',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    // Initialize Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })

    // Make a lightweight API call to verify credentials
    // Retrieve account info (minimal overhead)
    const account = await stripe.accounts.retrieve()

    // Check if we're in test mode or live mode
    const mode = stripeSecretKey.startsWith('sk_test_') ? 'test' : 'live'

    return NextResponse.json(
      {
        status: 'ok',
        stripe: 'connected',
        mode,
        accountId: account.id,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Stripe health check failed:', error)

    // Stripe errors have a specific structure
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Stripe API error',
          error: error.message,
          type: error.type,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Unexpected error during Stripe health check',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
