'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { adjustUserCredits } from '@/lib/actions/admin-credits'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreditAdjustmentDialogProps {
  userId: string
  type: 'add' | 'deduct'
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreditAdjustmentDialog({
  userId,
  type,
  open,
  onOpenChange,
}: CreditAdjustmentDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [credits, setCredits] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const creditAmount = parseInt(credits)
    if (isNaN(creditAmount) || creditAmount <= 0) {
      setError('Please enter a valid number of credits')
      return
    }

    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a reason (at least 10 characters)')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('credits', String(type === 'add' ? creditAmount : -creditAmount))
      formData.append('reason', reason.trim())

      const result = await adjustUserCredits(formData)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(result.message || 'Credits adjusted successfully')
        setCredits('')
        setReason('')
        onOpenChange(false)
        router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'add' ? 'Add Credits' : 'Deduct Credits'}
          </DialogTitle>
          <DialogDescription>
            {type === 'add'
              ? 'Grant bonus credits to this user. This will be logged as a bonus transaction.'
              : 'Deduct credits from this user. This will be logged as a refund transaction.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Number of Credits</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="1000"
                placeholder="Enter number of credits"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (required)</Label>
              <Textarea
                id="reason"
                placeholder="Explain why you are adjusting credits (e.g., 'Support ticket #123 - refund for failed video')"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isPending}
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters. This will be logged in the credit history.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === 'add' ? 'Add Credits' : 'Deduct Credits'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
