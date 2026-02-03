import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback invoked:', {
    hasTokenHash: !!token_hash,
    type,
    next,
    url: request.url,
  })

  // Prevent open redirect attacks - only allow internal paths
  const redirectTo = next.startsWith('/') ? next : '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log('Email verified successfully:', { type })

      // Email verified successfully - send welcome email
      // Only send on signup verification (not password reset, etc.)
      if (type === 'email' || type === 'signup') {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Fetch profile for first name
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single()

          console.log('Sending welcome email:', {
            userId: user.id,
            email: user.email,
            hasProfile: !!profile,
          })

          // Send welcome email asynchronously - don't block redirect
          sendWelcomeEmail(
            user.email!,
            profile?.first_name || 'there'
          ).catch(err => {
            console.error('Failed to send welcome email:', {
              userId: user.id,
              email: user.email,
              error: err instanceof Error ? err.message : 'Unknown error',
            })
            // Don't throw - verification succeeded, email is optional
          })
        }
      }

      console.log('Redirecting to:', redirectTo)
      return NextResponse.redirect(new URL(redirectTo, request.url))
    } else {
      console.error('Email verification failed:', error)
    }
  } else {
    console.error('Missing token_hash or type:', { hasTokenHash: !!token_hash, type })
  }

  // Redirect to error page on failure
  return NextResponse.redirect(new URL('/auth-error?error=verification-failed', request.url))
}
