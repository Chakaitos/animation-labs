import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendVideoReadyEmail } from '@/lib/email/send'

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
  console.log('=== VIDEO STATUS WEBHOOK CALLED ===')
  console.log('Timestamp:', new Date().toISOString())

  const headersList = await headers()

  // Log all headers for debugging
  console.log('Webhook headers:', {
    'x-webhook-secret': headersList.get('x-webhook-secret') ? '***' : 'missing',
    'x-webhook-id': headersList.get('x-webhook-id'),
    'x-n8n-execution-id': headersList.get('x-n8n-execution-id'),
    'content-type': headersList.get('content-type'),
  })

  // Verify webhook secret
  const secret = headersList.get('x-webhook-secret')
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET

  if (expectedSecret && secret !== expectedSecret) {
    console.error('Webhook authentication failed')
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
    console.log('Webhook payload:', JSON.stringify(body, null, 2))
  } catch (err) {
    console.error('Invalid JSON body:', err)
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Validate required fields
  const { videoId, status, videoUrl, thumbnailUrl, errorMessage, n8nExecutionId, metadata } = body

  if (!videoId || !status) {
    return NextResponse.json(
      { error: 'Missing required fields: videoId, status' },
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
    console.error('Video status update error:', error)
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
  console.log('Checking if should send email:', {
    hasData: !!data && data.length > 0,
    status,
    shouldSend: data && data.length > 0 && status === 'completed',
  })

  if (data && data.length > 0 && status === 'completed') {
    const video = data[0]

    console.log('=== SENDING VIDEO READY EMAIL ===')
    console.log('Email trigger data:', {
      videoId: video.id,
      userId: video.user_id,
      brandName: video.brand_name,
      videoUrl: video.video_url || videoUrl,
      thumbnailUrl: video.thumbnail_url || thumbnailUrl,
      hasVideoUrl: !!(video.video_url || videoUrl),
      hasThumbnailUrl: !!(video.thumbnail_url || thumbnailUrl),
    })

    // Send email asynchronously - don't block webhook response
    sendVideoReadyEmail(
      video.user_id,
      video.video_url || videoUrl,
      video.brand_name,
      video.thumbnail_url || thumbnailUrl
    ).then(() => {
      console.log('=== VIDEO EMAIL SENT SUCCESSFULLY ===', {
        videoId: video.id,
        userId: video.user_id,
      })
    }).catch(err => {
      console.error('=== VIDEO EMAIL FAILED ===', {
        videoId: video.id,
        userId: video.user_id,
        brandName: video.brand_name,
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      })
      // Don't throw - email failure shouldn't fail the webhook
    })
  } else {
    console.log('Email NOT sent - conditions not met')
  }

  const response = {
    success: true,
    videoId: data[0].id,
    status: data[0].status,
  }

  console.log('=== WEBHOOK COMPLETED SUCCESSFULLY ===')
  console.log('Response:', response)

  return NextResponse.json(response)
}
