import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeLogoImage } from '@/lib/ai/providers/anthropic'
import { logoAnalysisSchema } from '@/lib/validations/ai-schema'

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

    // 2. Parse request body
    const body = await req.json()
    const { imageBase64, mimeType, brandName } = body

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    if (!mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return NextResponse.json({ error: 'Invalid mimeType' }, { status: 400 })
    }

    // 3. Analyze the logo
    const rawAnalysis = await analyzeLogoImage({
      imageBase64,
      mimeType,
      brandName: typeof brandName === 'string' ? brandName : undefined,
    })

    // 4. Validate before returning — Claude may return unexpected values (e.g. "very high" confidence)
    const parsed = logoAnalysisSchema.safeParse(rawAnalysis)
    if (!parsed.success) {
      console.warn('Logo analysis schema validation failed', { error: parsed.error })
      return NextResponse.json({ error: 'analysis_failed', fallback: true }, { status: 422 })
    }

    return NextResponse.json(parsed.data)
  } catch (error) {
    console.error('Logo analysis error:', error)
    return NextResponse.json(
      { error: 'analysis_failed', fallback: true },
      { status: 422 }
    )
  }
}
