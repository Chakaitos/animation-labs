import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserRevisionRequests } from '@/lib/actions/revision'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function RevisionRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getUserRevisionRequests()

  if (result.error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-destructive">Failed to load revision requests</p>
      </div>
    )
  }

  const requests = result.data || []

  const getStatusConfig = (status: 'pending' | 'approved' | 'denied') => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Review',
          variant: 'secondary' as const,
          icon: Clock,
          color: 'text-yellow-500',
        }
      case 'approved':
        return {
          label: 'Approved',
          variant: 'default' as const,
          icon: CheckCircle2,
          color: 'text-emerald-500',
        }
      case 'denied':
        return {
          label: 'Denied',
          variant: 'destructive' as const,
          icon: AlertCircle,
          color: 'text-red-500',
        }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/videos">
            <ArrowLeft className="h-4 w-4" />
            Back to Videos
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Revision Requests</h1>
        <p className="text-muted-foreground">
          View all your revision credit requests and their status
        </p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No revision requests yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Request revision credits for videos with quality issues from your video library
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => {
            const statusConfig = getStatusConfig(request.status)
            const Icon = statusConfig.icon

            return (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {request.videos?.title || 'Video Request'}
                      </CardTitle>
                      <CardDescription>
                        Requested {new Date(request.requested_at).toLocaleDateString()} at{' '}
                        {new Date(request.requested_at).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <Badge variant={statusConfig.variant} className="gap-1">
                      <Icon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-[200px_1fr] gap-4">
                    {/* Video Thumbnail */}
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

                    {/* Request Details */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Reason for Request:</p>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>

                      {request.status === 'approved' && request.reviewed_at && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
                          <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="inline h-4 w-4 mr-1" />
                            Approved on {new Date(request.reviewed_at).toLocaleDateString()}
                            <br />
                            <span className="text-xs">1 revision credit has been added to your account</span>
                          </p>
                        </div>
                      )}

                      {request.status === 'denied' && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                          <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                            <AlertCircle className="inline h-4 w-4 mr-1" />
                            Request Denied
                          </p>
                          {request.admin_notes && (
                            <p className="text-sm text-red-600 dark:text-red-500">
                              Admin: {request.admin_notes}
                            </p>
                          )}
                          {request.reviewed_at && (
                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                              Reviewed on {new Date(request.reviewed_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
