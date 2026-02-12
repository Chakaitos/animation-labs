import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Resend client - must be before imports
vi.mock('@/lib/email/client', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
}))

// Mock exponential-backoff
vi.mock('exponential-backoff', () => ({
  backOff: vi.fn((fn) => fn()),
}))

// Import after mocks
import { sendContactFormEmail } from '@/lib/email/send'
import { resend } from '@/lib/email/client'

const mockResendSend = vi.mocked(resend.emails.send)

describe('sendContactFormEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send email with all parameters', async () => {
    mockResendSend.mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null,
    })

    const result = await sendContactFormEmail(
      'John Doe',
      'john@example.com',
      'Technical Support',
      'I need help with my account'
    )

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Animation Labs <no-reply@animationlabs.ai>',
        to: 'support@animationlabs.ai',
        replyTo: 'john@example.com',
        subject: 'Contact Form: Technical Support',
      })
    )

    expect(result).toEqual({ id: 'test-email-id' })
  })

  it('should send email without subject', async () => {
    mockResendSend.mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null,
    })

    await sendContactFormEmail(
      'Jane Smith',
      'jane@example.com',
      undefined,
      'General inquiry message'
    )

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Contact Form: General Inquiry',
      })
    )
  })

  it('should throw on permanent email errors without retrying', async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: { message: 'invalid_email' },
    })

    await expect(
      sendContactFormEmail(
        'John Doe',
        'invalid@example.com',
        'Test',
        'Test message'
      )
    ).rejects.toThrow('Permanent email error: invalid_email')
  })

  it('should throw on domain verification errors without retrying', async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: { message: 'domain_not_verified' },
    })

    await expect(
      sendContactFormEmail(
        'John Doe',
        'test@example.com',
        'Test',
        'Test message'
      )
    ).rejects.toThrow('Permanent email error: domain_not_verified')
  })

  it('should throw on transient errors for retry', async () => {
    mockResendSend.mockResolvedValue({
      data: null,
      error: { message: 'Network timeout' },
    })

    await expect(
      sendContactFormEmail(
        'John Doe',
        'test@example.com',
        'Test',
        'Test message'
      )
    ).rejects.toThrow('Network timeout')
  })

  it('should use exponential backoff for retries', async () => {
    const { backOff } = await import('exponential-backoff')

    mockResendSend.mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null,
    })

    await sendContactFormEmail(
      'John Doe',
      'test@example.com',
      'Test',
      'Test message'
    )

    expect(backOff).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        numOfAttempts: 3,
        startingDelay: 1000,
        timeMultiple: 5,
        jitter: 'full',
      })
    )
  })

  it('should include contact email as replyTo', async () => {
    mockResendSend.mockResolvedValue({
      data: { id: 'test-email-id' },
      error: null,
    })

    await sendContactFormEmail(
      'John Doe',
      'john@example.com',
      'Billing',
      'I have a question'
    )

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'john@example.com',
      })
    )
  })
})
