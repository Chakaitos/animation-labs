import { getCreditBalance } from '@/lib/actions/billing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'

interface CreditBalanceProps {
  className?: string
}

export async function CreditBalance({ className }: CreditBalanceProps) {
  const result = await getCreditBalance()

  if (result.error || !result.balance) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground">Unable to load balance</p>
        </CardContent>
      </Card>
    )
  }

  const { balance } = result

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{balance.total}</div>
        {balance.total > 0 && (
          <p className="text-xs text-muted-foreground">
            {balance.subscription > 0 && `${balance.subscription} subscription`}
            {balance.subscription > 0 && balance.overage > 0 && ' + '}
            {balance.overage > 0 && `${balance.overage} bonus`}
          </p>
        )}
        {balance.total === 0 && (
          <p className="text-xs text-muted-foreground">
            No credits available
          </p>
        )}
      </CardContent>
    </Card>
  )
}
