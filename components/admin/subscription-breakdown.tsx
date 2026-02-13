'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Users } from 'lucide-react'

interface SubscriptionBreakdownProps {
  data: {
    starter: number
    professional: number
  }
}

const COLORS = {
  starter: '#3b82f6', // blue
  professional: '#8b5cf6', // purple
}

export function SubscriptionBreakdown({ data }: SubscriptionBreakdownProps) {
  const chartData = [
    { name: 'Starter', value: data.starter, color: COLORS.starter },
    { name: 'Professional', value: data.professional, color: COLORS.professional },
  ]

  const total = data.starter + data.professional

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Subscription Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No active subscriptions</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Starter</p>
                <p className="text-2xl font-bold" style={{ color: COLORS.starter }}>
                  {data.starter}
                </p>
                <p className="text-xs text-muted-foreground">
                  {total > 0 ? Math.round((data.starter / total) * 100) : 0}%
                </p>
              </div>

              <div className="text-center p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground">Professional</p>
                <p className="text-2xl font-bold" style={{ color: COLORS.professional }}>
                  {data.professional}
                </p>
                <p className="text-xs text-muted-foreground">
                  {total > 0 ? Math.round((data.professional / total) * 100) : 0}%
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
