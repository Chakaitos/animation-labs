import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppHeader } from '@/components/navigation/app-header'
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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={user} creditBalance={creditBalance} />
      <main>{children}</main>
    </div>
  )
}
