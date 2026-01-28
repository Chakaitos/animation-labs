import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/navigation/user-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  // IMPORTANT: Always use getUser(), not getSession() on server
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard">
            <Image src="/logo.svg" alt="AnimateLabs" width={120} height={32} priority />
          </Link>
          <UserMenu user={user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button disabled>Create Video</Button>
        </div>

        {/* Placeholder content */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Credits</CardTitle>
              <CardDescription>Your available credits</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Subscribe to get credits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Videos</CardTitle>
              <CardDescription>Your latest creations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No videos yet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.email?.split('@')[0]}!</CardTitle>
              <CardDescription>Get started with AnimateLabs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Subscribe to a plan to start creating professional logo animations.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
