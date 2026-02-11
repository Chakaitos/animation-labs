import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Check if this is a password recovery session
  // Recovery sessions come from password reset links
  const isRecoveryCallback = request.nextUrl.pathname === '/auth/callback' &&
                             request.nextUrl.searchParams.get('next')?.includes('update-password')

  // If user has a session and is trying to access protected pages
  // but came from a recovery flow, force them to update password first
  if (session && !isRecoveryCallback) {
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user was created/updated very recently (within last 5 minutes)
    // This indicates they just went through password reset
    if (user) {
      const updatedAt = new Date(user.updated_at || user.created_at)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const isRecentlyUpdated = updatedAt > fiveMinutesAgo

      // Check if there's a recovery marker in cookies
      const hasRecoveryMarker = request.cookies.has('password_recovery_pending')

      const needsPasswordUpdate = hasRecoveryMarker || isRecentlyUpdated

      // If they need to update password but aren't on the update-password page
      if (needsPasswordUpdate &&
          request.nextUrl.pathname !== '/update-password' &&
          !request.nextUrl.pathname.startsWith('/auth/') &&
          !request.nextUrl.pathname.startsWith('/api/') &&
          !request.nextUrl.pathname.startsWith('/_next/')) {

        console.log('Middleware: Redirecting to password update (recovery session detected)')

        // Set a cookie marker so we can track recovery state
        response.cookies.set('password_recovery_pending', 'true', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 15, // 15 minutes
          path: '/',
        })

        // Redirect to update password page
        return NextResponse.redirect(new URL('/update-password', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
