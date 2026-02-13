import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { History, ArrowUp, ArrowDown } from 'lucide-react'

interface CreditHistoryCardProps {
  transactions: Array<{
    id: string
    amount: number
    type: string
    description: string | null
    created_at: string
  }>
}

export function CreditHistoryCard({ transactions }: CreditHistoryCardProps) {
  const getTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      subscription: 'default',
      purchase: 'default',
      usage: 'outline',
      refund: 'secondary',
      bonus: 'default',
      expiry: 'outline',
    }

    return (
      <Badge variant={variants[type] || 'outline'}>
        {type}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Credit History ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No credit transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {transaction.amount > 0 ? (
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-600" />
                    )}
                    <p className="font-medium">
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount} credits
                    </p>
                    {getTypeBadge(transaction.type)}
                  </div>
                  {transaction.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {transaction.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(transaction.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
