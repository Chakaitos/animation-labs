import { createClient } from '@/lib/supabase/server'
import { MetricCard } from '@/components/admin/metric-card'
import { RecentActivityFeed } from '@/components/admin/recent-activity-feed'
import { Users, Video, DollarSign, Clock, AlertCircle, TrendingUp } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch all metrics in parallel
  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { data: subscriptionBreakdown },
    { count: totalVideos },
    { count: videosToday },
    { count: processingVideos },
    { count: failedVideos24h },
    { data: recentSignups },
    { data: recentVideos },
    { data: recentSubscriptions },
  ] = await Promise.all([
    // Total users
    supabase.from('profiles').select('*', { count: 'exact', head: true }),

    // Active subscriptions
    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),

    // Subscription breakdown by plan
    supabase
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active'),

    // Total videos
    supabase.from('videos').select('*', { count: 'exact', head: true }),

    // Videos created today
    supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]),

    // Processing queue
    supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing'),

    // Failed videos last 24h
    supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

    // Recent signups (last 10)
    supabase
      .from('profiles')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10),

    // Recent videos (last 10)
    supabase
      .from('videos')
      .select(`
        id,
        brand_name,
        status,
        created_at,
        user:profiles!inner(id, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10),

    // Recent subscriptions (last 10)
    supabase
      .from('subscriptions')
      .select(`
        id,
        plan,
        created_at,
        user:profiles!inner(id, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  // Calculate MRR and subscription breakdown
  const starterCount = subscriptionBreakdown?.filter((s) => s.plan === 'starter').length || 0
  const professionalCount = subscriptionBreakdown?.filter((s) => s.plan === 'professional').length || 0
  const mrr = starterCount * 9 + professionalCount * 29

  // Prepare recent activity feed
  const activities: any[] = []

  // Add recent signups
  recentSignups?.forEach((signup) => {
    activities.push({
      type: 'user_signup',
      timestamp: signup.created_at,
      userId: signup.id,
      userEmail: signup.email,
    })
  })

  // Add recent videos
  recentVideos?.forEach((video: any) => {
    activities.push({
      type: 'video_created',
      timestamp: video.created_at,
      userId: video.user.id,
      userEmail: video.user.email,
      metadata: {
        brand_name: video.brand_name,
        video_status: video.status,
      },
    })
  })

  // Add recent subscriptions
  recentSubscriptions?.forEach((sub: any) => {
    activities.push({
      type: 'subscription_created',
      timestamp: sub.created_at,
      userId: sub.user.id,
      userEmail: sub.user.email,
      metadata: {
        plan: sub.plan,
      },
    })
  })

  // Sort activities by timestamp (most recent first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const recentActivities = activities.slice(0, 10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Platform overview and key metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Users"
          value={totalUsers ?? 0}
          subtitle={`+${recentSignups?.length ?? 0} today`}
          icon={Users}
          variant="default"
        />

        <MetricCard
          title="Active Subscriptions"
          value={activeSubscriptions ?? 0}
          subtitle={`${starterCount} Starter, ${professionalCount} Professional`}
          icon={TrendingUp}
          variant="success"
        />

        <MetricCard
          title="Estimated MRR"
          value={`$${mrr.toLocaleString()}`}
          subtitle="Monthly recurring revenue"
          icon={DollarSign}
          variant="default"
        />

        <MetricCard
          title="Videos Created"
          value={totalVideos ?? 0}
          subtitle={`+${videosToday ?? 0} today`}
          icon={Video}
          variant="default"
        />

        <MetricCard
          title="Processing Queue"
          value={processingVideos ?? 0}
          subtitle="Currently processing"
          icon={Clock}
          variant={processingVideos && processingVideos > 5 ? 'warning' : 'default'}
        />

        <MetricCard
          title="Failed Videos (24h)"
          value={failedVideos24h ?? 0}
          subtitle="Last 24 hours"
          icon={AlertCircle}
          variant={failedVideos24h && failedVideos24h > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed activities={recentActivities} />
    </div>
  )
}
