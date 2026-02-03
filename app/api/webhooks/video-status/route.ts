import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendVideoReadyEmail } from '@/lib/email/send'

/**
 * Video Status Webhook - Receives updates from n8n workflow
 *
 * **n8n Configuration Requirements:**
 *
 * The n8n workflow MUST send a JSON payload with the following structure:
 * ```json
 * {
 *   "videoId": "uuid-of-video-record",
 *   "status": "processing" | "completed" | "failed",
 *   "videoUrl": "https://...",  // Optional: URL to completed video
 *   "thumbnailUrl": "https://...",  // Optional: URL to thumbnail
 *   "errorMessage": "error details",  // Optional: error if failed
 *   "n8nExecutionId": "execution-id"  // Optional: for debugging
 * }
 * ```
 *
 * **Common Issues:**
 * - Empty payload `{ '': '' }` - n8n HTTP Request node not configured correctly
 * - Missing fields - Check n8n expression syntax for JSON body
 * - Content-Type header must be `application/json`
 *
 * **Headers:**
 * - `x-webhook-secret` - Must match N8N_WEBHOOK_SECRET env var
 * - `x-webhook-id` or `x-n8n-execution-id` - For idempotency
 */

// Use service role client for webhook processing (bypasses RLS)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

// Expected payload from n8n
interface VideoStatusPayload {
  videoId: string
  status: 'processing' | 'completed' | 'failed'
  videoUrl?: string       // URL to completed video
  thumbnailUrl?: string   // URL to video thumbnail
  errorMessage?: string   // Error message if failed
  n8nExecutionId?: string // n8n execution ID for debugging
  metadata?: Record<string, unknown> // Additional metadata from n8n
}

export async function POST(request: Request) {
  const headersList = await headers()

  // Verify webhook secret
  const secret = headersList.get('x-webhook-secret')
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET

  if (expectedSecret && secret !== expectedSecret) {
    console.error('Video webhook: Authentication failed')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Get unique webhook ID for idempotency (n8n should send this)
  const webhookId = headersList.get('x-webhook-id') || headersList.get('x-n8n-execution-id')

  let body: VideoStatusPayload
  try {
    body = await request.json()
  } catch (err) {
    console.error('Video webhook: Invalid JSON body')
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Check for empty or malformed payload (common n8n configuration issue)
  if (!body || Object.keys(body).length === 0 || (body as any)[''] !== undefined) {
    console.error('Video webhook: Empty or malformed payload received')
    return NextResponse.json(
      {
        error: 'Invalid payload: expected videoId, status, and optional videoUrl/thumbnailUrl',
        received: body,
        help: 'Check n8n webhook configuration - ensure JSON body contains required fields'
      },
      { status: 400 }
    )
  }

  // Validate required fields
  const { videoId, status, videoUrl, thumbnailUrl, errorMessage, n8nExecutionId, metadata } = body

  if (!videoId || !status) {
    console.error('Video webhook: Missing required fields', { videoId: !!videoId, status: !!status })
    return NextResponse.json(
      {
        error: 'Missing required fields: videoId and status',
        received: { videoId, status },
      },
      { status: 400 }
    )
  }

  if (!['processing', 'completed', 'failed'].includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be: processing, completed, or failed' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()

  // Build update object
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'completed') {
    if (videoUrl) updateData.video_url = videoUrl
    if (thumbnailUrl) updateData.thumbnail_url = thumbnailUrl
  }

  if (status === 'failed' && errorMessage) {
    updateData.error_message = errorMessage
  }

  if (n8nExecutionId) {
    updateData.n8n_execution_id = n8nExecutionId
  }

  if (metadata) {
    updateData.metadata = metadata
  }

  // Idempotent update: Only update if not already processed with this webhook ID
  // If no webhook ID provided, update regardless (less safe but works)
  let query = supabase
    .from('videos')
    .update(updateData)
    .eq('id', videoId)

  // If we have a webhook ID, use it for idempotency
  // Only update if n8n_execution_id is null OR matches the incoming ID
  if (webhookId) {
    query = query.or(`n8n_execution_id.is.null,n8n_execution_id.eq.${webhookId}`)
  }

  const { data, error } = await query.select('id, status, user_id, brand_name, video_url, thumbnail_url')

  if (error) {
    console.error('Video webhook: Database error', { videoId, error: error.message })
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    )
  }

  // If no rows updated, either video doesn't exist or already processed
  if (!data || data.length === 0) {
    // Check if video exists
    const { data: existing } = await supabase
      .from('videos')
      .select('id, status, n8n_execution_id')
      .eq('id', videoId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    // Already processed (idempotent response)
    return NextResponse.json({
      message: 'Already processed',
      videoId: existing.id,
      status: existing.status,
    })
  }

  // Send email notification when video completes
  if (data && data.length > 0 && status === 'completed') {
    const video = data[0]

    // Send email asynchronously - don't block webhook response
    sendVideoReadyEmail(
      video.user_id,
      video.video_url || videoUrl,
      video.brand_name,
      video.thumbnail_url || thumbnailUrl
    ).catch(err => {
      console.error('Video webhook: Email send failed', {
        videoId: video.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      // Don't throw - email failure shouldn't fail the webhook
    })
  }

  return NextResponse.json({
    success: true,
    videoId: data[0].id,
    status: data[0].status,
  })
}
