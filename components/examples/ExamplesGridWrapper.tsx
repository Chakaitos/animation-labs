'use client'

import { useState } from 'react'
import { Example } from '@/app/examples/_data/examples'
import { ExamplesGrid } from './ExamplesGrid'
import { VideoDetailModal } from './VideoDetailModal'

interface ExamplesGridWrapperProps {
  examples: Example[]
}

export function ExamplesGridWrapper({ examples }: ExamplesGridWrapperProps) {
  const [selectedExample, setSelectedExample] = useState<Example | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleExampleClick = (example: Example) => {
    setSelectedExample(example)
    setIsModalOpen(true)
  }

  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open)
    if (!open) {
      // Small delay before clearing to allow modal animation to complete
      setTimeout(() => setSelectedExample(null), 150)
    }
  }

  return (
    <>
      <ExamplesGrid examples={examples} onExampleClick={handleExampleClick} />
      <VideoDetailModal
        example={selectedExample}
        open={isModalOpen}
        onOpenChange={handleModalChange}
      />
    </>
  )
}
