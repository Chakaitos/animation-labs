'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function UserSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Debounced search - only triggers after user stops typing for 500ms
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams)
        if (searchValue.trim()) {
          params.set('search', searchValue.trim())
          params.delete('page') // Reset to first page on new search
        } else {
          params.delete('search')
          params.delete('page')
        }
        router.push(`/admin/users?${params.toString()}`)
      })
    }, 500) // Wait 500ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [searchValue, router, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by email or name..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10"
        disabled={isPending}
      />
      {isPending && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          Searching...
        </span>
      )}
    </div>
  )
}
