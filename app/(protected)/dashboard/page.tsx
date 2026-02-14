import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditBalance } from '@/components/CreditBalance'
import { VideoGridRealtime } from '@/components/videos/VideoGridRealtime'
import { EmptyVideosState } from '@/components/videos/empty-state'
import { Plus, Video, CreditCard } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // User is already authenticated by layout
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user has a subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, credits_remaining, overage_credits')
    .eq('user_id', user!.id)
    .single()

  const hasSubscription = subscription && subscription.status === 'active'

  // Get recent videos (limit 6 to fill 3-column desktop grid)
  const { data: recentVideos } = await supabase
    .from('videos')
    .select('id, brand_name, status, video_url, thumbnail_url, created_at, error_message, aspect_ratio')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Get video count for this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: videosThisMonth } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .gte('created_at', startOfMonth.toISOString())

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground truncate">
              Welcome back{user!.email ? `, ${user!.email.split('@')[0]}` : ''}!
            </p>
          </div>
          {hasSubscription && (
            <Button asChild className="w-full sm:w-auto shrink-0">
              <Link href="/create-video">
                <Plus className="h-4 w-4 mr-2" />
                Create Video
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {hasSubscription ? (
            <>
              <CreditBalance />
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Videos Created</CardTitle>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{videosThisMonth ?? 0}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">{subscription?.plan}</div>
                  <p className="text-xs text-muted-foreground">
                    <Link href="/billing" className="hover:underline">
                      Manage billing
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Get Started with Animation Labs</CardTitle>
                <CardDescription>
                  Subscribe to a plan to start creating professional logo animations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/subscribe">
                    View Plans
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Videos Section */}
        {hasSubscription && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Recent Videos</h2>
              {recentVideos && recentVideos.length > 0 && (
                <Button variant="ghost" asChild>
                  <Link href="/videos">View All</Link>
                </Button>
              )}
            </div>

            {recentVideos && recentVideos.length > 0 ? (
              <VideoGridRealtime
                userId={user!.id}
                initialVideos={recentVideos}
              />
            ) : (
              <EmptyVideosState />
            )}
          </div>
        )}
    </div>
  )
}
