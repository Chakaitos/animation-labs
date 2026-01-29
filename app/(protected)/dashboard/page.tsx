import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/navigation/user-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditBalance } from '@/components/CreditBalance'
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="AnimateLabs" width={120} height={32} />
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
                  <div className="text-2xl font-bold">0</div>
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

        {/* Recent Videos Section (placeholder) */}
        {hasSubscription && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Videos</h2>
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No videos yet</p>
                  <p className="text-sm">Create your first logo animation to get started.</p>
                  <Button className="mt-4" asChild>
                    <Link href="/create-video">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Video
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
