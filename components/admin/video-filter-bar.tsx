'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const FILTER_TABS = [
  { value: 'all', label: 'All Videos' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
  { value: 'completed', label: 'Completed' },
] as const

export function VideoFilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const currentStatus = searchParams.get('status') || 'all'

  const handleFilterChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      if (value === 'all') {
        params.delete('status')
      } else {
        params.set('status', value)
      }
      params.delete('page') // Reset to first page on filter change
      router.push(`/admin/videos?${params.toString()}`)
    })
  }

  return (
    <Tabs value={currentStatus} onValueChange={handleFilterChange}>
      <TabsList>
        {FILTER_TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={isPending}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
