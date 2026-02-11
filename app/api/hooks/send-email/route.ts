import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Send Email Hook
 *
 * This hook intercepts Supabase's auth emails and suppresses them.
 * We send our own custom branded emails via Resend instead.
 *
 * Webhook is called for: signup confirmation, password reset, invite, etc.
 *
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET

    // Check if secret is configured
    if (!webhookSecret) {
      console.error('Send Email Hook: SUPABASE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Verify webhook secret (format: "Bearer <secret>")
    const expectedSecret = `Bearer ${webhookSecret}`

    if (!authHeader) {
      console.error('Send Email Hook: No authorization header')
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    if (authHeader !== expectedSecret) {
      console.error('Send Email Hook: Invalid webhook secret', {
        receivedPrefix: authHeader.substring(0, 10),
        expectedPrefix: expectedSecret.substring(0, 10),
      })
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      )
    }

    const payload = await request.json()

    // Log for debugging
    console.log('Send Email Hook: Authenticated successfully', {
      emailType: payload.email_action_type,
      recipientDomain: payload.user?.email?.split('@')[1],
      timestamp: new Date().toISOString(),
    })

    // Return 200 OK to acknowledge receipt
    // By not actually sending the email here, we suppress Supabase's default emails
    // Our custom emails are sent from lib/actions/auth.ts instead
    return NextResponse.json({
      success: true,
      message: 'Email suppressed - custom email sent via Resend instead',
    })
  } catch (error) {
    console.error('Send Email Hook: Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    // Return 200 even on error to prevent Supabase from retrying
    return NextResponse.json({ success: true })
  }
}
