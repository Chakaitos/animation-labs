'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { createSubscriptionCheckout } from '@/lib/actions/checkout'
import type { PlanId } from '@/lib/stripe/config'

interface SubscribePlanCardProps {
  planId: PlanId
  name: string
  description: string
  credits: number
  features: readonly string[]
  price: string
  recommended?: boolean
  currentPlan?: boolean
}

export function SubscribePlanCard({
  planId,
  name,
  description,
  credits,
  features,
  price,
  recommended = false,
  currentPlan = false,
}: SubscribePlanCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubscribe = () => {
    startTransition(async () => {
      const result = await createSubscriptionCheckout(planId)
      if (result?.error) {
        toast.error(result.error)
      }
      // Redirect happens in the action
    })
  }

  return (
    <Card className={`relative flex flex-col ${recommended ? 'border-primary shadow-lg' : ''}`}>
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Recommended
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {currentPlan ? (
          <Button className="w-full" variant="outline" disabled>
            Current Plan
          </Button>
        ) : (
          <Button
            className="w-full"
            variant={recommended ? 'default' : 'outline'}
            onClick={handleSubscribe}
            disabled={isPending}
          >
            {isPending ? 'Redirecting...' : 'Subscribe'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
