import Anthropic from '@anthropic-ai/sdk'

export interface ModerationResult {
  approved: boolean
  reason?: string // Internal audit log
  userMessage?: string // User-facing message
  moderationCategory?: 'nsfw' | 'real_person' | 'minor' | 'violence' | 'not_a_logo' | 'approved'
}

interface ModerationResponse {
  approved: boolean
  category: string
  reason: string
}

const USER_MESSAGES: Record<string, string> = {
  real_person:
    'Your image appears to be a photo of a real person. Please upload a logo or brand mark.',
  not_a_logo:
    "Your image doesn't appear to be a logo. Please upload a brand mark (JPG, PNG, or WebP).",
  nsfw: 'Your image contains inappropriate content and cannot be processed.',
  minor: 'Your image contains inappropriate content and cannot be processed.',
  violence: 'Your image contains inappropriate content and cannot be processed.',
}

const MODERATION_SYSTEM_PROMPT = `You are a content moderation system for a logo animation service. Analyze the provided image and determine if it is appropriate to process as a logo.

Return a JSON object with this exact structure:
{
  "approved": boolean,
  "category": string,
  "reason": string
}

Categories:
- "approved": Image is acceptable (logos, brand marks, abstract graphics, stylized/cartoon figures, text-based logos, icons, etc.)
- "real_person": Image is a photograph of a real person (not stylized/illustrated/cartoon)
- "nsfw": Image contains explicit sexual content
- "minor": Image contains identifiable minors in inappropriate contexts
- "violence": Image contains graphic violence or gore
- "not_a_logo": Image is clearly not a logo (e.g., landscape photo, food photo, random object)

IMPORTANT rules:
- Fail OPEN: When in doubt, approve. Only reject clearly inappropriate content.
- Allow: abstract graphics, stylized/cartoon human figures, mascots, illustrated characters, any image where logo intent is ambiguous
- Block: real photographs of actual people (not illustrations/cartoons), explicit sexual content, graphic violence
- "reason" should be a brief internal note (1 sentence)

Return ONLY valid JSON, no other text.`

export async function moderateLogoImage(
  file: File,
  mimeType: string
): Promise<ModerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set — skipping content moderation (fail-open)')
    return { approved: true }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      temperature: 0,
      system: MODERATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Analyze this image for content moderation. Return JSON only.',
            },
          ],
        },
      ],
    })

    const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''

    let parsed: ModerationResponse
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      console.warn('Image moderation JSON parse failed — failing open', { rawText })
      return { approved: true }
    }

    if (parsed.approved || parsed.category === 'approved') {
      return {
        approved: true,
        reason: parsed.reason,
        moderationCategory: 'approved',
      }
    }

    const category = parsed.category as ModerationResult['moderationCategory']
    return {
      approved: false,
      reason: parsed.reason,
      userMessage: USER_MESSAGES[parsed.category] || 'Your image cannot be processed. Please upload a logo.',
      moderationCategory: category,
    }
  } catch (error) {
    console.warn('Image moderation API error — failing open', error)
    return { approved: true }
  }
}
