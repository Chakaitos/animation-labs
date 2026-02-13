'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function UserSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

  const handleSearch = (value: string) => {
    setSearchValue(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set('search', value)
        params.delete('page') // Reset to first page on new search
      } else {
        params.delete('search')
      }
      router.push(`/admin/users?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by email or name..."
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
        disabled={isPending}
      />
    </div>
  )
}
