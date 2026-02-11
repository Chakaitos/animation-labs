'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Example } from '@/app/examples/_data/examples'

interface VideoDetailModalProps {
  example: Example | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoDetailModal({ example, open, onOpenChange }: VideoDetailModalProps) {
  if (!example) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">{example.title}</AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Video example with creative direction details
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <video
              key={example.id}
              controls
              playsInline
              preload="metadata"
              poster={example.posterUrl}
              className="w-full h-full"
            >
              <source src={example.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{example.style}</Badge>
            <Badge variant="outline">{example.industry}</Badge>
          </div>

          {/* Creative Direction */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Creative Direction</h3>
            <div className="p-4 rounded-lg border bg-muted/30">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {example.creativeDirection}
              </p>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
