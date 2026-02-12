import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'

// Mock environment variables for tests
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.RESEND_API_KEY = 'test-resend-key'
  process.env.SUPABASE_WEBHOOK_SECRET = 'test-webhook-secret'
  process.env.NODE_ENV = 'test'
})

// Clean up after each test
afterEach(() => {
  // Reset any mocks if needed
})
