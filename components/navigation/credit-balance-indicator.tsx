'use client'

import { Coins, AlertCircle, CircleSlash } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CreditBalanceIndicatorProps {
  balance?: number
  className?: string
}

export function CreditBalanceIndicator({
  balance = 0,
  className,
}: CreditBalanceIndicatorProps) {
  // Determine state based on balance
  const isZero = balance === 0
  const isLow = balance > 0 && balance <= 5

  // Icon and tooltip based on state
  const getStateInfo = () => {
    if (isZero) {
      return {
        icon: CircleSlash,
        iconColor: 'text-red-500',
        tooltip: 'Buy credits to create videos',
      }
    }
    if (isLow) {
      return {
        icon: AlertCircle,
        iconColor: 'text-orange-500',
        tooltip: 'Running low — consider buying more',
      }
    }
    return {
      icon: Coins,
      iconColor: 'text-emerald-500',
      tooltip: `${balance} credits available`,
    }
  }

  const { icon: Icon, iconColor, tooltip } = getStateInfo()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md cursor-pointer',
              className
            )}
          >
            <Icon className={cn('h-4 w-4 shrink-0', iconColor)} />
            <span className="text-sm font-medium text-foreground tabular-nums">
              {balance}
            </span>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {balance === 1 ? 'credit' : 'credits'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
