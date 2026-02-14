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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  // Regular protected route - show AppHeader
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <AppHeader user={user} creditBalance={creditBalance} isAdmin={isAdmin} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
