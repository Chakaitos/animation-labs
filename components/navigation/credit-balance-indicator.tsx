'use client'

import { Coins, AlertCircle, CircleSlash } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface CreditBalanceIndicatorProps {
  balance?: number
  revisionCredits?: number
  className?: string
}

export function CreditBalanceIndicator({
  balance = 0,
  revisionCredits = 0,
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
    <div className={cn('flex flex-col gap-1', className)}>
      {revisionCredits > 0 && (
        <Badge variant="default" className="w-fit bg-emerald-500 hover:bg-emerald-600">
          {revisionCredits} Revision Credit{revisionCredits !== 1 ? 's' : ''}
        </Badge>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer">
              <Icon className={cn('h-4 w-4', iconColor)} />
              <span className="text-sm font-medium text-foreground">
                {balance} {balance === 1 ? 'credit' : 'credits'}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
