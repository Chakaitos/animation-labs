import { NextResponse } from 'next/server'

/**
 * n8n Health Check Endpoint
 *
 * Verifies n8n webhook configuration is present.
 * Optionally tests webhook endpoint accessibility.
 *
 * Returns 200 OK if n8n is configured, 503 if configuration is missing.
 *
 * Used for monitoring n8n integration and deployment validation.
 */
export async function GET() {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET

    // Check if n8n configuration exists
    if (!webhookUrl || !webhookSecret) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'n8n webhook configuration missing',
          configured: {
            webhookUrl: !!webhookUrl,
            webhookSecret: !!webhookSecret,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    // Validate URL format
    try {
      new URL(webhookUrl)
    } catch {
      return NextResponse.json(
        {
          status: 'error',
          message: 'n8n webhook URL is invalid',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    // Basic configuration check passed
    // Note: We don't actually call the webhook here to avoid triggering workflows
    return NextResponse.json(
      {
        status: 'ok',
        n8n: 'configured',
        webhookUrl: new URL(webhookUrl).origin, // Only return origin for security
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('n8n health check error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unexpected error during n8n health check',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
