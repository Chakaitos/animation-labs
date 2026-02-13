import { createClient } from '@/lib/supabase/server'
import { VideoFilterBar } from '@/components/admin/video-filter-bar'
import { VideoMonitoringTable } from '@/components/admin/video-monitoring-table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const VIDEOS_PER_PAGE = 50

interface VideosPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
  }>
}

export default async function VideosPage(props: VideosPageProps) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const status = searchParams.status || 'all'
  const currentPage = parseInt(searchParams.page || '1')
  const offset = (currentPage - 1) * VIDEOS_PER_PAGE

  // Build query for videos
  let query = supabase
    .from('videos')
    .select('id, brand_name, status, created_at, error_message, user_id', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + VIDEOS_PER_PAGE - 1)

  // Apply status filter if provided
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  const { data: videos, count, error } = await query

  if (error) {
    console.error('Error fetching videos:', error)
  }

  // Fetch user emails separately
  let videosWithUsers = videos || []
  if (videos && videos.length > 0) {
    const userIds = [...new Set(videos.map(v => v.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds)

    // Match profiles to videos
    videosWithUsers = videos.map(video => ({
      ...video,
      user: profiles?.find(p => p.id === video.user_id) || { id: video.user_id, email: 'Unknown' }
    }))
  }

  const totalPages = Math.ceil((count || 0) / VIDEOS_PER_PAGE)

  // Get status counts for badges
  const [
    { count: processingCount },
    { count: failedCount },
    { count: completedCount },
  ] = await Promise.all([
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Video Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Track video production and troubleshoot issues
        </p>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Processing</p>
          <p className="text-2xl font-bold mt-1">{processingCount ?? 0}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold mt-1 text-destructive">{failedCount ?? 0}</p>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{completedCount ?? 0}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <VideoFilterBar />

      {/* Videos Table */}
      <VideoMonitoringTable videos={videosWithUsers} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + VIDEOS_PER_PAGE, count || 0)} of{' '}
            {count || 0} videos
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              asChild={currentPage > 1}
            >
              {currentPage > 1 ? (
                <Link
                  href={`/admin/videos?${new URLSearchParams({
                    ...(status !== 'all' && { status }),
                    page: String(currentPage - 1),
                  })}`}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </>
              )}
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              asChild={currentPage < totalPages}
            >
              {currentPage < totalPages ? (
                <Link
                  href={`/admin/videos?${new URLSearchParams({
                    ...(status !== 'all' && { status }),
                    page: String(currentPage + 1),
                  })}`}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
