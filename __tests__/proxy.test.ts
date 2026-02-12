import { describe, it, expect, vi, beforeEach } from 'vitest'
import { proxy } from '../proxy'
import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase SSR
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}))

// Helper to create mock NextRequest
function createMockRequest(pathname: string, searchParams?: Record<string, string>, cookies?: Record<string, string>) {
  const url = new URL(pathname, 'http://localhost:3000')
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const request = new NextRequest(url)

  // Mock cookies
  if (cookies) {
    const cookieStore = new Map(Object.entries(cookies))
    request.cookies.has = vi.fn((name: string) => cookieStore.has(name))
    request.cookies.get = vi.fn((name: string) => ({ name, value: cookieStore.get(name) || '' }))
    request.cookies.getAll = vi.fn(() =>
      Array.from(cookieStore.entries()).map(([name, value]) => ({ name, value }))
    )
  }

  return request
}

describe('Proxy Middleware - Password Recovery Enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Bug Fix #1: New Signups Should NOT Redirect to Password Reset', () => {
    it('should allow new signup users to access dashboard (no recovery cookie)', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'newuser@test.com',
            created_at: new Date().toISOString(), // Just created
            updated_at: new Date().toISOString(), // Just created
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/dashboard')
      const response = await proxy(request)

      // Should NOT redirect (no recovery cookie = no enforcement)
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).not.toBe(307) // Not a redirect
    })

    it('should allow new signup users on /auth/callback to proceed', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'newuser@test.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/auth/callback', { type: 'signup' })
      const response = await proxy(request)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).not.toBe(307)
    })
  })

  describe('Bug Fix #2: Password Reset Flow Enforcement', () => {
    it('should set recovery cookie when landing on recovery callback', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@test.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/auth/callback', { next: '/update-password' })
      const response = await proxy(request)

      // Should set recovery cookie
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('password_recovery_pending=true')
    })

    it('should redirect to /update-password when recovery cookie exists and user tries to access other pages', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@test.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/dashboard', {}, { password_recovery_pending: 'true' })
      const response = await proxy(request)

      // Should redirect to update-password
      expect(response.status).toBe(307)
      expect(response.headers.get('location')).toContain('/update-password')
    })

    it('should NOT redirect when on /update-password page with recovery cookie', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@test.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/update-password', {}, { password_recovery_pending: 'true' })
      const response = await proxy(request)

      // Should NOT redirect (already on the update page)
      expect(response.status).not.toBe(307)
    })

    it('should NOT redirect after password update when cookie is deleted', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@test.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // Updated 2 min ago
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      // No recovery cookie (was deleted after password update)
      const request = createMockRequest('/dashboard')
      const response = await proxy(request)

      // Should NOT redirect (cookie deleted = enforcement stopped)
      expect(response.status).not.toBe(307)
    })
  })

  describe('Path Exclusions', () => {
    it('should not enforce recovery for /auth/* paths', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@test.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/auth/login', {}, { password_recovery_pending: 'true' })
      const response = await proxy(request)

      // Should NOT redirect (auth paths excluded)
      expect(response.status).not.toBe(307)
    })

    it('should not enforce recovery for /api/* paths', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@test.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/api/test', {}, { password_recovery_pending: 'true' })
      const response = await proxy(request)

      // Should NOT redirect (API paths excluded)
      expect(response.status).not.toBe(307)
    })

    it('should not enforce recovery for /_next/* paths', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'user@test.com',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/_next/static/test.js', {}, { password_recovery_pending: 'true' })
      const response = await proxy(request)

      // Should NOT redirect (Next.js paths excluded)
      expect(response.status).not.toBe(307)
    })
  })

  describe('No User Session', () => {
    it('should pass through when no user session exists', async () => {
      const { createServerClient } = await import('@supabase/ssr')
      const mockGetUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      })

      vi.mocked(createServerClient).mockReturnValue({
        auth: { getUser: mockGetUser },
      } as any)

      const request = createMockRequest('/dashboard')
      const response = await proxy(request)

      // Should pass through (no enforcement without user)
      expect(response.status).not.toBe(307)
    })
  })
})
