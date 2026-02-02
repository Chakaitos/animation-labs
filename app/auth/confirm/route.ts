import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Prevent open redirect attacks - only allow internal paths
  const redirectTo = next.startsWith('/') ? next : '/dashboard'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Email verified successfully - send welcome email
      // Only send on signup verification (not password reset, etc.)
      if (type === 'email') {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Fetch profile for first name
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single()

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

      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
  }

  // Redirect to error page on failure
  return NextResponse.redirect(new URL('/auth-error?error=verification-failed', request.url))
}
