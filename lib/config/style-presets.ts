/**
 * Style Preset Configuration for n8n Webhook Payload
 *
 * Maps UI style presets to detailed style_preset objects sent to n8n workflow.
 * Each preset defines overall aesthetic, camera movement, scene elements, music, and intensity.
 */

export interface StylePresetPayload {
  overall_style: string
  camera_movement: string
  scene_elements: string[]
  music: string
  intensity: number
}

export const STYLE_PRESET_CONFIGS: Record<string, StylePresetPayload> = {
  modern: {
    overall_style:
      'Clean, minimal, contemporary. Bright lighting and simple backgrounds. Emphasis on clarity and precision.',
    camera_movement: 'Smooth linear push, subtle rotation',
    scene_elements: ['clean lines', 'soft shadows', 'geometric shapes'],
    music: 'ambient electronic minimalism',
    intensity: 40,
  },
  minimal: {
    overall_style:
      'Ultra-minimal, stark, refined. Pure white backgrounds and subtle elements. Emphasis on simplicity and elegance.',
    camera_movement: 'Gentle linear push, no rotation',
    scene_elements: ['single line accents', 'pure geometry', 'negative space'],
    music: 'ambient sparse piano',
    intensity: 25,
  },
  bold: {
    overall_style:
      'Dynamic, tech-forward, vibrant. Neon accents and digital effects. Emphasis on innovation and speed.',
    camera_movement: 'Fast zoom, quick rotation, glitch transitions',
    scene_elements: ['neon glows', 'circuit patterns', 'particle effects'],
    music: 'upbeat electronic with synthetic bass',
    intensity: 85,
  },
  elegant: {
    overall_style:
      'Sophisticated, refined, luxurious. Soft lighting and elegant textures. Emphasis on quality and prestige.',
    camera_movement: 'Graceful arc, slow reveal',
    scene_elements: ['golden accents', 'subtle sparkles', 'silk textures'],
    music: 'classical strings with piano',
    intensity: 35,
  },
  playful: {
    overall_style:
      'Fun, energetic, approachable. Bright colors and bouncy motion. Emphasis on joy and creativity.',
    camera_movement: 'Bouncy zoom, playful rotation',
    scene_elements: ['confetti', 'bright colors', 'bouncing motion'],
    music: 'upbeat pop with whistles',
    intensity: 75,
  },
  corporate: {
    overall_style:
      'Professional, trustworthy, polished. Clean lighting and corporate aesthetics. Emphasis on credibility and reliability.',
    camera_movement: 'Steady dolly, controlled movement',
    scene_elements: [
      'clean backgrounds',
      'subtle grid patterns',
      'professional lighting',
    ],
    music: 'corporate motivational background',
    intensity: 45,
  },
  cinematic: {
    overall_style:
      'Cinematic, bold, dramatic. Moody lighting and deep shadows. Emphasis on strength and impact.',
    camera_movement: 'Slow dolly-in, dynamic arc rotation',
    scene_elements: ['dramatic lighting', 'shadow play', 'metallic textures'],
    music: 'orchestral pulse with percussion',
    intensity: 70,
  },
  retro: {
    overall_style:
      'Vintage, nostalgic, warm. Film grain and retro color grading. Emphasis on timelessness and heritage.',
    camera_movement: 'Gentle pan, subtle zoom',
    scene_elements: ['film grain', 'vintage textures', 'warm color wash'],
    music: 'retro synth or jazz',
    intensity: 50,
  },
  custom: {
    overall_style: 'Custom style based on creative direction',
    camera_movement: 'Dynamic camera following creative direction',
    scene_elements: ['creative elements', 'custom design'],
    music: 'style-appropriate music',
    intensity: 60,
  },
}

/**
 * Get style preset configuration for webhook payload
 *
 * @param style - Style preset name (e.g., 'modern', 'custom')
 * @param creativeDirection - Optional creative direction text (used for custom style)
 * @returns StylePresetPayload object for n8n webhook
 */
export function getStylePresetConfig(
  style: string,
  creativeDirection?: string | null
): StylePresetPayload {
  const config = STYLE_PRESET_CONFIGS[style] || STYLE_PRESET_CONFIGS.custom

  // For custom style, enhance overall_style with creative direction
  if (style === 'custom' && creativeDirection) {
    return {
      ...config,
      overall_style: creativeDirection,
    }
  }

  return config
}
