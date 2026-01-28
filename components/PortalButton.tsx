'use client'

import { Button } from '@/components/ui/button'
import { createPortalSession } from '@/lib/actions/billing'
import { ExternalLink } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'

export function PortalButton() {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const result = await createPortalSession()
      if (result?.error) {
        toast.error(result.error)
      }
      // Redirect happens in the action on success
    })
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? 'Opening...' : 'Manage Subscription'}
        <ExternalLink className="h-4 w-4 ml-2" />
      </Button>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Update payment method, change plan, or cancel
      </p>
    </>
  )
}
