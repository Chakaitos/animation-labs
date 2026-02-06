import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/navigation/user-menu'
import { VideoGrid } from '@/components/videos/video-grid'
import { VideoFilters } from '@/components/videos/video-filters'
import { VideoGridSkeleton } from '@/components/videos/video-card-skeleton'
import { EmptyVideosState } from '@/components/videos/empty-state'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type SearchParams = Promise<{
  query?: string
  status?: string
}>

interface PageProps {
  searchParams: SearchParams
}

// Async component that fetches videos based on filters
async function VideoList({
  query,
  status,
  userId,
}: {
  query: string
  status: string
  userId: string
}) {
  const supabase = await createClient()

  // Build query with filters
  let queryBuilder = supabase
    .from('videos')
    .select('id, brand_name, status, video_url, thumbnail_url, created_at, error_message, aspect_ratio')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Apply status filter (uses composite index: user_id, status)
  if (status !== 'all' && status) {
    queryBuilder = queryBuilder.eq('status', status)
  }

  // Apply search filter (case-insensitive partial match)
  if (query) {
    queryBuilder = queryBuilder.ilike('brand_name', `%${query}%`)
  }

  const { data: videos } = await queryBuilder

  if (!videos?.length) {
    return <EmptyVideosState />
  }

  return <VideoGrid videos={videos} />
}

export default async function VideosPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Await searchParams to get query and status
  const params = await searchParams
  const query = params.query || ''
  const status = params.status || 'all'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/AL_transparent_compact.png" alt="AnimateLabs" width={180} height={48} />
          </Link>
          <UserMenu user={user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Video Library</h1>
          <Button asChild>
            <Link href="/create-video">
              <Plus className="mr-2 size-4" />
              Create Video
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <VideoFilters />

        {/* Video Grid with Suspense */}
        {/* CRITICAL: key prop forces re-render on param changes */}
        <Suspense key={query + status} fallback={<VideoGridSkeleton />}>
          <VideoList query={query} status={status} userId={user.id} />
        </Suspense>
      </main>
    </div>
  )
}
