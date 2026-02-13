import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/admin/metric-card'
import { SubscriptionBreakdown } from '@/components/admin/subscription-breakdown'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { DollarSign, TrendingUp, Users, CreditCard } from 'lucide-react'

export default async function BillingPage() {
  const supabase = await createClient()

  // Fetch subscription data
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('status', 'active')

  // Calculate subscription breakdown
  const starterCount = subscriptions?.filter((s) => s.plan === 'starter').length || 0
  const professionalCount = subscriptions?.filter((s) => s.plan === 'professional').length || 0
  const totalActive = starterCount + professionalCount

  // Calculate revenue
  // Starter: $9/month, Professional: $29/month
  const mrr = starterCount * 9 + professionalCount * 29
  const arr = mrr * 12

  // Fetch credit pack purchases (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: creditPackPurchases } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('type', 'purchase')
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Assuming $1 per credit for credit pack purchases (adjust based on actual pricing)
  const creditPackRevenue = creditPackPurchases?.reduce((sum, tx) => sum + tx.amount, 0) || 0

  // Fetch all-time metrics
  const [
    { count: totalSubscriptionsAllTime },
    { count: cancelledSubscriptions },
  ] = await Promise.all([
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
  ])

  const retentionRate = totalSubscriptionsAllTime
    ? (((totalSubscriptionsAllTime - (cancelledSubscriptions || 0)) / totalSubscriptionsAllTime) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Revenue Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Financial metrics and subscription insights
        </p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={`$${mrr.toLocaleString()}`}
          subtitle="Active subscriptions"
          icon={DollarSign}
          variant="success"
        />

        <MetricCard
          title="Annual Recurring Revenue"
          value={`$${arr.toLocaleString()}`}
          subtitle="Projected annually"
          icon={TrendingUp}
          variant="default"
        />

        <MetricCard
          title="Active Subscriptions"
          value={totalActive}
          subtitle={`${starterCount} Starter, ${professionalCount} Pro`}
          icon={Users}
          variant="default"
        />

        <MetricCard
          title="Credit Packs (30d)"
          value={creditPackRevenue}
          subtitle="Additional revenue"
          icon={CreditCard}
          variant="default"
        />
      </div>

      {/* Charts and Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart mrr={mrr} arr={arr} />
        <SubscriptionBreakdown
          data={{
            starter: starterCount,
            professional: professionalCount,
          }}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Average Revenue Per User</p>
          <p className="text-2xl font-bold mt-2">
            ${totalActive > 0 ? (mrr / totalActive).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per month</p>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Total Subscriptions</p>
          <p className="text-2xl font-bold mt-2">{totalSubscriptionsAllTime ?? 0}</p>
          <p className="text-xs text-muted-foreground mt-1">all-time</p>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <p className="text-sm text-muted-foreground">Retention Rate</p>
          <p className="text-2xl font-bold mt-2">{retentionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {cancelledSubscriptions ?? 0} cancelled
          </p>
        </div>
      </div>
    </div>
  )
}
