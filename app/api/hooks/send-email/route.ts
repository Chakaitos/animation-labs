import { NextRequest, NextResponse } from 'next/server'
import * as jose from 'jose'

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

    if (!authHeader) {
      console.error('Send Email Hook: No authorization header')
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      )
    }

    // Extract JWT from "Bearer <token>" format
    const token = authHeader.replace('Bearer ', '')

    if (!token) {
      console.error('Send Email Hook: No token in authorization header')
      return NextResponse.json(
        { error: 'No token in authorization header' },
        { status: 401 }
      )
    }

    // Verify JWT using webhook secret
    try {
      const secret = new TextEncoder().encode(webhookSecret)
      const { payload } = await jose.jwtVerify(token, secret, {
        issuer: 'supabase',
      })

      console.log('Send Email Hook: JWT verified successfully', {
        iss: payload.iss,
        exp: payload.exp,
      })
    } catch (jwtError) {
      console.error('Send Email Hook: JWT verification failed', {
        error: jwtError instanceof Error ? jwtError.message : 'Unknown error',
      })
      return NextResponse.json(
        { error: 'Invalid JWT token' },
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
