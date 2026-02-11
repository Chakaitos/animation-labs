'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UpgradeToAnnualButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!confirm('Upgrade to annual billing? You\'ll be charged a prorated amount for the remaining time in your current billing period, then billed annually going forward.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/billing/upgrade-to-annual', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Successfully upgraded to annual billing! Your subscription will update shortly.')
        // Refresh the page to show updated subscription
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast.error(data.error || 'Failed to upgrade subscription')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error('Failed to upgrade subscription. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleUpgrade}
      disabled={isLoading}
    >
      {isLoading ? 'Upgrading...' : 'Upgrade to Annual (Save 17%)'}
    </Button>
  )
}
