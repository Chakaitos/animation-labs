import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactPage from '@/app/contact/page'

// Mock Next.js components
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock theme provider
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    resolvedTheme: 'light',
  }),
}))

// Mock fetch
global.fetch = vi.fn()

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockReset()
  })

  it('renders all form fields correctly', () => {
    render(<ContactPage />)

    expect(screen.getByText('Get in Touch')).toBeDefined()
    expect(screen.getByLabelText(/Name/i)).toBeDefined()
    expect(screen.getByLabelText(/Email/i)).toBeDefined()
    expect(screen.getByLabelText(/Subject/i)).toBeDefined()
    expect(screen.getByLabelText(/Message/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Send Message/i })).toBeDefined()
  })

  it('shows FAQ section', () => {
    render(<ContactPage />)

    expect(screen.getByText('Frequently Asked Questions')).toBeDefined()
    expect(screen.getByText('Can I cancel anytime?')).toBeDefined()
  })

  it('shows alternative contact email', () => {
    render(<ContactPage />)

    expect(screen.getByText(/support@animationlabs.ai/i)).toBeDefined()
  })

  it('validates required fields on submit', async () => {
    render(<ContactPage />)

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    fireEvent.click(submitButton)

    // HTML5 validation will prevent submit
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('validates message minimum length', async () => {
    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Send Message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Short' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters long')).toBeDefined()
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits form successfully with all fields', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'Contact form submitted successfully' }),
    })

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Send Message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'This is a test message with enough characters' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@example.com',
          subject: undefined,
          message: 'This is a test message with enough characters',
        }),
      })
    })

    await waitFor(() => {
      expect(screen.getByText(/Thank you! We'll get back to you within 24 hours./i)).toBeDefined()
    })
  })

  it('submits form with subject selected', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement

    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'I need technical support with my account' } })

    // Note: Select component interaction would require more complex testing with shadcn/ui
    // For now, we'll test the basic submission

    const submitButton = screen.getByRole('button', { name: /Send Message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  it('displays error message on submission failure', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Email is required' }),
    })

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Send Message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message content' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeDefined()
    })
  })

  it('displays error message on network failure', async () => {
    ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Send Message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message content' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to send message. Please try again.')).toBeDefined()
    })
  })

  it('resets form after successful submission', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Send Message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message content' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(nameInput.value).toBe('')
      expect(emailInput.value).toBe('')
      expect(messageInput.value).toBe('')
    })
  })

  it('shows loading state during submission', async () => {
    ;(global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              }),
            100
          )
        )
    )

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Send Message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message content' } })

    fireEvent.click(submitButton)

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeDefined()
    })

    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/Thank you!/i)).toBeDefined()
    })
  })

  it('disables form inputs during submission', async () => {
    ;(global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              }),
            100
          )
        )
    )

    render(<ContactPage />)

    const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement
    const messageInput = screen.getByLabelText(/Message/i) as HTMLTextAreaElement
    const submitButton = screen.getByRole('button', { name: /Send Message/i })

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(messageInput, { target: { value: 'Test message content' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(nameInput.disabled).toBe(true)
      expect(emailInput.disabled).toBe(true)
      expect(messageInput.disabled).toBe(true)
      expect(submitButton.disabled).toBe(true)
    })
  })
})
