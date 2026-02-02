import { Resend } from 'resend'

// Lazy-load client to avoid build errors when env vars not set
// Same pattern as stripe/client.ts (D-03-02-001)
export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    const client = new Resend(process.env.RESEND_API_KEY)
    return client[prop as keyof Resend]
  },
})
