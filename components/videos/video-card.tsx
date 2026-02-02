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
}

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const canDownload = video.status === 'completed' && video.video_url

  // Get status icon for thumbnail placeholder
  const getStatusIcon = () => {
    switch (video.status) {
      case 'completed':
        return <CheckCircle className="size-12 text-green-600" />
      case 'processing':
        return <Loader2 className="size-12 animate-spin text-blue-600" />
      case 'pending':
        return <Loader2 className="size-12 text-gray-600" />
      case 'failed':
        return <XCircle className="size-12 text-red-600" />
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-muted">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={`${video.brand_name} thumbnail`}
            fill
            className="object-cover"
          />
        ) : (
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
        <p className="text-sm text-muted-foreground">
          {new Date(video.created_at).toLocaleDateString()}
        </p>
        {video.status === 'failed' && video.error_message && (
          <p className="text-sm text-destructive">{video.error_message}</p>
        )}
      </CardContent>

      {/* Actions */}
      <CardFooter className="gap-2">
        {canDownload && video.video_url && (
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={video.video_url} download>
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
