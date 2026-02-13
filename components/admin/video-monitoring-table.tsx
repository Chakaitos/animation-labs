import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { ExternalLink, AlertCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface VideoData {
  id: string
  brand_name: string
  status: string
  created_at: string
  error_message: string | null
  user: {
    id: string
    email: string
  }
}

interface VideoMonitoringTableProps {
  videos: VideoData[]
}

export function VideoMonitoringTable({ videos }: VideoMonitoringTableProps) {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Brand</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Error</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No videos found
              </TableCell>
            </TableRow>
          ) : (
            videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="font-medium">{video.brand_name}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/users/${video.user.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {video.user.email}
                  </Link>
                </TableCell>
                <TableCell>{getStatusBadge(video.status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(video.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {video.error_message ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{video.error_message}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/users/${video.user.id}`}
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View User
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
