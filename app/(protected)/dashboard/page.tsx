import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/navigation/user-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditBalance } from '@/components/CreditBalance'
import { VideoCard } from '@/components/videos/video-card'
import { EmptyVideosState } from '@/components/videos/empty-state'
import { Plus, Video, CreditCard } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  // IMPORTANT: Always use getUser(), not getSession() on server
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if user has a subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, credits_remaining, overage_credits')
    .eq('user_id', user.id)
    .single()

  const hasSubscription = subscription && subscription.status === 'active'

  // Get recent videos (limit 6 to fill 3-column desktop grid)
  const { data: recentVideos } = await supabase
    .from('videos')
    .select('id, brand_name, status, video_url, thumbnail_url, created_at, error_message, aspect_ratio')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Get video count for this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: videosThisMonth } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/AL_transparent_compact.png" alt="AnimateLabs" width={180} height={48} />
          </Link>
          <UserMenu user={user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
            </p>
          </div>
          {hasSubscription && (
            <Button asChild>
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
                <CardTitle>Get Started with AnimateLabs</CardTitle>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recentVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <EmptyVideosState />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
