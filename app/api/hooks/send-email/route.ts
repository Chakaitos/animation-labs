'use server'

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
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = `Bearer ${process.env.SUPABASE_WEBHOOK_SECRET}`

    if (authHeader !== expectedSecret) {
      console.error('Send Email Hook: Invalid webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()

    // Log for debugging (remove in production or be careful with PII)
    console.log('Send Email Hook called:', {
      emailType: payload.email_action_type,
      recipient: payload.user?.email,
      timestamp: new Date().toISOString(),
    })

    // Return 200 OK to acknowledge receipt
    // By not actually sending the email here, we suppress Supabase's default emails
    // Our custom emails are sent from lib/actions/auth.ts instead
    return NextResponse.json({
      success: true,
      message: 'Email suppressed - custom email sent via Resend instead'
    })

  } catch (error) {
    console.error('Send Email Hook error:', error)
    // Return 200 even on error to prevent Supabase from retrying
    return NextResponse.json({ success: true })
  }
}
