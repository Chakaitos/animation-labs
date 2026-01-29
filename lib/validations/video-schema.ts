import { z } from 'zod'

// Video duration options (in seconds) - matches UI dropdown
export const VIDEO_DURATIONS = ['4s', '6s', '8s', '15s'] as const
export type VideoDuration = typeof VIDEO_DURATIONS[number]

// Video quality options - matches UI dropdown
export const VIDEO_QUALITIES = ['standard', 'premium', '1080p', '4k'] as const
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
  'custom',
] as const
export type StylePreset = typeof STYLE_PRESETS[number]

// Hex color validation pattern
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

// Schema for the video creation form
export const videoSchema = z.object({
  brandName: z
    .string()
    .min(1, 'Brand name is required')
    .max(100, 'Brand name must be 100 characters or less'),
  duration: z.enum(VIDEO_DURATIONS, {
    message: 'Please select a duration',
  }),
  quality: z.enum(VIDEO_QUALITIES, {
    message: 'Please select a quality',
  }),
  style: z.enum(STYLE_PRESETS, {
    message: 'Please select a style',
  }),
  creativeDirection: z
    .string()
    .max(500, 'Creative direction must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  primaryColor: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color format'),
  secondaryColor: z
    .string()
    .regex(hexColorRegex, 'Invalid hex color format'),
})

// Type export for form usage
export type VideoFormValues = z.infer<typeof videoSchema>

// Default values for the form (opinionated defaults from CONTEXT.md)
export const videoFormDefaults: VideoFormValues = {
  brandName: '',
  duration: '15s',
  quality: '1080p',
  style: 'modern',
  creativeDirection: '',
  primaryColor: '#000000',
  secondaryColor: '#666666',
}
