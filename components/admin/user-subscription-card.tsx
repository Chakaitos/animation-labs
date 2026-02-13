import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CreditCard, Calendar, Coins } from 'lucide-react'

interface UserSubscriptionCardProps {
  subscription: {
    plan: string
    status: string
    credits_remaining: number
    credits_total: number
    current_period_start: string | null
    current_period_end: string | null
    stripe_customer_id: string | null
  } | null
}

export function UserSubscriptionCard({ subscription }: UserSubscriptionCardProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active subscription</p>
        </CardContent>
      </Card>
    )
  }

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, 'default' | 'secondary'> = {
      starter: 'default',
      professional: 'secondary',
    }

    return (
      <Badge variant={variants[plan] || 'outline'}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline'> = {
      active: 'default',
      cancelled: 'outline',
      past_due: 'destructive',
      expired: 'outline',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Plan</p>
            {getPlanBadge(subscription.plan)}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            {getStatusBadge(subscription.status)}
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Credits Remaining</p>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium text-lg">
                {subscription.credits_remaining} / {subscription.credits_total}
              </p>
            </div>
          </div>

          {subscription.current_period_start && subscription.current_period_end && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Billing Period</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  {format(new Date(subscription.current_period_start), 'MMM d')} -{' '}
                  {format(new Date(subscription.current_period_end), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          )}
        </div>

        {subscription.stripe_customer_id && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Stripe Customer ID</p>
            <p className="font-mono text-xs text-muted-foreground">
              {subscription.stripe_customer_id}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
