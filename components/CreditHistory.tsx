import { getCreditHistory } from '@/lib/actions/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface CreditHistoryProps {
  className?: string
}

export async function CreditHistory({ className }: CreditHistoryProps) {
  const result = await getCreditHistory(10)

  if (result.error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Credit History</CardTitle>
          <CardDescription>Unable to load transaction history</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { transactions } = result

  if (!transactions || transactions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Credit History</CardTitle>
          <CardDescription>No transactions yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your credit transactions will appear here.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Credit History</CardTitle>
        <CardDescription>Recent credit transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tx.amount > 0 ? 'default' : 'secondary'}>
                  {tx.type}
                </Badge>
                <span className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
