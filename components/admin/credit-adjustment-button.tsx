'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditAdjustmentDialog } from './credit-adjustment-dialog'
import { Plus, Minus } from 'lucide-react'

interface CreditAdjustmentButtonProps {
  userId: string
  type: 'add' | 'deduct'
}

export function CreditAdjustmentButton({ userId, type }: CreditAdjustmentButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        variant={type === 'add' ? 'default' : 'outline'}
        onClick={() => setDialogOpen(true)}
      >
        {type === 'add' ? (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Credits
          </>
        ) : (
          <>
            <Minus className="h-4 w-4 mr-2" />
            Deduct Credits
          </>
        )}
      </Button>

      <CreditAdjustmentDialog
        userId={userId}
        type={type}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
