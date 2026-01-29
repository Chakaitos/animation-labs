'use client'

import { UseFormReturn } from 'react-hook-form'

import { VideoFormValues, VIDEO_DURATIONS, VIDEO_QUALITIES } from '@/lib/validations/video-schema'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DetailsStepProps {
  form: UseFormReturn<VideoFormValues>
  onNext: () => void
  onBack: () => void
}

const DURATION_LABELS: Record<string, string> = {
  '4s': '4 seconds - Quick intro',
  '6s': '6 seconds - Standard',
  '8s': '8 seconds - Extended',
  '15s': '15 seconds - Full animation',
}

const QUALITY_LABELS: Record<string, string> = {
  'standard': 'Standard (720p)',
  'premium': 'Premium (1080p)',
  '1080p': '1080p HD',
  '4k': '4K Ultra HD',
}

export function DetailsStep({ form, onNext, onBack }: DetailsStepProps) {
  const handleNext = async () => {
    // Validate fields for this step
    const isValid = await form.trigger(['brandName', 'duration', 'quality'])
    if (isValid) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Video Details</h2>
        <p className="text-muted-foreground">
          Enter your brand name and select video specifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Brand Name */}
        <FormField
          control={form.control}
          name="brandName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your brand name"
                  maxLength={100}
                />
              </FormControl>
              <FormDescription>
                This will appear in your logo animation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Duration */}
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIDEO_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {DURATION_LABELS[duration]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Longer videos have more elaborate animations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quality */}
        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIDEO_QUALITIES.map((quality) => (
                    <SelectItem key={quality} value={quality}>
                      {QUALITY_LABELS[quality]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Higher quality videos are recommended for marketing
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext} className="ml-auto">
          Continue
        </Button>
      </div>
    </div>
  )
}
