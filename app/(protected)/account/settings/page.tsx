import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ChangePasswordForm } from '@/components/auth/change-password-form'
import { UserMenu } from '@/components/navigation/user-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AccountSettingsPage() {
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
            <Image src="/AL_transparent_compact.png" alt="AnimateLabs" width={180} height={48} priority />
          </Link>
          <UserMenu user={user} />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Account Settings</h1>

        {/* Email Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Your email is used for login and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Contact support if you need to change your email address.
            </p>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
