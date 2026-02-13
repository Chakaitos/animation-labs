import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { User, Mail, Calendar, Shield } from 'lucide-react'

interface UserProfileCardProps {
  user: {
    id: string
    email: string
    full_name: string | null
    first_name: string | null
    role: string
    created_at: string
  }
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Name</p>
            <p className="font-medium">{user.full_name || 'Not provided'}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Role</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                {user.role}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Joined</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {formatDistanceToNow(new Date(user.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">User ID</p>
          <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
        </div>
      </CardContent>
    </Card>
  )
}
