'use client'

import { UseFormReturn } from 'react-hook-form'

import { VideoFormValues, STYLE_PRESETS } from '@/lib/validations/video-schema'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StyleStepProps {
  form: UseFormReturn<VideoFormValues>
  onNext: () => void
  onBack: () => void
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  'modern': 'Clean lines, smooth transitions, contemporary feel',
  'minimal': 'Subtle animations, focus on simplicity',
  'bold': 'Strong movements, high impact, attention-grabbing',
  'elegant': 'Refined animations, sophisticated aesthetics',
  'playful': 'Fun, bouncy movements, energetic vibe',
  'corporate': 'Professional, polished, business-appropriate',
  'cinematic': 'Dramatic, movie-quality effects',
  'custom': 'Describe your own creative direction',
}

export function StyleStep({ form, onNext, onBack }: StyleStepProps) {
  const selectedStyle = form.watch('style')

  const handleNext = async () => {
    // Validate fields for this step
    const isValid = await form.trigger(['style', 'creativeDirection'])
    if (isValid) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Animation Style</h2>
        <p className="text-muted-foreground">
          Choose a style preset or describe your own creative direction
        </p>
      </div>

      <div className="space-y-6">
        {/* Style Preset */}
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style Preset</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STYLE_PRESETS.map((style) => (
                    <SelectItem key={style} value={style}>
                      <span className="capitalize">{style}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedStyle && (
                <FormDescription>
                  {STYLE_DESCRIPTIONS[selectedStyle]}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Creative Direction (shown when 'custom' selected, or as optional for others) */}
        <FormField
          control={form.control}
          name="creativeDirection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Creative Direction
                {selectedStyle !== 'custom' && (
                  <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                )}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={
                    selectedStyle === 'custom'
                      ? 'Describe the animation style you want...'
                      : 'Add any specific instructions or preferences...'
                  }
                  className="min-h-[100px]"
                  maxLength={500}
                />
              </FormControl>
              <FormDescription>
                {selectedStyle === 'custom'
                  ? 'Be specific about the movements, effects, and overall feel you want'
                  : 'You can add extra instructions to customize the selected style'}
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
