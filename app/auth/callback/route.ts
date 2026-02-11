import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('Auth callback invoked:', {
    hasTokenHash: !!token_hash,
    type,
    next,
    error: error_param,
    errorDescription: error_description,
    fullUrl: request.url,
  })

  // Check for error from Supabase redirect
  if (error_param) {
    console.error('Auth callback error from Supabase:', {
      error: error_param,
      description: error_description,
    })
    return NextResponse.redirect(
      new URL(`/auth-error?error=${error_param}&description=${error_description}`, request.url)
    )
  }

  // Prevent open redirect attacks - only allow internal paths
  const redirectTo = next.startsWith('/') ? next : '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    console.log('Attempting to verify OTP:', { type })

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log('Email verified successfully:', {
        type,
        hasSession: !!data.session,
        hasUser: !!data.user,
      })

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
      console.error('Email verification failed:', {
        error: error.message,
        status: error.status,
        name: error.name,
      })
      return NextResponse.redirect(
        new URL(`/auth-error?error=verification-failed&message=${encodeURIComponent(error.message)}`, request.url)
      )
    }
  }

  // No token_hash or type provided
  console.error('Missing required params:', {
    hasTokenHash: !!token_hash,
    type,
    searchParams: Object.fromEntries(searchParams.entries()),
  })

  // Redirect to error page on failure
  return NextResponse.redirect(new URL('/auth-error?error=missing-params', request.url))
}
