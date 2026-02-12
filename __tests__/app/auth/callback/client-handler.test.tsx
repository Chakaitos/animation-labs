import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { ClientAuthHandler } from '@/app/auth/callback/client-handler'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockSearchParams = {
  get: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

// Mock Supabase client
const mockSetSession = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      setSession: mockSetSession,
    },
  })),
}))

describe('ClientAuthHandler - Implicit Flow Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.get.mockReturnValue(null)

    // Reset window.location.hash
    Object.defineProperty(window, 'location', {
      value: {
        hash: '',
        href: 'http://localhost:3000/auth/callback',
      },
      writable: true,
    })
  })

  describe('Password Recovery Flow Detection', () => {
    it('should detect recovery flow from type=recovery in query params', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'type') return 'recovery'
        if (key === 'next') return '/dashboard'
        return null
      })

      // Simulate hash with access token (implicit flow)
      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith({
          access_token: 'test-token',
          refresh_token: 'test-refresh',
        })
        expect(mockPush).toHaveBeenCalledWith('/update-password')
      })
    })

    it('should detect recovery flow from type in hash params', async () => {
      mockSearchParams.get.mockReturnValue('/dashboard')

      // Type in hash (some flows)
      window.location.hash = '#access_token=test-token&refresh_token=test-refresh&type=recovery'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/update-password')
      })
    })

    it('should detect recovery flow from next param containing update-password', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'next') return '/update-password'
        return null
      })

      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/update-password')
      })
    })

    it('should detect recovery flow from next param containing reset-password', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'next') return '/reset-password'
        return null
      })

      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/update-password')
      })
    })
  })

  describe('Normal Flow (Non-Recovery)', () => {
    it('should redirect to next param for normal flow', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'next') return '/profile'
        return null
      })

      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile')
      })
    })

    it('should redirect to dashboard by default if no next param', async () => {
      mockSearchParams.get.mockReturnValue(null)

      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })
  })

  describe('Error Handling', () => {
    it('should redirect to error page when setSession fails', async () => {
      mockSearchParams.get.mockReturnValue('/dashboard')

      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: null,
        error: { message: 'Invalid session' },
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/auth-error?error=session-failed&message=Invalid%20session'
        )
      })
    })

    it('should not process if no access token in hash', async () => {
      mockSearchParams.get.mockReturnValue('/dashboard')

      // No hash params
      window.location.hash = ''

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockSetSession).not.toHaveBeenCalled()
        expect(mockPush).not.toHaveBeenCalled()
      })
    })

    it('should handle missing refresh token gracefully', async () => {
      mockSearchParams.get.mockReturnValue('/dashboard')

      // Only access token, no refresh token
      window.location.hash = '#access_token=test-token'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockSetSession).toHaveBeenCalledWith({
          access_token: 'test-token',
          refresh_token: '', // Empty string fallback
        })
      })
    })
  })

  describe('Bug Fix: Should NOT Flag Normal Signups as Recovery', () => {
    it('should redirect normal signup to dashboard, not update-password', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'type') return 'signup' // Normal signup
        if (key === 'next') return '/dashboard'
        return null
      })

      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        // Should go to dashboard, NOT update-password
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockPush).not.toHaveBeenCalledWith('/update-password')
      })
    })

    it('should NOT flag email verification as recovery', async () => {
      mockSearchParams.get.mockImplementation((key: string) => {
        if (key === 'type') return 'email' // Email verification
        return null
      })

      window.location.hash = '#access_token=test-token&refresh_token=test-refresh'

      mockSetSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })

      render(<ClientAuthHandler />)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockPush).not.toHaveBeenCalledWith('/update-password')
      })
    })
  })
})
