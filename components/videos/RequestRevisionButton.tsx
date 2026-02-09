'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { submitRevisionRequest } from '@/lib/actions/revision'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface RequestRevisionButtonProps {
  videoId: string
  existingRequest?: {
    id: string
    status: 'pending' | 'approved' | 'denied'
    reason?: string
  } | null
  availableCredits: number
  totalCredits: number
}

export function RequestRevisionButton({
  videoId,
  existingRequest,
  availableCredits,
  totalCredits,
}: RequestRevisionButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canRequest = !existingRequest && availableCredits < totalCredits

  const handleSubmit = async () => {
    if (reason.trim().length < 20) {
      toast.error('Reason must be at least 20 characters')
      return
    }

    setIsSubmitting(true)
    const result = await submitRevisionRequest(videoId, reason)
    setIsSubmitting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Revision request submitted successfully! An admin will review it shortly.')
      setOpen(false)
      setReason('')
      // Refresh the page to show the new request status
      window.location.reload()
    }
  }

  // Show status badge if request exists
  if (existingRequest) {
    const statusConfig = {
      pending: { label: 'Pending Review', variant: 'secondary' as const, icon: AlertCircle },
      approved: { label: 'Approved', variant: 'default' as const, icon: CheckCircle2 },
      denied: { label: 'Denied', variant: 'destructive' as const, icon: AlertCircle },
    }

    const config = statusConfig[existingRequest.status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  // Don't show button if no allocation available
  if (availableCredits >= totalCredits) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Request Revision Credit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Request Revision Credit</DialogTitle>
          <DialogDescription>
            If your video has technical quality issues (distortions, rendering problems, etc.),
            you can request a revision credit. Our team will review your request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
            <div className="text-sm">
              <div className="font-medium">Available Revision Credits</div>
              <div className="text-muted-foreground">
                {totalCredits - availableCredits} remaining this billing period
              </div>
            </div>
            <div className="text-2xl font-bold">
              {totalCredits - availableCredits}/{totalCredits}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">
              Describe the quality issue <span className="text-muted-foreground">(min 20 characters)</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Example: The logo appears distorted in the second half of the video, with visible pixelation and color artifacts."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {reason.length}/20 characters minimum
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || reason.trim().length < 20}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
