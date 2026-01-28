import { getCreditBalance } from '@/lib/actions/billing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins } from 'lucide-react'

interface CreditBalanceProps {
  className?: string
}

export async function CreditBalance({ className }: CreditBalanceProps) {
  const result = await getCreditBalance()

  if (result.error || !result.balance) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Credits
          </CardTitle>
          <CardDescription>Unable to load balance</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const { balance } = result

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Credits
        </CardTitle>
        <CardDescription>Your available credits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-2">{balance.total}</div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Subscription:</span>
            <span className="font-medium">{balance.subscription}</span>
          </div>
          {balance.overage > 0 && (
            <div className="flex justify-between">
              <span>Purchased:</span>
              <span className="font-medium">{balance.overage}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
