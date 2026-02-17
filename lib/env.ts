/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at application startup.
 * Fails fast with clear error messages if any variables are missing or invalid.
 *
 * This prevents silent failures in production where the app starts but
 * critical functionality is broken (e.g., payments, webhooks, email).
 */

import { z } from 'zod'

/**
 * Schema for public environment variables (NEXT_PUBLIC_*)
 * These are safe to expose to the client/browser
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Must be a valid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anon key is required')
    .startsWith('eyJ', 'Must be a valid Supabase anon key (JWT format)'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'Stripe publishable key is required')
    .regex(/^pk_(test|live)_/, 'Must start with pk_test_ or pk_live_'),
  NEXT_PUBLIC_APP_URL: z.string().url('Must be a valid app URL'),
})

/**
 * Schema for private environment variables (server-only)
 * These must NEVER be exposed to the client
 */
const privateEnvSchema = z.object({
  // Supabase
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required')
    .startsWith('eyJ', 'Must be a valid Supabase service role key (JWT format)'),
  SUPABASE_WEBHOOK_SECRET: z
    .string()
    .min(32, 'Webhook secret must be at least 32 characters (hex or Svix format accepted)'),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .min(1, 'Stripe secret key is required')
    .regex(/^sk_(test|live)_/, 'Must start with sk_test_ or sk_live_'),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'Stripe webhook secret is required')
    .startsWith('whsec_', 'Must start with whsec_'),

  // Stripe Price IDs - Subscription Plans
  STRIPE_PRICE_STARTER: z
    .string()
    .min(1, 'Starter monthly price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),
  STRIPE_PRICE_PROFESSIONAL: z
    .string()
    .min(1, 'Professional monthly price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),
  STRIPE_PRICE_STARTER_ANNUAL: z
    .string()
    .min(1, 'Starter annual price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),
  STRIPE_PRICE_PROFESSIONAL_ANNUAL: z
    .string()
    .min(1, 'Professional annual price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),

  // Stripe Price IDs - Credit Packs
  STRIPE_PRICE_SINGLE_CREDIT: z
    .string()
    .min(1, 'Single credit price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),
  STRIPE_PRICE_CREDITS_SMALL: z
    .string()
    .min(1, 'Small credit pack price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),
  STRIPE_PRICE_CREDITS_MEDIUM: z
    .string()
    .min(1, 'Medium credit pack price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),
  STRIPE_PRICE_CREDITS_LARGE: z
    .string()
    .min(1, 'Large credit pack price ID is required')
    .startsWith('price_', 'Must be a valid Stripe price ID'),

  // n8n
  N8N_WEBHOOK_URL: z.string().url('Must be a valid n8n webhook URL'),
  N8N_WEBHOOK_SECRET: z
    .string()
    .min(32, 'n8n webhook secret must be at least 32 characters (any secure string format accepted)'),

  // Resend
  RESEND_API_KEY: z
    .string()
    .min(1, 'Resend API key is required')
    .startsWith('re_', 'Must be a valid Resend API key'),

  // Anthropic Claude API (for AI Creative Direction Assistant - Optional)
  ANTHROPIC_API_KEY: z.string().min(1, 'Anthropic API key is required').optional(),

  // Upstash Redis (for AI rate limiting - Optional)
  UPSTASH_REDIS_REST_URL: z.string().url('Upstash Redis URL is required').optional(),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, 'Upstash Redis token is required').optional(),

  // AI Assistant Configuration (Optional)
  AI_ASSISTANT_ENABLED: z.enum(['true', 'false']).default('true').optional(),
  AI_RATE_LIMIT_MAX_REQUESTS: z.string().default('5').optional(),
})

/**
 * Combined schema for all environment variables
 */
const envSchema = z.object({
  ...publicEnvSchema.shape,
  ...privateEnvSchema.shape,
})

export type Env = z.infer<typeof envSchema>

/**
 * Validated environment variables
 * Only populated after validateEnv() is called
 */
let validatedEnv: Env | null = null

/**
 * Validate all environment variables at application startup
 *
 * @throws {Error} If any required variables are missing or invalid
 */
export function validateEnv(): Env {
  // Return cached result if already validated
  if (validatedEnv) {
    return validatedEnv
  }

  try {
    // Validate environment variables
    validatedEnv = envSchema.parse(process.env)

    console.log('✅ Environment validation successful')
    console.log('📋 Validated variables:', {
      supabase: '✓',
      stripe: '✓',
      n8n: '✓',
      resend: '✓',
      app: '✓',
    })

    return validatedEnv
  } catch (error) {
    // Format Zod validation errors for better readability
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => {
        const path = err.path.join('.')
        return `  ❌ ${path}: ${err.message}`
      })

      const errorMessage = [
        '',
        '═══════════════════════════════════════════════════════════════════',
        '🚨 ENVIRONMENT VARIABLE VALIDATION FAILED',
        '═══════════════════════════════════════════════════════════════════',
        '',
        'The following environment variables are missing or invalid:',
        '',
        ...errorMessages,
        '',
        '📝 To fix this:',
        '  1. Copy .env.example to .env.local',
        '  2. Fill in all required values',
        '  3. Restart the development server',
        '',
        '📚 See .env.example for documentation on each variable',
        '═══════════════════════════════════════════════════════════════════',
        '',
      ].join('\n')

      console.error(errorMessage)
      throw new Error('Environment validation failed - see error message above')
    }

    // Re-throw unexpected errors
    throw error
  }
}

/**
 * Get validated environment variables
 *
 * @throws {Error} If validateEnv() hasn't been called yet
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    throw new Error(
      'Environment variables not validated yet. Call validateEnv() first (should happen automatically in app/layout.tsx)'
    )
  }
  return validatedEnv
}
