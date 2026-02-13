'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { UserMenu } from './user-menu'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Video,
  DollarSign,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminNavigationProps {
  user: User
}

export function AdminNavigation({ user }: AdminNavigationProps) {
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

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/admin/videos',
      label: 'Videos',
      icon: Video,
    },
    {
      href: '/admin/billing',
      label: 'Revenue',
      icon: DollarSign,
    },
  ]

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center">
            <Image
              src={logoSrc}
              alt="Animation Labs"
              width={200}
              height={53}
              priority
              key={currentTheme}
            />
          </Link>

          {/* Admin Badge */}
          <div className="px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">
            Admin Panel
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors border-b-2',
                    isActive(item.href)
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground hover:text-foreground border-transparent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Exit Admin & User Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Exit Admin
              </Link>
            </Button>
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
