'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { CreditBalanceIndicator } from './credit-balance-indicator'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  user: User
  creditBalance?: number
}

export function AppHeader({ user, creditBalance }: AppHeaderProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Animation Labs"
              width={150}
              height={40}
              priority
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
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Credit Balance & User Menu */}
          <div className="flex items-center gap-4">
            <CreditBalanceIndicator balance={creditBalance} />
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
