// Subscription plan configuration
// Price IDs are environment-specific (test vs live mode)

export const PLANS = {
  starter: {
    name: 'Starter',
    description: '10 videos per month',
    credits: 10,
    priceId: process.env.STRIPE_PRICE_STARTER || '',
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
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
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

// Credit pack configuration for overage purchases
// Single credit: Available to all users (no subscription required)
// Credit packs: Require active subscription
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

// Helper to get plan by price ID (for webhook processing)
export function getPlanByPriceId(priceId: string): PlanId | null {
  for (const [planId, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return planId as PlanId
    }
  }
  return null
}

// Helper to get credit pack by price ID
export function getCreditPackByPriceId(priceId: string): CreditPackId | null {
  for (const [packId, pack] of Object.entries(CREDIT_PACKS)) {
    if (pack.priceId === priceId) {
      return packId as CreditPackId
    }
  }
  return null
}
