import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiRequestSchema } from '@/lib/validations/ai-schema'
import { checkRateLimit } from '@/lib/ai/rate-limiter'
import { validateUserInput } from '@/lib/ai/validation'
import { streamCreativeDirectionResponse } from '@/lib/ai/providers/anthropic'
import { anthropicStreamToReadableStream } from '@/lib/ai/streaming'
import { questionTemplates, getBrandAwareQ1 } from '@/lib/ai/prompts/creative-direction-system'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body = await req.json()
    const validationResult = aiRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error },
        { status: 400 }
      )
    }

    const {
      phase,
      questionCount,
      clarificationCount,
      selectedOption,
      userInput,
      isClarifyingQuestion,
      conversationHistory,
      brandContext,
    } = validationResult.data

    // 3. Check rate limiting
    const maxRequests = parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS || '5')
    const rateLimit = await checkRateLimit(user.id, maxRequests)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      )
    }

    // 4. For first request (no conversation history), send first question with options
    if (conversationHistory.length === 0) {
      const { logoAnalysis } = brandContext

      const formatQuestion = (q: { question: string; options: Array<{ letter: string; text: string }> }) =>
        `${q.question}\n\nOPTIONS:\n${q.options.map((opt) => `${opt.letter}. ${opt.text}`).join('\n')}`

      const rateHeaders = {
        'Content-Type': 'text/plain',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      }

      // Path A: Low confidence / ambiguous logo → ask brand context question (Q0)
      if (logoAnalysis?.needsBrandContext) {
        const q0 =
          "I'd love to help craft the perfect animation! To give you more relevant options, could you briefly describe what your business does or the vibe you're going for?"
        return new NextResponse(q0, {
          headers: {
            ...rateHeaders,
            'X-Brand-Context-Needed': 'true',
          },
        })
      }

      // Path B: High/medium confidence → brand-aware static Q1 (no API call)
      if (logoAnalysis && logoAnalysis.confidence !== 'low') {
        const q1 = getBrandAwareQ1(brandContext.brandName, logoAnalysis)
        if (q1) {
          return new NextResponse(formatQuestion(q1), { headers: rateHeaders })
        }
      }

      // Path C: No analysis / fallback → existing generic static Q1
      const firstQuestion = questionTemplates[1](brandContext.brandName)
      return new NextResponse(formatQuestion(firstQuestion), { headers: rateHeaders })
    }

    // 5. Validate user input
    const inputValidation = validateUserInput(userInput, selectedOption, phase)

    if (!inputValidation.valid) {
      return NextResponse.json(
        { error: inputValidation.error },
        { status: 400 }
      )
    }

    // 6. Check turn limits
    const totalTurns = questionCount + clarificationCount
    if (totalTurns >= 8) {
      // Force completion - return error asking to restart
      return NextResponse.json(
        { error: 'Maximum conversation turns reached. Please start over.' },
        { status: 400 }
      )
    }

    // 7. Build user message
    let userMessage = ''
    if (selectedOption) {
      // Find the option text for this letter
      const currentPhase = questionCount + 1
      if (currentPhase <= 3 && questionTemplates[currentPhase]) {
        const template = questionTemplates[currentPhase](brandContext.brandName)
        const option = template.options.find(
          (opt) => opt.letter === selectedOption
        )
        if (option && !option.isOther) {
          userMessage = `Selected: ${option.text}`
        } else if (option && option.isOther) {
          // This shouldn't happen (user should provide custom text)
          userMessage = userInput || 'Other - custom description'
        }
      }
    } else if (userInput) {
      userMessage = userInput
    }

    // 8. Add user message to conversation history
    const updatedHistory = [
      ...conversationHistory,
      {
        role: 'user' as const,
        content: userMessage,
        isClarification: inputValidation.isClarifyingQuestion,
      },
    ]

    // 9. Stream AI response
    const stream = await streamCreativeDirectionResponse(
      updatedHistory,
      phase,
      brandContext
    )

    return new NextResponse(anthropicStreamToReadableStream(stream), {
      headers: {
        'Content-Type': 'text/plain',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    })
  } catch (error) {
    console.error('AI creative direction error:', error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }

      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}
