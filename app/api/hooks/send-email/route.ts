import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Send Email Hook - DISABLED/DEBUG MODE
 *
 * Currently just logs requests and returns success.
 * Authentication is disabled until we debug the header issue.
 *
 * To use: Disable this hook in Supabase Dashboard for now.
 * We send custom emails via Resend from lib/actions/auth.ts instead.
 *
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */
export async function POST(request: NextRequest) {
  try {
    // Log all headers for debugging
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    console.log('Send Email Hook called:', {
      headers,
      url: request.url,
      timestamp: new Date().toISOString(),
    })

    const payload = await request.json()

    console.log('Send Email Hook payload:', {
      emailType: payload.email_action_type,
      hasUser: !!payload.user,
      timestamp: new Date().toISOString(),
    })

    // Return success without authentication (for debugging)
    // This allows us to see what Supabase is actually sending
    return NextResponse.json({
      success: true,
      message: 'Email hook called (auth disabled for debugging)',
    })
  } catch (error) {
    console.error('Send Email Hook error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json({ success: true })
  }
}
