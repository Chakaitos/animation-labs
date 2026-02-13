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

/**
 * Verify Svix webhook signature (used by Supabase)
 *
 * Svix signature format:
 * - Header: webhook-signature: "v1,<base64sig1> v1,<base64sig2>"
 * - Signed message: "${webhook-id}.${webhook-timestamp}.${body}"
 * - Algorithm: HMAC-SHA256
 */
async function verifySvixSignature(
  rawBody: ArrayBuffer,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string,
  secretStr: string
): Promise<boolean> {
  try {
    // Extract secret - format: "v1,whsec_<base64>" or "whsec_<base64>" or plain hex
    let secretWithoutPrefix = secretStr
      .replace(/^v1,/, '')        // Remove version prefix
      .replace(/^whsec_/, '')     // Remove whsec_ prefix

    // Determine if secret is hex or base64
    const isHex = /^[0-9a-f]+$/i.test(secretWithoutPrefix)

    let secretBuffer: ArrayBuffer
    if (isHex) {
      // Convert hex string to bytes (for user-generated secrets)
      const bytes = secretWithoutPrefix.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []
      secretBuffer = new Uint8Array(bytes).buffer
    } else {
      // Base64 decode (for Supabase-generated secrets)
      const bytes = Uint8Array.from(atob(secretWithoutPrefix), (c) => c.charCodeAt(0))
      secretBuffer = bytes.buffer
    }

    // Svix sends multiple signatures (v1,sig1 v1,sig2)
    // We need to verify against at least one
    const signatures = webhookSignature.split(' ')

    // Build the signed message: "${id}.${timestamp}.${body}"
    const bodyText = new TextDecoder().decode(rawBody)
    const signedMessage = `${webhookId}.${webhookTimestamp}.${bodyText}`

    // Encode message
    const encoder = new TextEncoder()
    const messageBytes = encoder.encode(signedMessage)

    // Import secret as crypto key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Compute expected signature
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes)
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))

    // Check if any provided signature matches
    for (const sig of signatures) {
      // Format: "v1,<base64>"
      const [version, providedSig] = sig.split(',')
      if (version !== 'v1') continue

      if (providedSig === expectedSig) {
        return true
      }
    }

    console.error('Signature mismatch:', {
      expected: expectedSig.substring(0, 20) + '...',
      received: signatures[0]?.split(',')[1]?.substring(0, 20) + '...',
    })
    return false
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

    // Get Svix webhook headers (used by Supabase)
    const webhookId = request.headers.get('webhook-id')
    const webhookTimestamp = request.headers.get('webhook-timestamp')
    const webhookSignature = request.headers.get('webhook-signature')

    if (!webhookId || !webhookTimestamp || !webhookSignature) {
      console.error('Send Email Hook: Missing Svix headers', {
        hasId: !!webhookId,
        hasTimestamp: !!webhookTimestamp,
        hasSignature: !!webhookSignature,
      })
      return NextResponse.json(
        { error: 'Missing webhook headers' },
        { status: 401 }
      )
    }

    // Get raw request body for signature verification
    const rawBody = await request.arrayBuffer()

    // Verify Svix signature
    const isValid = await verifySvixSignature(
      rawBody,
      webhookId,
      webhookTimestamp,
      webhookSignature,
      webhookSecret
    )

    if (!isValid) {
      console.error('Send Email Hook: Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

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
