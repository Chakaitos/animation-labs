import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface RevenueChartProps {
  mrr: number
  arr: number
}

export function RevenueChart({ mrr, arr }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Overview
        </CardTitle>
        <CardDescription>
          Estimated revenue from active subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
            <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
            <p className="text-4xl font-bold mt-2">
              ${mrr.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              per month
            </p>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
            <p className="text-sm text-muted-foreground">Annual Recurring Revenue</p>
            <p className="text-4xl font-bold mt-2">
              ${arr.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              projected annually
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
