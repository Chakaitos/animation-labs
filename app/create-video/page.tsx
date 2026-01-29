import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { createClient } from '@/lib/supabase/server'
import { getCreditBalance } from '@/lib/actions/billing'
import { CreateVideoForm } from './_components/CreateVideoForm'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/navigation/user-menu'

export const metadata: Metadata = {
  title: 'Create Video | AnimateLabs',
  description: 'Create a professional logo animation video',
}

export default async function CreateVideoPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login?redirect=/create-video')
  }

  // Check credit balance
  const creditResult = await getCreditBalance()
  const credits = creditResult.balance?.total ?? 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="AnimateLabs"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-semibold">AnimateLabs</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {credits} credit{credits !== 1 ? 's' : ''} available
            </span>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="mx-auto max-w-2xl">
          {credits === 0 ? (
            // No credits - show upgrade prompt
            <div className="text-center py-12">
              <h1 className="text-2xl font-semibold tracking-tight mb-2">No Credits Available</h1>
              <p className="text-muted-foreground mb-6">
                You need at least 1 credit to create a video. Upgrade your plan or purchase credits to continue.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
                <Button asChild>
                  <Link href="/billing">Get More Credits</Link>
                </Button>
              </div>
            </div>
          ) : (
            // Has credits - show form
            <CreateVideoForm />
          )}
        </div>
      </main>
    </div>
  )
}
