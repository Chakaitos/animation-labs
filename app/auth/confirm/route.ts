import { NextResponse, type NextRequest } from 'next/server'

/**
 * Legacy confirm route - redirects to /auth/callback
 * Kept for backward compatibility with old email links
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Preserve all query parameters when redirecting
  const callbackUrl = new URL('/auth/callback', request.url)
  searchParams.forEach((value, key) => {
    callbackUrl.searchParams.set(key, value)
  })

  console.log('Legacy /auth/confirm route hit, redirecting to /auth/callback')

  return NextResponse.redirect(callbackUrl)
}
