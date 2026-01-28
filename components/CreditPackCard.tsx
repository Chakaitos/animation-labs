'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { createCreditPackCheckout } from '@/lib/actions/checkout'
import type { CreditPackId } from '@/lib/stripe/config'

interface CreditPackCardProps {
  packId: CreditPackId
  name: string
  credits: number
  price: string
}

export function CreditPackCard({ packId, name, credits, price }: CreditPackCardProps) {
  const [isPending, startTransition] = useTransition()

  const handlePurchase = () => {
    startTransition(async () => {
      const result = await createCreditPackCheckout(packId)
      if (result?.error) {
        toast.error(result.error)
      }
      // Redirect happens in the action
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-2xl font-bold">{price}</span>
        </div>
        <Button
          className="w-full"
          variant="outline"
          onClick={handlePurchase}
          disabled={isPending}
        >
          {isPending ? 'Redirecting...' : 'Purchase'}
        </Button>
      </CardContent>
    </Card>
  )
}
