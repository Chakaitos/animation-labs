import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Send Email Hook
 *
 * Intercepts Supabase auth emails and suppresses them.
 * We send custom branded emails via Resend instead.
 *
 * Verifies HMAC-SHA256 signature sent by Supabase in x-hook-signature header.
 *
 * @see https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook
 */

// Toggle for debugging (set to true to bypass verification temporarily)
const DEBUG_MODE = false

/**
 * Extract base64 key from Supabase dashboard secret
 * Dashboard provides: "v1,whsec_<base64>" or "v1,<base64>"
 */
function extractKeyFromSecret(secretStr: string): string {
  const part = secretStr.split(',')[1] ?? secretStr
  return part.replace(/^whsec_/, '')
}

/**
 * Verify HMAC-SHA256 signature from Supabase
 */
async function verifySignature(
  rawBody: ArrayBuffer,
  signatureHeader: string,
  secretStr: string
): Promise<boolean> {
  try {
    // Extract signature from header (format: "v1,<base64sig>" or "v1,whsec_<base64sig>")
    const headerSig = signatureHeader.split(',')[1] ?? signatureHeader
    const sigBase64 = headerSig.replace(/^whsec_/, '')

    // Extract and decode the secret key
    const keyBase64 = extractKeyFromSecret(secretStr)
    const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0))

    // Import key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Decode signature
    const sigBytes = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0))

    // Verify signature
    return await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, rawBody)
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.error('Send Email Hook: SUPABASE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Log all headers for debugging
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    console.log('Send Email Hook: Headers received:', {
      headerKeys: Object.keys(headers),
      timestamp: new Date().toISOString(),
    })

    // Look for signature in multiple possible header names
    const signatureHeader =
      request.headers.get('x-hook-signature') ||
      request.headers.get('x-signature') ||
      request.headers.get('authorization')

    if (!signatureHeader && !DEBUG_MODE) {
      console.error('Send Email Hook: No signature header found', {
        availableHeaders: Object.keys(headers),
      })
      return NextResponse.json(
        { error: 'No signature header' },
        { status: 401 }
      )
    }

    // Get raw request body for signature verification
    const rawBody = await request.arrayBuffer()

    // Verify signature (unless in debug mode)
    if (!DEBUG_MODE && signatureHeader) {
      const isValid = await verifySignature(rawBody, signatureHeader, webhookSecret)

      if (!isValid) {
        console.error('Send Email Hook: Invalid signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }

      console.log('Send Email Hook: Signature verified successfully ✅')
    } else if (DEBUG_MODE) {
      console.log('Send Email Hook: DEBUG_MODE - skipping verification')
    }

    // Parse payload
    const payload = JSON.parse(new TextDecoder().decode(new Uint8Array(rawBody)))

    console.log('Send Email Hook: Request authenticated', {
      emailType: payload.email_action_type,
      recipientDomain: payload.user?.email?.split('@')[1],
      timestamp: new Date().toISOString(),
    })

    // Return 200 OK to suppress Supabase's default emails
    // Our custom emails are sent from lib/actions/auth.ts instead
    return NextResponse.json({
      success: true,
      message: 'Email suppressed - custom email sent via Resend instead',
    })
  } catch (error) {
    console.error('Send Email Hook: Unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    // Return 200 to prevent Supabase from retrying
    return NextResponse.json({ success: true })
  }
}
