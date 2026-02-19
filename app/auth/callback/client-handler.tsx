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
  const type = searchParams.get('type')

  useEffect(() => {
    const supabase = createClient()

    // Use onAuthStateChange instead of reading the hash directly.
    // The Supabase client auto-processes the URL hash on init (detectSessionInUrl=true),
    // which clears the hash before a manual read would see it.
    // INITIAL_SESSION handles already-processed tokens; SIGNED_IN handles real-time sign-ins.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        console.log('Client: Auth state change detected, redirecting', { event, next })

        subscription.unsubscribe()

        const isRecovery = type === 'recovery' ||
                          next.includes('update-password') ||
                          next.includes('reset-password')

        if (isRecovery) {
          console.log('Client: Recovery flow detected, forcing password update')
          router.push('/update-password')
        } else {
          console.log('Client: Normal flow, redirecting to:', next)
          router.push(next)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, next, type])

  return null // This component doesn't render anything
}
