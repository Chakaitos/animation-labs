'use client'

import { useVideoSubscription, Video } from '@/hooks/useVideoSubscription'
import { VideoCard } from './video-card'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'

interface VideoGridRealtimeProps {
  userId: string
  initialVideos: Video[]
}

export function VideoGridRealtime({ userId, initialVideos }: VideoGridRealtimeProps) {
  const previousVideosRef = useRef<Map<string, Video>>(new Map())

  // Track previous video statuses to detect status changes
  useEffect(() => {
    const videoMap = new Map(initialVideos.map((v) => [v.id, v]))
    previousVideosRef.current = videoMap
  }, [initialVideos])

  const handleVideoUpdate = (updatedVideo: Video) => {
    const previousVideo = previousVideosRef.current.get(updatedVideo.id)

    // Show toast notification when video completes
    if (
      previousVideo &&
      previousVideo.status === 'processing' &&
      updatedVideo.status === 'completed'
    ) {
      toast.success('Video Ready!', {
        description: `${updatedVideo.brand_name} is ready to download.`,
        duration: 5000,
      })
    }

    // Show toast notification when video fails
    if (
      previousVideo &&
      previousVideo.status === 'processing' &&
      updatedVideo.status === 'failed'
    ) {
      toast.error('Video Failed', {
        description: `${updatedVideo.brand_name} failed to process. ${updatedVideo.error_message || ''}`,
        duration: 7000,
      })
    }

    // Update the previous video state
    previousVideosRef.current.set(updatedVideo.id, updatedVideo)
  }

  const { videos, isConnected } = useVideoSubscription({
    userId,
    initialVideos,
    onVideoUpdate: handleVideoUpdate,
  })

  return (
    <>
      {/* Optional connection indicator - can be removed if not desired */}
      {!isConnected && videos.some((v) => v.status === 'processing') && (
        <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
          Reconnecting to real-time updates...
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </>
  )
}
