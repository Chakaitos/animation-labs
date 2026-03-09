import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { optimizeRequestSchema } from '@/lib/validations/ai-schema'
import { checkRateLimit } from '@/lib/ai/rate-limiter'
import { streamOptimizeCreativeDirection } from '@/lib/ai/providers/anthropic'
import { anthropicStreamToReadableStream } from '@/lib/ai/streaming'

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
    const validationResult = optimizeRequestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error },
        { status: 400 }
      )
    }

    const { rawInput, brandContext } = validationResult.data

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

    // 4. Stream optimized creative direction
    const stream = await streamOptimizeCreativeDirection(rawInput, brandContext)

    return new NextResponse(anthropicStreamToReadableStream(stream), {
      headers: {
        'Content-Type': 'text/plain',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      },
    })
  } catch (error) {
    console.error('AI optimize creative direction error:', error)

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
      { error: 'Failed to optimize creative direction' },
      { status: 500 }
    )
  }
}
