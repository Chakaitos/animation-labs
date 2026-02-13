import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink } from 'lucide-react'

interface UserData {
  id: string
  email: string
  full_name: string | null
  created_at: string
  role: string
  subscription?: {
    plan: string
    status: string
    credits_remaining: number
  } | null
}

interface UserTableProps {
  users: UserData[]
}

export function UserTable({ users }: UserTableProps) {
  const getPlanBadge = (plan?: string) => {
    if (!plan) return <Badge variant="outline">None</Badge>

    const variants: Record<string, 'default' | 'secondary'> = {
      starter: 'default',
      professional: 'secondary',
    }

    return (
      <Badge variant={variants[plan] || 'outline'}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const variants: Record<string, 'default' | 'destructive' | 'outline'> = {
      active: 'default',
      cancelled: 'outline',
      past_due: 'destructive',
      expired: 'outline',
    }

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.full_name || '-'}</TableCell>
                <TableCell>{getPlanBadge(user.subscription?.plan)}</TableCell>
                <TableCell>{getStatusBadge(user.subscription?.status)}</TableCell>
                <TableCell>
                  {user.subscription?.credits_remaining ?? '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/users/${user.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
