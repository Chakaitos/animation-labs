'use client'

import { UseFormReturn } from 'react-hook-form'
import Image from 'next/image'

import { VideoFormValues } from '@/lib/validations/video-schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface ReviewStepProps {
  form: UseFormReturn<VideoFormValues>
  file: File | null
  colors: { primary: string; secondary: string } | null
  onBack: () => void
  isSubmitting: boolean
}

const DURATION_LABELS: Record<string, string> = {
  '4s': '4 seconds',
  '6s': '6 seconds',
  '8s': '8 seconds',
  '15s': '15 seconds',
}

const QUALITY_LABELS: Record<string, string> = {
  'standard': 'Standard (720p)',
  'premium': 'Premium (1080p)',
  '1080p': '1080p HD',
  '4k': '4K Ultra HD',
}

export function ReviewStep({ form, file, colors, onBack, isSubmitting }: ReviewStepProps) {
  const values = form.getValues()
  const preview = file ? URL.createObjectURL(file) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Review Your Video</h2>
        <p className="text-muted-foreground">
          Please review your selections before creating the video
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo Preview */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Logo</p>
              {preview && (
                <div className="relative w-32 h-32 rounded border bg-muted">
                  <Image
                    src={preview}
                    alt="Logo preview"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}
            </div>

            {/* Colors */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Extracted Colors</p>
              <div className="flex gap-4">
                {colors && (
                  <>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <span className="text-sm font-mono">{colors.primary}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: colors.secondary }}
                      />
                      <span className="text-sm font-mono">{colors.secondary}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Brand Name</p>
              <p className="font-medium">{values.brandName}</p>
            </div>

            {/* Duration */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Duration</p>
              <p className="font-medium">{DURATION_LABELS[values.duration]}</p>
            </div>

            {/* Quality */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Quality</p>
              <p className="font-medium">{QUALITY_LABELS[values.quality]}</p>
            </div>

            {/* Style */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Style</p>
              <p className="font-medium capitalize">{values.style}</p>
            </div>

            {/* Creative Direction */}
            {values.creativeDirection && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Creative Direction</p>
                <p className="text-sm">{values.creativeDirection}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Notice */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm">
          <span className="font-medium">Credit Cost:</span> 1 credit will be deducted from your balance when you create this video.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" className="ml-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Video...' : 'Create Video'}
        </Button>
      </div>
    </div>
  )
}
