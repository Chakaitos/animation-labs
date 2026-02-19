import Anthropic from '@anthropic-ai/sdk'
import { Message, LogoAnalysis } from '@/lib/validations/ai-schema'
import { getSystemPrompt } from '@/lib/ai/prompts/creative-direction-system'

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
}

/**
 * Stream creative direction response from Claude
 *
 * @param messages - Conversation history
 * @param phase - Current phase (1-5)
 * @param brandContext - Brand information
 */
export async function streamCreativeDirectionResponse(
  messages: Message[],
  phase: number,
  brandContext: BrandContext
) {
  if (!anthropic) {
    throw new Error(
      'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.'
    )
  }

  // Use Haiku for questions (phases 1-3), Sonnet for final generation (phase 4)
  const model =
    phase <= 3 ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-5-20250929'

  // Convert our message format to Anthropic format
  const anthropicMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: phase <= 3 ? 400 : 1000, // Increased for complete responses
    temperature: phase <= 3 ? 0.7 : 0.8,
    system: [
      {
        type: 'text' as const,
        text: getSystemPrompt(brandContext),
        cache_control: { type: 'ephemeral' as const },
      },
    ],
    messages: anthropicMessages,
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
