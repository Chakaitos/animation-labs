#!/usr/bin/env node
/**
 * Stripe Live Mode Setup Script
 *
 * Creates all required products and prices in Stripe live mode.
 * Run this script AFTER your Stripe account is fully activated.
 *
 * Usage:
 *   # Dry run (preview changes without creating anything)
 *   npm run stripe:setup -- --dry-run
 *
 *   # Create products in live mode
 *   npm run stripe:setup
 *
 * Prerequisites:
 *   1. Stripe account fully activated (business info, banking, identity)
 *   2. STRIPE_SECRET_KEY set to your LIVE mode secret key (sk_live_...)
 *   3. Install dependencies: npm install
 */

import Stripe from 'stripe'
import * as readline from 'readline'

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
}

const isDryRun = process.argv.includes('--dry-run')

// Check for live mode secret key
const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey) {
  console.error(`${colors.red}❌ Error: STRIPE_SECRET_KEY environment variable not set${colors.reset}`)
  console.log('\nSet it temporarily for this script:')
  console.log(`${colors.cyan}STRIPE_SECRET_KEY=sk_live_xxxxx npm run stripe:setup${colors.reset}\n`)
  process.exit(1)
}

if (!secretKey.startsWith('sk_live_')) {
  console.error(`${colors.red}❌ Error: STRIPE_SECRET_KEY must start with sk_live_ (currently: ${secretKey.substring(0, 10)}...)${colors.reset}`)
  console.log('\nThis script is for LIVE mode only. Do not use test keys.')
  process.exit(1)
}

