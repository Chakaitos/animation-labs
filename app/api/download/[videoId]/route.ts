import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params
    const supabase = await createClient()

    // Get user and verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get video and verify ownership
    const { data: video, error } = await supabase
      .from('videos')
      .select('video_url, brand_name, user_id')
      .eq('id', videoId)
      .single()

    if (error || !video) {
      return new NextResponse('Video not found', { status: 404 })
    }

    if (video.user_id !== user.id) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    if (!video.video_url) {
      return new NextResponse('Video URL not available', { status: 404 })
    }

    // Fetch video from Supabase Storage
    const videoResponse = await fetch(video.video_url)
    if (!videoResponse.ok) {
      return new NextResponse('Failed to fetch video', { status: 500 })
    }

    // Get video blob
    const blob = await videoResponse.blob()

    // Extract filename from URL or use brand name
    const filename = `${video.brand_name.replace(/[^a-z0-9]/gi, '_')}.mp4`

    // Return with download headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': blob.size.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
