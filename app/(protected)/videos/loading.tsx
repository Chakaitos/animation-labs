import { VideoGridSkeleton } from '@/components/videos/video-card-skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Simplified header skeleton */}
      <header className="border-b">
        <div className="container mx-auto h-[56px] px-4 py-4" />
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Title skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-40 rounded bg-muted" />
          <div className="h-10 w-32 rounded bg-muted" />
        </div>

        {/* Filters skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-10 w-[300px] rounded bg-muted" />
          <div className="h-10 w-[180px] rounded bg-muted" />
        </div>

        {/* Video grid skeleton */}
        <VideoGridSkeleton />
      </main>
    </div>
  )
}
