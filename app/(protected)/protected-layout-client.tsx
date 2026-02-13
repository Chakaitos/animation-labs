'use client'

import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { AppHeader } from '@/components/navigation/app-header'
import { Footer } from '@/components/marketing/Footer'

interface ProtectedLayoutClientProps {
  user: User
  creditBalance: number
  isAdmin: boolean
  children: React.ReactNode
}

export function ProtectedLayoutClient({
  user,
  creditBalance,
  isAdmin,
  children,
}: ProtectedLayoutClientProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  // If admin route, just render children (admin layout handles its own header)
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    )
  }

  // Regular protected route - show AppHeader
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader user={user} creditBalance={creditBalance} isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
