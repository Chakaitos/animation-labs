# Scripts

Utility scripts for Animation Labs.

---

## Stripe Live Mode Setup

### `stripe-setup-live.js`

Automated script to create all Stripe products and prices in live mode.

**When to use:** When you're ready to switch from test mode to production (after Stripe account activation).

**What it does:**
- Creates 6 products in Stripe live mode
- Creates 8 prices (4 subscriptions + 4 credit packs)
- Outputs environment variable format for easy copy-paste
- Includes safety checks to prevent accidental test mode usage

**Usage:**

```bash
# Preview what will be created (recommended first step)
STRIPE_SECRET_KEY=sk_live_xxxxx npm run stripe:setup -- --dry-run

# Create products in live mode
STRIPE_SECRET_KEY=sk_live_xxxxx npm run stripe:setup
```

**Prerequisites:**
1. Stripe account fully activated (business info, banking, identity verified)
2. Live mode secret key from Stripe Dashboard (starts with `sk_live_`)
3. Switched to "Live mode" in Stripe Dashboard (toggle in top-right)

**Output:**
The script will create these products and output the price IDs:

```
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_xxxxx
STRIPE_PRICE_SINGLE_CREDIT=price_xxxxx
STRIPE_PRICE_CREDITS_SMALL=price_xxxxx
STRIPE_PRICE_CREDITS_MEDIUM=price_xxxxx
STRIPE_PRICE_CREDITS_LARGE=price_xxxxx
```

Copy these to your production `.env.local` or hosting platform environment variables.

**Safety Features:**
- ✅ Requires `sk_live_` prefix (rejects test keys)
- ✅ Dry run mode to preview changes
- ✅ Confirmation prompt before creating
- ✅ Displays account info to verify correct Stripe account
- ✅ Colored output for easy reading

**See also:**
- [Stripe Production Guide](../docs/STRIPE_PRODUCTION_GUIDE.md) - Complete guide
- [Stripe Production Checklist](../docs/STRIPE_PRODUCTION_CHECKLIST.md) - Quick reference

---

## Email Configuration Checker

### `check-email-config.sh`

Validates email configuration and Resend API setup.

**Usage:**
```bash
./scripts/check-email-config.sh
```

---

## Adding New Scripts

When adding new scripts:

1. **Add script to `scripts/` directory**
2. **Make it executable:**
   ```bash
   chmod +x scripts/your-script.sh
   ```
3. **Add npm script to `package.json`:**
   ```json
   {
     "scripts": {
       "your-command": "node scripts/your-script.js"
     }
   }
   ```
4. **Document it in this README**

---

## Conventions

- **Node.js scripts:** Use `.js` extension, include shebang `#!/usr/bin/env node`
- **Shell scripts:** Use `.sh` extension, include shebang `#!/bin/bash`
- **Make all scripts executable:** `chmod +x scripts/*.{js,sh}`
- **Add npm script:** Make it easy to run with `npm run command-name`
- **Include help text:** Add `--help` flag or usage comments at top of file
- **Use colors:** Make output readable (see `stripe-setup-live.js` for example)
- **Error handling:** Exit with non-zero code on errors
- **Idempotency:** Scripts should be safe to run multiple times when possible
