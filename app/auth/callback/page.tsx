import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { sendWelcomeEmail } from '@/lib/email/send'
import { Suspense } from 'react'
import { ClientAuthHandler } from './client-handler'

/**
 * Auth callback page
 *
 * Handles two authentication flows:
 * 1. Server-side PKCE flow: token_hash + type in query params
 * 2. Client-side implicit flow: access_token in URL hash (handled by ClientAuthHandler)
 */
export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const token_hash = searchParams.token_hash as string | undefined
  const type = searchParams.type as EmailOtpType | undefined
  const next = (searchParams.next as string) ?? '/dashboard'
  const error_param = searchParams.error as string | undefined
  const error_description = searchParams.error_description as string | undefined

  console.log('Auth callback page:', {
    hasTokenHash: !!token_hash,
    type,
    next,
    error: error_param,
  })

  // Handle error from Supabase
  if (error_param) {
    redirect(`/auth-error?error=${error_param}&description=${error_description}`)
  }

  // Prevent open redirect attacks
  const redirectTo = typeof next === 'string' && next.startsWith('/') ? next : '/dashboard'

  // Try server-side PKCE flow first
  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (error) {
      console.error('Server: OTP verification failed:', error)
      redirect(`/auth-error?error=verification-failed&message=${encodeURIComponent(error.message)}`)
    }

    console.log('Server: OTP verified successfully:', { type })

    // Send welcome email for signup
    if (type === 'email' || type === 'signup') {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single()

        sendWelcomeEmail(
          user.email!,
          profile?.first_name || 'there'
        ).catch(err => {
          console.error('Failed to send welcome email:', err)
        })
      }
    }

    redirect(redirectTo)
  }

  // Check if session already exists (might be from previous auth)
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    console.log('Server: Existing session found, redirecting')
    redirect(redirectTo)
  }

  // No server-side auth data - render client-side handler for implicit flow
  console.log('Server: No auth data, rendering client-side handler')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-sm text-muted-foreground">Completing authentication...</p>
      </div>

      {/* Client-side handler for implicit flow (access_token in hash) */}
      <Suspense fallback={null}>
        <ClientAuthHandler />
      </Suspense>
    </div>
  )
}