const stripe = new Stripe(secretKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Product definitions matching your application
const PRODUCTS = [
  {
    name: 'Starter Plan',
    description: 'Perfect for individuals and small teams getting started with logo animations',
    metadata: {
      plan_id: 'starter',
      credits: '10',
    },
    prices: [
      {
        nickname: 'Starter Monthly',
        unit_amount: 3000, // $30.00
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { interval: 'month', rollover_cap: '3' },
      },
      {
        nickname: 'Starter Annual',
        unit_amount: 30000, // $300.00
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { interval: 'year', rollover_cap: '3' },
      },
    ],
  },
  {
    name: 'Professional Plan',
    description: 'For businesses and agencies that need more videos and faster processing',
    metadata: {
      plan_id: 'professional',
      credits: '30',
    },
    prices: [
      {
        nickname: 'Professional Monthly',
        unit_amount: 7500, // $75.00
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { interval: 'month', rollover_cap: '10' },
      },
      {
        nickname: 'Professional Annual',
        unit_amount: 75000, // $750.00
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { interval: 'year', rollover_cap: '10' },
      },
    ],
  },
  {
    name: 'Single Credit',
    description: 'One-time purchase for a single logo animation video',
    metadata: {
      pack_id: 'single',
      credits: '1',
      requires_subscription: 'false',
    },
    prices: [
      {
        nickname: 'Single Credit',
        unit_amount: 500, // $5.00
        currency: 'usd',
        metadata: {},
      },
    ],
  },
  {
    name: '5 Credit Pack',
    description: 'Additional credits for existing subscribers',
    metadata: {
      pack_id: 'small',
      credits: '5',
      requires_subscription: 'true',
    },
    prices: [
      {
        nickname: '5 Credits',
        unit_amount: 2000, // $20.00
        currency: 'usd',
        metadata: {},
      },
    ],
  },
  {
    name: '10 Credit Pack',
    description: 'Additional credits for existing subscribers',
    metadata: {
      pack_id: 'medium',
      credits: '10',
      requires_subscription: 'true',
    },
    prices: [
      {
        nickname: '10 Credits',
        unit_amount: 3500, // $35.00
        currency: 'usd',
        metadata: {},
      },
    ],
  },
  {
    name: '20 Credit Pack',
    description: 'Additional credits for existing subscribers',
    metadata: {
      pack_id: 'large',
      credits: '20',
      requires_subscription: 'true',
    },
    prices: [
      {
        nickname: '20 Credits',
        unit_amount: 6500, // $65.00
        currency: 'usd',
        metadata: {},
      },
    ],
  },
]

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function main() {
  console.log(`${colors.bright}${colors.blue}`)
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  Animation Labs - Stripe Live Mode Setup')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log(colors.reset)

  if (isDryRun) {
    console.log(`${colors.yellow}🔍 DRY RUN MODE - No changes will be made${colors.reset}\n`)
  } else {
    console.log(`${colors.red}⚠️  LIVE MODE - Real products will be created${colors.reset}\n`)
  }

  // Verify Stripe connection
  try {
    const account = await stripe.accounts.retrieve()
    console.log(`${colors.green}✓${colors.reset} Connected to Stripe account: ${colors.bright}${account.business_profile?.name || account.email || account.id}${colors.reset}`)
    console.log(`${colors.green}✓${colors.reset} Account ID: ${account.id}`)
    console.log(`${colors.green}✓${colors.reset} Country: ${account.country}`)
    console.log()
  } catch (error) {
    console.error(`${colors.red}❌ Failed to connect to Stripe:${colors.reset}`, error)
    process.exit(1)
  }

  // Preview what will be created
  console.log(`${colors.bright}Products to create:${colors.reset}\n`)
  PRODUCTS.forEach((product, i) => {
    console.log(`${colors.cyan}${i + 1}. ${product.name}${colors.reset}`)
    console.log(`   ${product.description}`)
    product.prices.forEach((price) => {
      const amount = `$${(price.unit_amount / 100).toFixed(2)}`
      const interval = price.recurring ? `/${price.recurring.interval}` : ' (one-time)'
      console.log(`   • ${price.nickname}: ${colors.green}${amount}${interval}${colors.reset}`)
    })
    console.log()
  })

  console.log(`${colors.bright}Total: ${PRODUCTS.length} products, ${PRODUCTS.reduce((sum, p) => sum + p.prices.length, 0)} prices${colors.reset}\n`)

  if (isDryRun) {
    console.log(`${colors.yellow}Dry run complete. Run without --dry-run to create products.${colors.reset}`)
    return
  }

  // Confirm before proceeding
  const proceed = await confirm(
    `${colors.yellow}⚠️  Create these products in LIVE mode? (y/n): ${colors.reset}`
  )

  if (!proceed) {
    console.log('\n❌ Cancelled by user')
    process.exit(0)
  }

  console.log()
  console.log(`${colors.bright}Creating products...${colors.reset}\n`)

  const envVars = {}

  for (const productDef of PRODUCTS) {
    try {
      // Create product
      console.log(`${colors.cyan}Creating product: ${productDef.name}${colors.reset}`)
      const product = await stripe.products.create({
        name: productDef.name,
        description: productDef.description,
        metadata: productDef.metadata,
      })
      console.log(`  ${colors.green}✓${colors.reset} Product created: ${product.id}`)

      // Create prices
      for (const priceDef of productDef.prices) {
        const price = await stripe.prices.create({
          product: product.id,
          nickname: priceDef.nickname,
          unit_amount: priceDef.unit_amount,
          currency: priceDef.currency,
          recurring: priceDef.recurring,
          metadata: priceDef.metadata,
        })

        const amount = `$${(priceDef.unit_amount / 100).toFixed(2)}`
        const interval = priceDef.recurring ? `/${priceDef.recurring.interval}` : ' (one-time)'
        console.log(`  ${colors.green}✓${colors.reset} Price created: ${price.id} (${amount}${interval})`)

        // Map to environment variable names
        const envVarName = getEnvVarName(productDef, priceDef)
        if (envVarName) {
          envVars[envVarName] = price.id
        }
      }

      console.log()
    } catch (error) {
      console.error(`${colors.red}❌ Error creating ${productDef.name}:${colors.reset}`, error)
      process.exit(1)
    }
  }

  // Print environment variables
  console.log(`${colors.bright}${colors.green}✅ All products created successfully!${colors.reset}\n`)
  console.log(`${colors.bright}Next steps:${colors.reset}\n`)
  console.log('1. Copy these environment variables to your .env.local file:\n')
  console.log(`${colors.cyan}# Stripe Live Mode Price IDs${colors.reset}`)
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}=${value}`)
  })
  console.log()
  console.log('2. Update your Stripe API keys to live mode:')
  console.log(`${colors.cyan}NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...${colors.reset}`)
  console.log(`${colors.cyan}STRIPE_SECRET_KEY=sk_live_...${colors.reset}`)
  console.log()
  console.log('3. Configure your webhook endpoint in Stripe Dashboard')
  console.log('4. Update STRIPE_WEBHOOK_SECRET with the live mode webhook secret')
  console.log()
  console.log(`${colors.bright}${colors.blue}View products: ${colors.reset}${colors.cyan}https://dashboard.stripe.com/products${colors.reset}`)
}

function getEnvVarName(product, price) {
  const metadata = product.metadata

  // Subscription plans
  if (metadata.plan_id === 'starter') {
    return price.recurring?.interval === 'month'
      ? 'STRIPE_PRICE_STARTER'
      : 'STRIPE_PRICE_STARTER_ANNUAL'
  }
  if (metadata.plan_id === 'professional') {
    return price.recurring?.interval === 'month'
      ? 'STRIPE_PRICE_PROFESSIONAL'
      : 'STRIPE_PRICE_PROFESSIONAL_ANNUAL'
  }

  // Credit packs
  if (metadata.pack_id === 'single') return 'STRIPE_PRICE_SINGLE_CREDIT'
  if (metadata.pack_id === 'small') return 'STRIPE_PRICE_CREDITS_SMALL'
  if (metadata.pack_id === 'medium') return 'STRIPE_PRICE_CREDITS_MEDIUM'
  if (metadata.pack_id === 'large') return 'STRIPE_PRICE_CREDITS_LARGE'

  return null
}

main().catch((error) => {
  console.error(`${colors.red}❌ Unexpected error:${colors.reset}`, error)
  process.exit(1)
})
