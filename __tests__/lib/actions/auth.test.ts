import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUp, signIn, resetPassword, updatePassword } from '@/lib/actions/auth'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`)
  }),
}))

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: vi.fn((key: string) => {
      if (key === 'host') return 'localhost:3000'
      return null
    }),
  })),
  cookies: vi.fn(async () => ({
    delete: vi.fn(),
    set: vi.fn(),
  })),
}))

// Mock Supabase
const mockSupabaseAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  updateUser: vi.fn(),
  getUser: vi.fn(),
}

const mockSupabaseFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
  })),
}))

// Mock Supabase JS for admin client
const mockAdminAuth = {
  admin: {
    generateLink: vi.fn(),
    getUserById: vi.fn(),
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: mockAdminAuth,
  })),
}))

// Mock email functions
vi.mock('@/lib/email/send', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
  sendPasswordResetEmail: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
}))

describe('Authentication Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should successfully sign up a new user and send verification email', async () => {
      const formData = new FormData()
      formData.append('fullName', 'John Doe')
      formData.append('email', 'john@example.com')
      formData.append('password', 'SecurePass123!')

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'john@example.com',
            email_confirmed_at: null,
          },
        },
        error: null,
      })

      mockAdminAuth.admin.generateLink.mockResolvedValue({
        data: {
          properties: {
            action_link: 'https://test.com/verify',
          },
        },
        error: null,
      })

      await expect(signUp(formData)).rejects.toThrow('REDIRECT:/verify-email')

      // Verify signup was called with correct data
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'SecurePass123!',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
          data: {
            full_name: 'John Doe',
            first_name: 'John',
            last_name: 'Doe',
          },
        },
      })

      // Verify verification link was generated
      expect(mockAdminAuth.admin.generateLink).toHaveBeenCalledWith({
        type: 'signup',
        email: 'john@example.com',
        password: 'SecurePass123!',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      })

      // Verify verification email was sent
      const { sendVerificationEmail } = await import('@/lib/email/send')
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        'john@example.com',
        'John',
        'https://test.com/verify'
      )
    })

    it('should handle signup errors gracefully', async () => {
      const formData = new FormData()
      formData.append('fullName', 'John Doe')
      formData.append('email', 'existing@example.com')
      formData.append('password', 'SecurePass123!')

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already exists' },
      })

      const result = await signUp(formData)

      expect(result).toEqual({ error: 'User already exists' })
    })

    it('should split full name correctly (first and last)', async () => {
      const formData = new FormData()
      formData.append('fullName', 'Mary Jane Watson')
      formData.append('email', 'mary@example.com')
      formData.append('password', 'SecurePass123!')

      mockSupabaseAuth.signUp.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'mary@example.com', email_confirmed_at: null },
        },
        error: null,
      })

      mockAdminAuth.admin.generateLink.mockResolvedValue({
        data: { properties: { action_link: 'https://test.com/verify' } },
        error: null,
      })

      await expect(signUp(formData)).rejects.toThrow('REDIRECT:/verify-email')

      expect(mockSupabaseAuth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            data: {
              full_name: 'Mary Jane Watson',
              first_name: 'Mary',
              last_name: 'Jane Watson',
            },
          }),
        })
      )
    })
  })

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const formData = new FormData()
      formData.append('email', 'user@example.com')
      formData.append('password', 'ValidPass123!')

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: { access_token: 'token' } },
        error: null,
      })

      await expect(signIn(formData)).rejects.toThrow('REDIRECT:/dashboard')

      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'ValidPass123!',
      })
    })

    it('should return error for invalid credentials', async () => {
      const formData = new FormData()
      formData.append('email', 'user@example.com')
      formData.append('password', 'WrongPassword')

      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      })

      const result = await signIn(formData)

      expect(result).toEqual({ error: 'Invalid email or password' })
    })
  })

  describe('resetPassword', () => {
    it('should generate reset link and send email successfully', async () => {
      const formData = new FormData()
      formData.append('email', 'user@example.com')

      mockAdminAuth.admin.generateLink.mockResolvedValue({
        data: {
          properties: {
            action_link: 'https://test.com/reset',
          },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { first_name: 'John' },
              error: null,
            }),
          }),
        }),
      })

      const result = await resetPassword(formData)

      expect(result).toEqual({ success: true })

      // Verify reset link was generated
      expect(mockAdminAuth.admin.generateLink).toHaveBeenCalledWith({
        type: 'recovery',
        email: 'user@example.com',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback?next=/update-password',
        },
      })

      // Verify reset email was sent
      const { sendPasswordResetEmail } = await import('@/lib/email/send')
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        'John',
        'https://test.com/reset'
      )
    })

    it('should use fallback name when user profile not found', async () => {
      const formData = new FormData()
      formData.append('email', 'newuser@example.com')

      mockAdminAuth.admin.generateLink.mockResolvedValue({
        data: {
          properties: {
            action_link: 'https://test.com/reset',
          },
        },
        error: null,
      })

      mockSupabaseFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile not found' },
            }),
          }),
        }),
      })

      const result = await resetPassword(formData)

      expect(result).toEqual({ success: true })

      const { sendPasswordResetEmail } = await import('@/lib/email/send')
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        'there', // Fallback name
        'https://test.com/reset'
      )
    })

    it('should always return success to prevent email enumeration', async () => {
      const formData = new FormData()
      formData.append('email', 'nonexistent@example.com')

      mockAdminAuth.admin.generateLink.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      const result = await resetPassword(formData)

      // Should still return success (security best practice)
      expect(result).toEqual({ success: true })
    })
  })

  describe('updatePassword', () => {
    it('should update password, delete cookie, sign out, and redirect', async () => {
      const mockDeleteCookie = vi.fn()
      const { cookies } = await import('next/headers')

      // Override the mock for this test
      vi.mocked(cookies).mockResolvedValue({
        delete: mockDeleteCookie,
        set: vi.fn(),
      } as any)

      const formData = new FormData()
      formData.append('password', 'NewSecurePass123!')

      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      })

      mockSupabaseAuth.signOut.mockResolvedValue({
        error: null,
      })

      await expect(updatePassword(formData)).rejects.toThrow(
        'REDIRECT:/login?message=password-updated'
      )

      // Verify password was updated
      expect(mockSupabaseAuth.updateUser).toHaveBeenCalledWith({
        password: 'NewSecurePass123!',
      })

      // Verify recovery cookie was deleted
      expect(mockDeleteCookie).toHaveBeenCalledWith('password_recovery_pending')

      // Verify user was signed out
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled()
    })

    it('should return error if password update fails', async () => {
      const formData = new FormData()
      formData.append('password', 'weak')

      mockSupabaseAuth.updateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password too weak' },
      })

      const result = await updatePassword(formData)

      expect(result).toEqual({ error: 'Password too weak' })

      // Verify sign out was NOT called on error
      expect(mockSupabaseAuth.signOut).not.toHaveBeenCalled()
    })
  })
})
