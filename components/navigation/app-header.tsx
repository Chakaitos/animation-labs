'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { CreditBalanceIndicator } from './credit-balance-indicator'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

interface AppHeaderProps {
  user: User
  creditBalance?: number
  isAdmin?: boolean
}

export function AppHeader({ user, creditBalance, isAdmin }: AppHeaderProps) {
  const pathname = usePathname()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (resolvedTheme || theme) : 'light'
  const logoSrc = currentTheme === 'dark'
    ? '/AL_dark_mode.png'
    : '/AL_transparent_compact.png'

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Image
              src={logoSrc}
              alt="Animation Labs"
              width={200}
              height={53}
              priority
              key={currentTheme}
            />
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors border-b-2',
                isActive('/dashboard')
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              Dashboard
            </Link>

            <Button
              size="sm"
              asChild
              className="bg-[#10b981] hover:bg-[#059669] text-white"
            >
              <Link href="/create-video">Create Video</Link>
            </Button>

            <Link
              href="/billing"
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors border-b-2',
                isActive('/billing')
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              Billing
            </Link>

            {/* Admin Panel Link (only visible to admins) */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 px-3 py-2 ml-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-md transition-colors"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Credit Balance & User Menu */}
          <div className="flex items-center gap-4">
            {mounted && <CreditBalanceIndicator balance={creditBalance} />}
            {mounted && <UserMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  )
}
