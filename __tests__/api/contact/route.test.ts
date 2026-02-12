import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/contact/route'
import { NextRequest } from 'next/server'

// Mock email send function
vi.mock('@/lib/email/send', () => ({
  sendContactFormEmail: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
}))

describe('Contact API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/contact', () => {
    it('should return 400 for missing name', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          message: 'Test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name is required')
    })

    it('should return 400 for empty name', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: '   ',
          email: 'test@example.com',
          message: 'Test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Name is required')
    })

    it('should return 400 for missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          message: 'Test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Email is required')
    })

    it('should return 400 for invalid email format', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'invalid-email',
          message: 'Test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid email format')
    })

    it('should return 400 for missing message', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Message is required')
    })

    it('should return 200 for valid submission without subject', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'This is a test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Contact form submitted successfully')

      const { sendContactFormEmail } = await import('@/lib/email/send')
      expect(sendContactFormEmail).toHaveBeenCalledWith(
        'John Doe',
        'test@example.com',
        undefined,
        'This is a test message'
      )
    })

    it('should return 200 for valid submission with subject', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Jane Smith',
          email: 'jane@example.com',
          subject: 'Technical Support',
          message: 'I need help with my account',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      const { sendContactFormEmail } = await import('@/lib/email/send')
      expect(sendContactFormEmail).toHaveBeenCalledWith(
        'Jane Smith',
        'jane@example.com',
        'Technical Support',
        'I need help with my account'
      )
    })

    it('should trim whitespace from inputs', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: '  John Doe  ',
          email: '  test@example.com  ',
          subject: '  General Inquiry  ',
          message: '  Test message with enough characters  ',
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(200)

      const { sendContactFormEmail } = await import('@/lib/email/send')
      expect(sendContactFormEmail).toHaveBeenCalledWith(
        'John Doe',
        'test@example.com',
        'General Inquiry',
        'Test message with enough characters'
      )
    })

    it('should return 500 when email sending fails', async () => {
      const { sendContactFormEmail } = await import('@/lib/email/send')
      vi.mocked(sendContactFormEmail).mockRejectedValueOnce(new Error('Email service down'))

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          message: 'Test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send contact form. Please try again later.')
    })

    it('should return 400 for non-string subject', async () => {
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'test@example.com',
          subject: 123,
          message: 'Test message',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Subject must be a string')
    })
  })
})
