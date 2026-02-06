'use client'

import { UseFormReturn } from 'react-hook-form'

import {
  VideoFormValues,
  VIDEO_QUALITIES,
} from '@/lib/validations/video-schema'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface DetailsStepProps {
  form: UseFormReturn<VideoFormValues>
  onNext: () => void
  onBack: () => void
}

const QUALITY_LABELS: Record<string, string> = {
  standard: 'Standard',
  premium: 'Premium',
}

export function DetailsStep({ form, onNext, onBack }: DetailsStepProps) {
  const selectedQuality = form.watch('quality')

  const handleNext = async () => {
    // Validate fields for this step
    const isValid = await form.trigger([
      'brandName',
      'quality',
      'aspectRatio',
    ])
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
                {selectedQuality === 'premium' ? (
                  <span className="font-medium text-[#F97316]">
                    Premium videos cost 2 credits
                  </span>
                ) : (
                  'Higher quality videos are recommended for marketing. All videos are 8 seconds.'
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Aspect Ratio */}
        <FormField
          control={form.control}
          name="aspectRatio"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Aspect Ratio</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="landscape" id="landscape" />
                    <Label htmlFor="landscape" className="cursor-pointer">
                      Landscape (16:9)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="portrait" id="portrait" />
                    <Label htmlFor="portrait" className="cursor-pointer">
                      Portrait (9:16)
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Choose the format that best fits your platform (YouTube:
                landscape, Instagram: portrait)
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
