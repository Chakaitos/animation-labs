'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User } from '@supabase/supabase-js'
import { UserMenu } from './user-menu'
import { CreditBalanceIndicator } from './credit-balance-indicator'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'

interface AppHeaderProps {
  user: User
  creditBalance?: number
  isAdmin?: boolean
}

export function AppHeader({ user, creditBalance, isAdmin }: AppHeaderProps) {
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

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Logo - responsive sizing */}
          <Link href="/dashboard" className="flex items-center shrink-0">
            <Image
              src={logoSrc}
              alt="Animation Labs"
              width={200}
              height={53}
              priority
              key={currentTheme}
              className="w-[140px] sm:w-[180px] md:w-[200px] h-auto"
            />
          </Link>

          {/* Admin Panel Link (only visible to admins) */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 bg-orange-50 dark:bg-orange-950/30 rounded-md transition-colors"
              title="Admin Panel"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Credit Balance & User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {mounted && <CreditBalanceIndicator balance={creditBalance} />}
            {mounted && <UserMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  )
}
