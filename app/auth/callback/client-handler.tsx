'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Client-side auth callback handler
 *
 * Handles implicit flow where Supabase returns tokens in URL hash (#access_token=...)
 * Server-side callback can't see hash params, so we need client-side handling
 */
export function ClientAuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have hash params (implicit flow)
      if (typeof window === 'undefined') return

      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken) {
        console.log('Client: Processing implicit flow tokens from hash')

        const supabase = createClient()

        // Set the session using the tokens from the hash
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (error) {
          console.error('Client: Failed to set session:', error)
          router.push(`/auth-error?error=session-failed&message=${encodeURIComponent(error.message)}`)
          return
        }

        console.log('Client: Session set successfully, redirecting to:', next)

        // Clear hash and redirect
        router.push(next)
      }
    }

    handleAuthCallback()
  }, [router, next])

  return null // This component doesn't render anything
}
