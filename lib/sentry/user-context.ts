/**
 * Sentry User Context Utility
 *
 * Sets user information in Sentry for better error tracking and debugging.
 * Call this after user authentication to attach email, plan, and ID to all errors.
 */

import * as Sentry from '@sentry/nextjs'

export interface SentryUserContext {
  id: string // Supabase user ID
  email?: string // User email
  plan?: 'starter' | 'professional' // Subscription plan
  subscription_status?: 'active' | 'past_due' | 'cancelled' // Subscription status
}

/**
 * Set user context in Sentry
 *
 * Attaches user information to all subsequent errors and performance transactions.
 * This helps identify which users are affected by errors and prioritize fixes.
 *
 * @param user - User context to attach to Sentry
 *
 * @example
 * ```ts
 * // In auth callback or protected layout
 * import { setSentryUser } from '@/lib/sentry/user-context'
 *
 * const { data: { user } } = await supabase.auth.getUser()
 * const { data: subscription } = await supabase
 *   .from('subscriptions')
 *   .select('plan, status')
 *   .eq('user_id', user.id)
 *   .single()
 *
 * setSentryUser({
 *   id: user.id,
 *   email: user.email,
 *   plan: subscription?.plan,
 *   subscription_status: subscription?.status,
 * })
 * ```
 */
export function setSentryUser(user: SentryUserContext | null) {
  if (!user) {
    // Clear user context on logout
    Sentry.setUser(null)
    return
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
  })

  // Add subscription context as tags for filtering in Sentry dashboard
  if (user.plan) {
    Sentry.setTag('subscription_plan', user.plan)
  }

  if (user.subscription_status) {
    Sentry.setTag('subscription_status', user.subscription_status)
  }
}

/**
 * Clear user context from Sentry
 *
 * Call this on logout to remove user information from subsequent errors.
 *
 * @example
 * ```ts
 * import { clearSentryUser } from '@/lib/sentry/user-context'
 *
 * await supabase.auth.signOut()
 * clearSentryUser()
 * ```
 */
export function clearSentryUser() {
  Sentry.setUser(null)
  Sentry.setTag('subscription_plan', undefined)
  Sentry.setTag('subscription_status', undefined)
}
