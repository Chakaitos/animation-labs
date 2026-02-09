'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { CheckCircle2, XCircle, User, Calendar } from 'lucide-react'
import { approveRevisionRequest, denyRevisionRequest } from '@/lib/actions/revision'
import { toast } from 'sonner'

interface RevisionRequestCardProps {
  request: {
    id: string
    user_id: string
    video_id: string
    reason: string
    status: 'pending' | 'approved' | 'denied'
    requested_at: string
    videos: {
      id: string
      title?: string
      thumbnail_url?: string
      video_url?: string
      status: string
    }
    profiles: {
      id: string
      email: string
      first_name?: string
    }
  }
}

export function RevisionRequestCard({ request }: RevisionRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [showDenyForm, setShowDenyForm] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    const result = await approveRevisionRequest(request.id)
    setIsProcessing(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Revision credit approved and granted to user')
      window.location.reload()
    }
  }

  const handleDeny = async () => {
    if (adminNotes.trim().length < 10) {
      toast.error('Admin notes must be at least 10 characters')
      return
    }

    setIsProcessing(true)
    const result = await denyRevisionRequest(request.id, adminNotes)
    setIsProcessing(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Request denied')
      window.location.reload()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {request.videos?.title || 'Video Request'}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {request.profiles?.first_name || request.profiles?.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(request.requested_at).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>
          <Badge variant="secondary">Pending</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-[200px_1fr] gap-4">
          {/* Video Preview */}
          <div className="space-y-2">
            {request.videos?.thumbnail_url && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <Image
                  src={request.videos.thumbnail_url}
                  alt="Video thumbnail"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Status: <Badge variant="outline" className="ml-1">{request.videos?.status}</Badge>
            </div>
            {request.videos?.video_url && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href={request.videos.video_url} target="_blank" rel="noopener noreferrer">
                  View Video
                </a>
              </Button>
            )}
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">User's Reason:</p>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{request.reason}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">User Email:</p>
              <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
            </div>

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                {!showDenyForm ? (
                  <>
                    <Button
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Grant Credit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDenyForm(true)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Deny Request
                    </Button>
                  </>
                ) : (
                  <div className="w-full space-y-2">
                    <Label htmlFor={`admin-notes-${request.id}`}>
                      Admin Notes <span className="text-muted-foreground">(min 10 characters)</span>
                    </Label>
                    <Textarea
                      id={`admin-notes-${request.id}`}
                      placeholder="Explain why this request is being denied..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDenyForm(false)
                          setAdminNotes('')
                        }}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeny}
                        disabled={isProcessing || adminNotes.trim().length < 10}
                        className="flex-1"
                      >
                        Confirm Deny
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
