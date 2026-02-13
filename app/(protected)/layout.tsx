import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/navigation/app-header'
import { Footer } from '@/components/marketing/Footer'
import { getCreditBalance } from '@/lib/actions/billing'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get credit balance
  const balanceResult = await getCreditBalance()
  const creditBalance = balanceResult.balance?.total ?? 0

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = !profileError && profile?.role === 'admin'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader user={user} creditBalance={creditBalance} isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
