import Anthropic from '@anthropic-ai/sdk'
import { LogoAnalysis } from '@/lib/validations/ai-schema'

// Initialize Anthropic client only if API key is provided
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null

interface BrandContext {
  brandName: string
  stylePreset: string
  aspectRatio: string
  logoAnalysis?: LogoAnalysis
}

/**
 * Stream an optimized creative direction brief from a rough user description.
 * Single-turn: transforms raw input into a vivid, production-ready animation brief.
 */
export async function streamOptimizeCreativeDirection(
  rawInput: string,
  brandContext: BrandContext
) {
  if (!anthropic) {
    throw new Error(
      'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.'
    )
  }

  const { brandName, stylePreset, aspectRatio, logoAnalysis } = brandContext

  const logoAnalysisContext = logoAnalysis
    ? `Logo analysis: ${logoAnalysis.industry} brand with a ${logoAnalysis.brandArchetype} archetype. Animation tone: ${logoAnalysis.animationTone}.`
    : ''

  const systemPrompt = `You are a creative director writing animation briefs for 8-second logo animations.

Transform the user's rough description into a vivid, production-ready creative brief.
Write in flowing prose (not bullets). Cover all 6 elements naturally:
1. Atmosphere (mood, background, environment)
2. Lighting (how the logo is revealed and highlighted)
3. Effects (particles, sparks, trails, movement)
4. Texture (shadows, depth, contrast, materials)
5. Camera (movement, angles, perspective)
6. Sound (audio, music, atmosphere)

Rules:
- Under 1200 characters total
- Animation is always 8 seconds — mention naturally
- Amplify the brand's identity, don't just restate their input
- Be specific with colors, timing, textures, and sound descriptors
- End with a "Sound:" clause describing audio
- Write ONE continuous creative brief — no questions, no headers

Brand: ${brandName} | Style preset: ${stylePreset} | Format: ${aspectRatio}${logoAnalysisContext ? `\n${logoAnalysisContext}` : ''}`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 800,
    temperature: 0.8,
    system: systemPrompt,
    messages: [{ role: 'user', content: rawInput }],
  })

  return stream
}

const LOGO_ANALYSIS_SYSTEM_PROMPT = `You are a brand identity analyst. Analyze the provided logo image and classify the brand.

Return a JSON object with this exact structure:
{
  "industry": string,
  "brandArchetype": string,
  "animationTone": string,
  "confidence": "high" | "medium" | "low",
  "needsBrandContext": boolean
}

Guidelines:
- "industry": The brand's likely industry/sector (e.g., "martial arts / fitness", "luxury retail", "tech startup", "healthcare")
- "brandArchetype": One of: warrior, hero, sage, ruler, creator, magician, caregiver, everyman, jester, lover, explorer, innocent
- "animationTone": A brief description of the animation feel that suits this brand (e.g., "powerful and intense", "clean and authoritative", "warm and welcoming")
- "confidence": How confident you are in the classification
  - "high": Clear, distinctive logo with obvious brand identity
  - "medium": Recognizable style with reasonable inference
  - "low": Abstract or ambiguous — cannot reliably classify
- "needsBrandContext": Set to true when confidence is "low" OR when the logo is so abstract/generic that knowing the industry would significantly change the creative direction

Return ONLY valid JSON, no other text.`

/**
 * Analyze a logo image to extract brand context for creative direction
 */
export async function analyzeLogoImage(context: {
  imageBase64: string
  mimeType: string
  brandName?: string
}): Promise<LogoAnalysis> {
  if (!anthropic) {
    throw new Error(
      'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.'
    )
  }

  const userText = context.brandName
    ? `Analyze this logo for brand "${context.brandName}". Return JSON only.`
    : 'Analyze this logo image. Return JSON only.'

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    temperature: 0,
    system: LOGO_ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: context.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
              data: context.imageBase64,
            },
          },
          {
            type: 'text',
            text: userText,
          },
        ],
      },
    ],
  })

  const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in logo analysis response')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return parsed as LogoAnalysis
}
