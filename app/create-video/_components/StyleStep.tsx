'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

import {
  VideoFormValues,
  STYLE_PRESETS,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface StyleStepProps {
  form: UseFormReturn<VideoFormValues>
  onNext: () => void
  onBack: () => void
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  modern: 'Clean lines, smooth transitions, contemporary feel',
  minimal: 'Subtle animations, focus on simplicity',
  bold: 'Strong movements, high impact, attention-grabbing',
  elegant: 'Refined animations, sophisticated aesthetics',
  playful: 'Fun, bouncy movements, energetic vibe',
  corporate: 'Professional, polished, business-appropriate',
  cinematic: 'Dramatic, movie-quality effects',
  retro: 'Vintage aesthetics, nostalgic feel, classic style',
  custom: 'Describe your own creative direction',
}

export function StyleStep({ form, onNext, onBack }: StyleStepProps) {
  const selectedStyle = form.watch('style')
  const dialogueType = form.watch('dialogueType')
  const [showDialogueText, setShowDialogueText] = useState(false)

  useEffect(() => {
    setShowDialogueText(dialogueType === 'custom')
  }, [dialogueType])

  const handleNext = async () => {
    // Validate fields for this step
    const isValid = await form.trigger([
      'style',
      'creativeDirection',
      'dialogueType',
      'dialogueText',
    ])
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
                  maxLength={1500}
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

        {/* Voiceover */}
        <FormField
          control={form.control}
          name="dialogueType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Voiceover</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no voiceover" id="no-voiceover" />
                    <Label htmlFor="no-voiceover" className="cursor-pointer">
                      No voiceover
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom-dialogue" />
                    <Label htmlFor="custom-dialogue" className="cursor-pointer">
                      Custom voiceover
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Add a voiceover narration to your video
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Custom Dialogue Text (conditional) */}
        {showDialogueText && (
          <FormField
            control={form.control}
            name="dialogueText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voiceover Text</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your voiceover text (max 200 characters)"
                    className="resize-none min-h-[80px]"
                    maxLength={200}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {field.value?.length || 0}/200 characters
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
