// Subscription plan configuration
// Price IDs are environment-specific (test vs live mode)

export const PLANS = {
  starter: {
    name: 'Starter',
    description: '10 videos per month',
    credits: 10,
    monthly: {
      priceId: process.env.STRIPE_PRICE_STARTER || '',
      price: 30,
      displayPrice: '$30/month',
      rolloverCap: 0,
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_STARTER_ANNUAL || '',
      price: 300,
      displayPrice: '$300/year',
      rolloverCap: 3,
    },
    features: [
      '10 videos per month',
      'Standard quality (1080p)',
      'All animation styles',
      'Email support',
    ],
  },
  professional: {
    name: 'Professional',
    description: '30 videos per month',
    credits: 30,
    monthly: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
      price: 75,
      displayPrice: '$75/month',
      rolloverCap: 0,
    },
    annual: {
      priceId: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL || '',
      price: 750,
      displayPrice: '$750/year',
      rolloverCap: 10,
    },
    features: [
      '30 videos per month',
      'Premium quality (4K)',
      'All animation styles',
      'Priority email support',
      'Faster processing',
    ],
  },
} as const

export type PlanId = keyof typeof PLANS
export type BillingInterval = 'month' | 'year'

// Helper to get plan details by price ID (for webhook processing)
export function getPlanByPriceId(priceId: string): {
  planId: PlanId
  interval: BillingInterval
  rolloverCap: number
} | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.monthly.priceId === priceId) {
      return {
        planId: planId as PlanId,
        interval: 'month',
        rolloverCap: plan.monthly.rolloverCap,
      }
    }
    if (plan.annual.priceId === priceId) {
      return {
        planId: planId as PlanId,
        interval: 'year',
        rolloverCap: plan.annual.rolloverCap,
      }
    }
  }
  return null
}

// Keep existing credit pack config unchanged
export const CREDIT_PACKS = {
  single: {
    name: '1 Credit',
    credits: 1,
    priceId: process.env.STRIPE_PRICE_SINGLE_CREDIT || '',
    requiresSubscription: false,
  },
  small: {
    name: '5 Credits',
    credits: 5,
    priceId: process.env.STRIPE_PRICE_CREDITS_SMALL || '',
    requiresSubscription: true,
  },
  medium: {
    name: '10 Credits',
    credits: 10,
    priceId: process.env.STRIPE_PRICE_CREDITS_MEDIUM || '',
    requiresSubscription: true,
  },
  large: {
    name: '20 Credits',
    credits: 20,
    priceId: process.env.STRIPE_PRICE_CREDITS_LARGE || '',
    requiresSubscription: true,
  },
} as const

export type CreditPackId = keyof typeof CREDIT_PACKS

// Helper to get credit pack by price ID
export function getCreditPackByPriceId(priceId: string): CreditPackId | null {
  for (const [packId, pack] of Object.entries(CREDIT_PACKS)) {
    if (pack.priceId === priceId) {
      return packId as CreditPackId
    }
  }
  return null
}
