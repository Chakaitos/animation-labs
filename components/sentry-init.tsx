'use client'

/**
 * Sentry Client Initialization Component
 *
 * This component ensures Sentry is initialized on the client side.
 * Import this once in the root layout to enable client-side error tracking.
 */

import { useEffect } from 'react'

export function SentryInit() {
  useEffect(() => {
    // Import the Sentry config to trigger initialization
    import('@/sentry.client.config').catch(err => {
      console.error('Failed to load Sentry client config:', err)
    })
  }, [])

  return null
}
