import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface VideoStatusBadgeProps {
  status: VideoStatus
}

export function VideoStatusBadge({ status }: VideoStatusBadgeProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      label: 'Ready',
      variant: 'default' as const,
      spinning: false,
    },
    processing: {
      icon: Loader2,
      label: 'Processing',
      variant: 'secondary' as const,
      spinning: true,
    },
    pending: {
      icon: Loader2,
      label: 'Queued',
      variant: 'secondary' as const,
      spinning: false,
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      variant: 'destructive' as const,
      spinning: false,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant}>
      <Icon className={config.spinning ? 'animate-spin' : ''} />
      {config.label}
    </Badge>
  )
}
