import Anthropic from '@anthropic-ai/sdk'
import { Message } from '@/lib/validations/ai-schema'
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

  // Use Haiku for questions (phases 1-4), Sonnet for final generation (phase 5)
  const model =
    phase <= 4 ? 'claude-haiku-4-20250514' : 'claude-sonnet-4-20250514'

  // Convert our message format to Anthropic format
  const anthropicMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }))

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: phase <= 4 ? 300 : 500,
    temperature: phase <= 4 ? 0.7 : 0.8,
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
