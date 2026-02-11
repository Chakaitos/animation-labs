import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditPackCard } from '@/components/CreditPackCard'
import { CreditHistory } from '@/components/CreditHistory'
import { CreditBalance } from '@/components/CreditBalance'
import { PortalButton } from '@/components/PortalButton'
import { UpgradeToAnnualButton } from '@/components/UpgradeToAnnualButton'
import { CREDIT_PACKS, type CreditPackId } from '@/lib/stripe/config'
import { getSubscription } from '@/lib/actions/billing'
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

// Credit pack pricing (displayed only - actual prices from Stripe)
const PACK_PRICES: Record<CreditPackId, string> = {
  single: '$5',
  small: '$20',
  medium: '$35',
  large: '$65',
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/billing')
  }

  const result = await getSubscription()
  const subscription = result.subscription

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="text-muted-foreground">Manage your subscription and credits</p>
          </div>
        </div>

        {/* No Subscription State */}
        {!subscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                No Active Subscription
              </CardTitle>
              <CardDescription>
                Subscribe to a plan to start creating logo animations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/subscribe">View Plans</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Current Subscription */}
        {subscription && (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Plan Details */}
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold">{subscription.planName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-semibold capitalize">{subscription.billingInterval === 'year' ? 'Annual' : 'Monthly'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                    {subscription.status}
                  </Badge>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Renews</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <PortalButton />
                </div>
              </CardContent>
            </Card>

            {/* Credit Balance */}
            <div className="space-y-4">
              <CreditBalance />
              {subscription.billingInterval === 'month' && (
                <Card>
                  <CardContent className="pt-6">
                    <UpgradeToAnnualButton />
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardContent className="pt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/subscribe">
                      {subscription.plan === 'starter' ? 'Upgrade to Professional' : 'Change Plan'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Single Credit - Available to All Users */}
        {!subscription && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Buy Credits</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Purchase a single credit to try our service, or subscribe to a plan for better value.
            </p>
            <div className="max-w-xs">
              <CreditPackCard
                packId="single"
                name={CREDIT_PACKS.single.name}
                credits={CREDIT_PACKS.single.credits}
                price={PACK_PRICES.single}
              />
            </div>
          </div>
        )}

        {/* Credit Packs - Requires Active Subscription */}
        {subscription && subscription.status === 'active' && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Buy More Credits</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Need more credits this month? Purchase a credit pack. These credits don&apos;t expire and carry over between billing periods.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {(Object.entries(CREDIT_PACKS) as [CreditPackId, typeof CREDIT_PACKS.small][])
                .filter(([packId, pack]) => pack.requiresSubscription)
                .map(([packId, pack]) => (
                  <CreditPackCard
                    key={packId}
                    packId={packId}
                    name={pack.name}
                    credits={pack.credits}
                    price={PACK_PRICES[packId]}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Credit History */}
        {subscription && <CreditHistory />}
    </div>
  )
}
