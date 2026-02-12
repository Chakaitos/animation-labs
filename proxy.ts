import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: This refreshes the session if expired
  // Do not remove this line - it's the whole point of the proxy
  const { data: { user } } = await supabase.auth.getUser()

  // Password recovery enforcement
  // If user has a session and came from password reset, force password update
  if (user) {
    const isRecoveryCallback = request.nextUrl.pathname === '/auth/callback' &&
                               request.nextUrl.searchParams.get('next')?.includes('update-password')

    // Set recovery marker cookie when recovery callback is detected
    // This ensures the cookie is set BEFORE user lands on /update-password
    if (isRecoveryCallback) {
      console.log('Proxy: Recovery callback detected, setting marker cookie')
      supabaseResponse.cookies.set('password_recovery_pending', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 15, // 15 minutes
        path: '/',
      })
    }

    // Enforce password update for non-callback pages
    if (!isRecoveryCallback) {
      // Check if there's a recovery marker in cookies
      const hasRecoveryMarker = request.cookies.has('password_recovery_pending')

      // Enforce ONLY based on cookie (not timestamp)
      // This prevents false positives from new signups and post-update loops
      if (hasRecoveryMarker &&
          request.nextUrl.pathname !== '/update-password' &&
          !request.nextUrl.pathname.startsWith('/auth/') &&
          !request.nextUrl.pathname.startsWith('/api/') &&
          !request.nextUrl.pathname.startsWith('/_next/')) {

        console.log('Proxy: Redirecting to password update (recovery marker found)')

        // Redirect to update password page
        return NextResponse.redirect(new URL('/update-password', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and other static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
