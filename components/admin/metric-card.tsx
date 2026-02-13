import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: 'up' | 'down'
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: MetricCardProps) {
  const variantStyles = {
    default: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    success: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400',
    warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && (
              <div className="flex items-center gap-1 mt-2">
                {trend && (
                  <>
                    {trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </>
                )}
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', variantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
