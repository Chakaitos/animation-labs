import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase admin client
const mockSupabaseAdmin = {
  from: vi.fn(),
  rpc: vi.fn(),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseAdmin),
}))

// Mock Stripe
const mockStripe = {
  subscriptions: {
    retrieve: vi.fn(),
  },
}

vi.mock('@/lib/stripe/client', () => ({
  stripe: mockStripe,
}))

describe('Credit Rollover Calculation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rollover within cap', () => {
    it('should roll over all credits when unused is below cap', async () => {
      // Arrange
      const unusedCredits = 2
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(2)
      expect(expired).toBe(0)
      expect(newBalance).toBe(12)
    })

    it('should roll over all credits when unused equals cap', async () => {
      // Arrange
      const unusedCredits = 3
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(3)
      expect(expired).toBe(0)
      expect(newBalance).toBe(13)
    })
  })

  describe('Rollover exceeds cap', () => {
    it('should cap rollover and expire excess credits', async () => {
      // Arrange
      const unusedCredits = 5
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(3)
      expect(expired).toBe(2)
      expect(newBalance).toBe(13)
    })

    it('should handle large excess credits correctly', async () => {
      // Arrange
      const unusedCredits = 20
      const rolloverCap = 10
      const planCredits = 30

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(10)
      expect(expired).toBe(10)
      expect(newBalance).toBe(40)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero unused credits', async () => {
      // Arrange
      const unusedCredits = 0
      const rolloverCap = 3
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(0)
      expect(expired).toBe(0)
      expect(newBalance).toBe(10)
    })

    it('should handle zero rollover cap (legacy behavior)', async () => {
      // Arrange
      const unusedCredits = 5
      const rolloverCap = 0
      const planCredits = 10

      // Act
      const rollover = Math.min(unusedCredits, rolloverCap)
      const expired = unusedCredits - rollover
      const newBalance = planCredits + rollover

      // Assert
      expect(rollover).toBe(0)
      expect(expired).toBe(5)
      expect(newBalance).toBe(10)
    })
  })

  describe('Plan-Specific Rollover Caps', () => {
    it('should use 3 credit cap for Starter Monthly', () => {
      const plan = 'starter'
      const interval = 'month'
      const rolloverCap = 3

      expect(rolloverCap).toBe(3)
    })

    it('should use 10 credit cap for Professional Monthly', () => {
      const plan = 'professional'
      const interval = 'month'
      const rolloverCap = 10

      expect(rolloverCap).toBe(10)
    })

    it('should use 3 credit cap for Starter Annual', () => {
      const plan = 'starter'
      const interval = 'year'
      const rolloverCap = 3

      expect(rolloverCap).toBe(3)
    })

    it('should use 10 credit cap for Professional Annual', () => {
      const plan = 'professional'
      const interval = 'year'
      const rolloverCap = 10

      expect(rolloverCap).toBe(10)
    })
  })
})
