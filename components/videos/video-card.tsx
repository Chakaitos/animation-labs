'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Download, Trash2, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VideoStatusBadge } from './video-status-badge'
import { DeleteVideoDialog } from './delete-video-dialog'

type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface Video {
  id: string
  brand_name: string
  status: VideoStatus
  video_url: string | null
  thumbnail_url: string | null
  created_at: string
  error_message: string | null
  aspect_ratio: 'landscape' | 'portrait'
}

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canDownload = video.status === 'completed' && video.video_url

  // Format aspect ratio for display
  const formatAspectRatio = (ratio: 'landscape' | 'portrait') => {
    return ratio === 'landscape' ? 'Landscape - 16:9' : 'Portrait - 9:16'
  }

  // Handle video hover preview
  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  // Get status icon for thumbnail placeholder
  const getStatusIcon = () => {
    switch (video.status) {
      case 'completed':
        return <CheckCircle className="size-12 text-[#10B981]" />
      case 'processing':
        return <Loader2 className="size-12 animate-spin text-[#F97316]" />
      case 'pending':
        return <Loader2 className="size-12 text-[#F59E0B]" />
      case 'failed':
        return <XCircle className="size-12 text-destructive" />
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Thumbnail Container */}
      <div
        className="relative aspect-video bg-muted overflow-hidden"
        onMouseEnter={video.status === 'completed' && video.video_url ? handleMouseEnter : undefined}
        onMouseLeave={video.status === 'completed' && video.video_url ? handleMouseLeave : undefined}
      >
        {video.status === 'completed' && video.video_url ? (
          // Show video preview for completed videos
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : video.thumbnail_url ? (
          // Show static thumbnail for other statuses with thumbnail
          <Image
            src={video.thumbnail_url}
            alt={`${video.brand_name} thumbnail`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          // Show status icon for videos without thumbnail
          <div className="flex h-full items-center justify-center">
            {getStatusIcon()}
          </div>
        )}
        {/* Status Badge - positioned top-right */}
        <div className="absolute right-2 top-2">
          <VideoStatusBadge status={video.status} />
        </div>
      </div>

      {/* Content */}
      <CardContent className="space-y-2">
        <h3 className="truncate font-semibold" title={video.brand_name}>
          {video.brand_name}
        </h3>
        <p className="text-xs text-muted-foreground">
          {formatAspectRatio(video.aspect_ratio)}
        </p>
        <p className="text-sm text-muted-foreground">
          Created {new Date(video.created_at).toLocaleDateString()}
        </p>
        {video.status === 'failed' && video.error_message && (
          <p className="text-sm text-destructive">{video.error_message}</p>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="gap-2">
        {canDownload && (
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={`/api/download/${video.id}`}>
              <Download />
              Download
            </a>
          </Button>
        )}
        <DeleteVideoDialog videoId={video.id} brandName={video.brand_name} />
      </CardFooter>
    </Card>
  )
}
