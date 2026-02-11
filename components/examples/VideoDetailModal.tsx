'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
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
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl pr-8">{example.title}</AlertDialogTitle>
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
              autoPlay
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
            <Badge
              variant="secondary"
              className="bg-primary text-white dark:bg-primary dark:text-white border-none"
            >
              {example.style}
            </Badge>
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
