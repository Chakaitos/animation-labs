'use client'

import { cn } from '@/lib/utils'

interface Step {
  number: number
  label: string
}

const STEPS: Step[] = [
  { number: 1, label: 'Upload Logo' },
  { number: 2, label: 'Details' },
  { number: 3, label: 'Style' },
  { number: 4, label: 'Review' },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <li key={step.number} className="relative flex-1">
            <div className="flex items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute left-0 right-1/2 top-4 h-0.5 -translate-y-1/2',
                    step.number <= currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute left-1/2 right-0 top-4 h-0.5 -translate-y-1/2',
                    step.number < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}

              {/* Step circle */}
              <div className="relative flex flex-col items-center flex-1">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold',
                    step.number < currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : step.number === currentStep
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {step.number < currentStep ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    step.number <= currentStep ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
