import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

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
  } catch {
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

  const { data, error } = await query.select('id, status')

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

  return NextResponse.json({
    success: true,
    videoId: data[0].id,
    status: data[0].status,
  })
}
