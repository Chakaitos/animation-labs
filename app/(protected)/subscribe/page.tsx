import { createClient } from '@/lib/supabase/server'
import { PLANS, type PlanId } from '@/lib/stripe/config'
import { SubscribePlanCard } from '@/components/SubscribePlanCard'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

// Plan pricing (displayed only - actual prices come from Stripe)
const PLAN_PRICES: Record<PlanId, string> = {
  starter: '$30',
  professional: '$75',
}

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/subscribe')
  }

  // Check if user already has an active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  const currentPlan = subscription?.plan as PlanId | undefined
  const hasActiveSubscription = !!subscription

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="AnimateLabs" width={120} height={32} />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {hasActiveSubscription && (
          <div className="max-w-4xl mx-auto mb-8 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Already subscribed?</strong> To change your plan, please use the{' '}
              <Link href="/billing" className="underline font-semibold">
                Manage Subscription
              </Link>{' '}
              button on your billing page. This ensures proper plan changes without duplicate charges.
            </p>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            {currentPlan ? 'Your Current Plan' : 'Choose Your Plan'}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get professional logo animations at a fraction of freelancer costs.
            All plans include access to all animation styles and email support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {(Object.entries(PLANS) as [PlanId, typeof PLANS.starter][]).map(([planId, plan]) => (
            <SubscribePlanCard
              key={planId}
              planId={planId}
              name={plan.name}
              description={plan.description}
              credits={plan.credits}
              features={plan.features}
              price={PLAN_PRICES[planId]}
              recommended={planId === 'professional'}
              currentPlan={currentPlan === planId}
              hasActiveSubscription={hasActiveSubscription}
            />
          ))}
        </div>

        {currentPlan && (
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Need to cancel or update payment method?{' '}
              <Link href="/billing" className="text-primary hover:underline">
                Go to Billing
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
