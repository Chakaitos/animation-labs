'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { setSentryUser, clearSentryUser } from '@/lib/sentry/user-context'

/**
 * Sentry User Context Provider
 *
 * Automatically sets user context in Sentry when a user is authenticated.
 * This component:
 * - Checks for authenticated users on mount
 * - Fetches subscription data for context
 * - Sets user email, ID, and plan in Sentry
 * - Clears context on logout
 *
 * Add this to your root layout to enable automatic user context tracking.
 */
export function SentryUserProvider() {
  useEffect(() => {
    const supabase = createClient()

    // Set initial user context
    const setInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Fetch subscription data for context
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', user.id)
          .single()

        setSentryUser({
          id: user.id,
          email: user.email,
          plan: subscription?.plan as 'starter' | 'professional' | undefined,
          subscription_status: subscription?.status as 'active' | 'past_due' | 'cancelled' | undefined,
        })
      }
    }

    setInitialUser()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - set context
        const { data: userSubscription } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', session.user.id)
          .single()

        setSentryUser({
          id: session.user.id,
          email: session.user.email,
          plan: userSubscription?.plan as 'starter' | 'professional' | undefined,
          subscription_status: userSubscription?.status as 'active' | 'past_due' | 'cancelled' | undefined,
        })
      } else if (event === 'SIGNED_OUT') {
        // User signed out - clear context
        clearSentryUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null // This component doesn't render anything
}
