import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Activity, UserPlus, Video, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  type: 'user_signup' | 'video_created' | 'subscription_created'
  timestamp: string
  userId: string
  userEmail: string
  metadata?: {
    brand_name?: string
    plan?: string
    video_status?: string
  }
}

interface RecentActivityFeedProps {
  activities: ActivityItem[]
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <UserPlus className="h-4 w-4" />
      case 'video_created':
        return <Video className="h-4 w-4" />
      case 'subscription_created':
        return <DollarSign className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'user_signup':
        return 'signed up'
      case 'video_created':
        return `created video "${activity.metadata?.brand_name}"`
      case 'subscription_created':
        return `subscribed to ${activity.metadata?.plan} plan`
      default:
        return 'performed an action'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_signup':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
      case 'video_created':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
      case 'subscription_created':
        return 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-950/30 dark:text-gray-400'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link
                      href={`/admin/users/${activity.userId}`}
                      className="font-medium hover:underline"
                    >
                      {activity.userEmail}
                    </Link>{' '}
                    {getActivityText(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {activity.metadata?.video_status && (
                  <Badge variant="outline" className="ml-auto">
                    {activity.metadata.video_status}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
