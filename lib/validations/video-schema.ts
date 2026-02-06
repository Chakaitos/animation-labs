import { z } from 'zod'

// Video duration - all videos are 8 seconds
export const DEFAULT_VIDEO_DURATION = '8' as const
export type VideoDuration = typeof DEFAULT_VIDEO_DURATION

// Video quality options - matches UI dropdown
export const VIDEO_QUALITIES = ['standard', 'premium'] as const
export type VideoQuality = typeof VIDEO_QUALITIES[number]

// Style presets for video generation
export const STYLE_PRESETS = [
  'modern',
  'minimal',
  'bold',
  'elegant',
  'playful',
  'corporate',
  'cinematic',
  'retro',
  'custom',
] as const
export type StylePreset = typeof STYLE_PRESETS[number]

// Aspect ratio options (limited by Veo 3 API)
export const ASPECT_RATIOS = ['landscape', 'portrait'] as const
export type AspectRatio = typeof ASPECT_RATIOS[number]

// Dialogue options for voiceover
export const DIALOGUE_OPTIONS = ['no voiceover', 'custom'] as const
export type DialogueOption = typeof DIALOGUE_OPTIONS[number]

// Schema for the video creation form
export const videoSchema = z
  .object({
    brandName: z
      .string()
      .min(1, 'Brand name is required')
      .max(100, 'Brand name must be 100 characters or less'),
    quality: z.enum(VIDEO_QUALITIES, {
      message: 'Please select a quality',
    }),
    aspectRatio: z.enum(ASPECT_RATIOS, {
      message: 'Please select an aspect ratio',
    }),
    style: z.enum(STYLE_PRESETS, {
      message: 'Please select a style',
    }),
    creativeDirection: z
      .string()
      .max(1500, 'Creative direction must be 1500 characters or less')
      .optional()
      .or(z.literal('')),
    dialogueType: z.enum(DIALOGUE_OPTIONS, {
      message: 'Please select a dialogue option',
    }),
    dialogueText: z
      .string()
      .max(200, 'Dialogue must be 200 characters or less')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.dialogueType === 'custom') {
        return data.dialogueText && data.dialogueText.length > 0
      }
      return true
    },
    {
      message: 'Dialogue text is required when custom dialogue is selected',
      path: ['dialogueText'],
    }
  )

// Type export for form usage
export type VideoFormValues = z.infer<typeof videoSchema>

// Default values for the form (opinionated defaults from CONTEXT.md)
export const videoFormDefaults: VideoFormValues = {
  brandName: '',
  quality: 'standard',
  aspectRatio: 'landscape',
  style: 'modern',
  creativeDirection: '',
  dialogueType: 'no voiceover',
  dialogueText: '',
}
