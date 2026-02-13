import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Video, Clock } from 'lucide-react'

interface UserVideosCardProps {
  videos: Array<{
    id: string
    brand_name: string
    status: string
    created_at: string
    credits_used: number
  }>
}

export function UserVideosCard({ videos }: UserVideosCardProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      processing: 'secondary',
      completed: 'default',
      failed: 'destructive',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Recent Videos ({videos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No videos created yet</p>
        ) : (
          <div className="space-y-3">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{video.brand_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(video.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    {video.credits_used} {video.credits_used === 1 ? 'credit' : 'credits'}
                  </p>
                  {getStatusBadge(video.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
