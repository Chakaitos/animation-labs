# Stripe Production Setup Guide

**Complete guide for switching Animation Labs from Stripe test mode to live production mode.**

> ⚠️ **Save this guide!** You'll need it when you're ready to launch. Don't rush this process.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Stripe Account Activation](#phase-1-stripe-account-activation)
3. [Phase 2: Create Products & Prices](#phase-2-create-products--prices)
4. [Phase 3: Update Environment Variables](#phase-3-update-environment-variables)
5. [Phase 4: Configure Webhooks](#phase-4-configure-webhooks)
6. [Phase 5: Deploy & Test](#phase-5-deploy--test)
7. [Post-Launch Monitoring](#post-launch-monitoring)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Plan](#rollback-plan)

---

## Prerequisites

Before starting, ensure you have:

- [ ] A registered business entity (LLC, Corporation, or Sole Proprietorship)
- [ ] Business bank account
- [ ] Tax ID (EIN for US businesses)
- [ ] Government-issued ID for identity verification
- [ ] Production domain with HTTPS enabled
- [ ] At least 1-2 hours of uninterrupted time for the switch

**Recommended:** Complete this process during low-traffic hours (e.g., Sunday morning).

---

## Phase 1: Stripe Account Activation

### Timeline: 1-3 Business Days

Stripe requires you to activate your account before accepting live payments. This is a one-time process.

### Steps

1. **Log into Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - You should see an "Activate your account" banner at the top

2. **Complete Business Profile**

   Navigate to **Settings → Business Settings**

   Fill in the following information:

   **Business Details:**
   - Legal business name (must match official registration)
   - Business type (Individual, Company, Non-profit)
   - Business description (e.g., "SaaS platform for logo animation videos")
   - Business website: `https://animationlabs.com` (or your domain)
   - Support email: `support@animationlabs.com`
   - Support phone number

   **Business Address:**
   - Street address (must match business registration)
   - City, State, ZIP code
   - Country

   **Tax Information:**
   - Tax ID / EIN
   - Business registration number (if applicable)

3. **Add Bank Account for Payouts**

   Navigate to **Settings → Bank Accounts and Scheduling**

   - Click "Add bank account"
   - Enter routing number and account number
   - Stripe will make 2 small test deposits (verify within 1-2 business days)
   - Confirm the deposit amounts to verify the account

   **Payout Schedule:**
   - Default: Daily automatic payouts (arrives in 2 business days)
   - You can adjust this to weekly or monthly if preferred

4. **Complete Identity Verification**

   Navigate to **Settings → Team and Security → Personal Details**

   For each business owner/representative:
   - Full legal name
   - Date of birth
   - SSN (last 4 digits or full, depending on country)
   - Home address
   - Phone number

   You may be asked to upload:
   - Government-issued ID (driver's license, passport)
   - Proof of address (utility bill, bank statement)

   **Processing Time:** Usually instant, but can take up to 1 business day

5. **Review and Submit**

   - Navigate to **Settings → Activate Account**
   - Review all information for accuracy
   - Click "Activate Account"

   **What happens next:**
   - Stripe reviews your application (usually within 24 hours)
   - You'll receive an email when approved
   - If additional information is needed, Stripe will email you

### Verification Checklist

Before proceeding to Phase 2, confirm:

- [ ] Business profile completed and approved
- [ ] Bank account added and verified
- [ ] Identity verification completed
- [ ] Account shows "Active" status in dashboard
- [ ] You can switch to "Live mode" in the dashboard (toggle in top-right)

---

## Phase 2: Create Products & Prices

### Timeline: 10-15 Minutes

You need to create 6 products with 8 total prices in live mode to match your current test setup.

### Option A: Automated Script (Recommended)

We've created a script that automatically creates all products and prices with the correct configuration.

**Step 1: Get Your Live Mode Secret Key**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live mode** (toggle in top-right corner)
3. Navigate to **Developers → API Keys**
4. Copy your **Secret key** (starts with `sk_live_...`)
   - **Important:** Never commit this key to version control
   - Store it securely (1Password, LastPass, etc.)

**Step 2: Run the Setup Script**

```bash
# Dry run first (preview what will be created)
STRIPE_SECRET_KEY=sk_live_xxxxx npm run stripe:setup -- --dry-run

# If everything looks good, create the products
STRIPE_SECRET_KEY=sk_live_xxxxx npm run stripe:setup
```

**Step 3: Save the Price IDs**

The script will output all price IDs in the correct format:

```bash
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_xxxxx
STRIPE_PRICE_SINGLE_CREDIT=price_xxxxx
STRIPE_PRICE_CREDITS_SMALL=price_xxxxx
STRIPE_PRICE_CREDITS_MEDIUM=price_xxxxx
STRIPE_PRICE_CREDITS_LARGE=price_xxxxx
```

**Save these!** You'll need them in Phase 3.

### Option B: Manual Creation via Dashboard

If you prefer to create products manually:

1. Switch to **Live mode** in Stripe Dashboard
2. Navigate to **Products → Create Product**

Create each product with these exact specifications:

#### Product 1: Starter Plan
- **Name:** Starter Plan
- **Description:** Perfect for individuals and small teams getting started with logo animations
- **Price 1 (Monthly):**
  - Amount: $30.00 USD
  - Billing period: Monthly
  - Nickname: Starter Monthly
- **Price 2 (Annual):**
  - Amount: $300.00 USD
  - Billing period: Yearly
  - Nickname: Starter Annual

#### Product 2: Professional Plan
- **Name:** Professional Plan
- **Description:** For businesses and agencies that need more videos and faster processing
- **Price 1 (Monthly):**
  - Amount: $75.00 USD
  - Billing period: Monthly
  - Nickname: Professional Monthly
- **Price 2 (Annual):**
  - Amount: $750.00 USD
  - Billing period: Yearly
  - Nickname: Professional Annual

#### Product 3: Single Credit
- **Name:** Single Credit
- **Description:** One-time purchase for a single logo animation video
- **Price:**
  - Amount: $5.00 USD
  - Type: One-time
  - Nickname: Single Credit

#### Product 4: 5 Credit Pack
- **Name:** 5 Credit Pack
- **Description:** Additional credits for existing subscribers
- **Price:**
  - Amount: $20.00 USD
  - Type: One-time
  - Nickname: 5 Credits

#### Product 5: 10 Credit Pack
- **Name:** 10 Credit Pack
- **Description:** Additional credits for existing subscribers
- **Price:**
  - Amount: $35.00 USD
  - Type: One-time
  - Nickname: 10 Credits

#### Product 6: 20 Credit Pack
- **Name:** 20 Credit Pack
- **Description:** Additional credits for existing subscribers
- **Price:**
  - Amount: $65.00 USD
  - Type: One-time
  - Nickname: 20 Credits

**After creating each product:**
- Copy the `price_xxxxx` ID for each price
- Save them in a secure note for Phase 3

### Verification Checklist

Before proceeding, confirm:

- [ ] All 6 products created in live mode
- [ ] Total of 8 prices created (4 subscription + 4 one-time)
- [ ] All price IDs saved and ready for Phase 3
- [ ] Products visible in Stripe Dashboard → Products (live mode)

---

## Phase 3: Update Environment Variables

### Timeline: 5-10 Minutes

You need to update your production environment variables with live mode credentials.

### Environment Variables to Update

Create or update your production `.env.local` (or equivalent for your hosting platform):

```bash
# ============================================================
# STRIPE - LIVE MODE
# ============================================================

# Public Key (Safe for client-side, exposed to browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Secret Key (Server-only, NEVER expose to client)
STRIPE_SECRET_KEY=sk_live_xxxxx

# Webhook Secret (You'll get this in Phase 4)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Subscription Plan Price IDs (from Phase 2)
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_xxxxx

# Credit Pack Price IDs (from Phase 2)
STRIPE_PRICE_SINGLE_CREDIT=price_xxxxx
STRIPE_PRICE_CREDITS_SMALL=price_xxxxx
STRIPE_PRICE_CREDITS_MEDIUM=price_xxxxx
STRIPE_PRICE_CREDITS_LARGE=price_xxxxx
```

### Where to Set These

**Vercel:**
```bash
# Via CLI
vercel env add STRIPE_SECRET_KEY production
# Paste the value when prompted

# Or via Dashboard:
# Project Settings → Environment Variables → Add New
```

**Netlify:**
```bash
# Site Settings → Environment Variables → Add Variable
```

**AWS / Other Platforms:**
- Consult your hosting provider's documentation for setting environment variables
- Ensure these are set for your **production** environment only

### Important Notes

- **DO NOT** commit live mode keys to Git
- **DO NOT** use live mode keys in development
- Keep test mode keys in your local `.env.local` for development
- Use separate environments (development, staging, production)

### Verification Checklist

- [ ] All 11 environment variables set in production
- [ ] Keys start with correct prefixes (`pk_live_`, `sk_live_`, `price_`)
- [ ] Test mode keys remain in local `.env.local` for development
- [ ] Secrets stored securely (1Password, team vault, etc.)

---

## Phase 4: Configure Webhooks

### Timeline: 10 Minutes

Webhooks allow Stripe to notify your application about important events (payments, subscription updates, etc.).

### Steps

1. **Find Your Production Webhook URL**

   Your webhook endpoint is:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```

   **Examples:**
   - `https://animationlabs.com/api/webhooks/stripe`
   - `https://app.animationlabs.com/api/webhooks/stripe`

   **Requirements:**
   - Must use HTTPS (HTTP not allowed in live mode)
   - Must be publicly accessible
   - Must return responses within 10 seconds

2. **Create Webhook Endpoint in Stripe**

   1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
   2. Switch to **Live mode**
   3. Navigate to **Developers → Webhooks**
   4. Click **Add endpoint**

   **Endpoint Configuration:**
   - **Endpoint URL:** `https://yourdomain.com/api/webhooks/stripe`
   - **Description:** "Animation Labs Production Webhook"
   - **Events to send:** Select these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

   Alternatively, select "Select all events" for comprehensive monitoring.

   5. Click **Add endpoint**

3. **Get Webhook Signing Secret**

   After creating the endpoint:
   1. Click on the newly created endpoint
   2. Click **Reveal** next to "Signing secret"
   3. Copy the secret (starts with `whsec_...`)
   4. Add it to your production environment variables:
      ```bash
      STRIPE_WEBHOOK_SECRET=whsec_xxxxx
      ```

4. **Test Webhook Endpoint**

   Before going live, test the endpoint:

   1. In the webhook details page, click **Send test webhook**
   2. Select `checkout.session.completed`
   3. Click **Send test webhook**
   4. Verify the response shows `200 OK`

   **If you see errors:**
   - Check that your app is deployed and accessible
   - Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret
   - Check application logs for error details

### Webhook Event Handling

Your application handles these events:

| Event | What Happens |
|-------|-------------|
| `checkout.session.completed` | Creates subscription or adds credits after successful payment |
| `customer.subscription.updated` | Updates subscription status (plan changes, renewals) |
| `customer.subscription.deleted` | Marks subscription as cancelled |
| `invoice.payment_succeeded` | Renews subscription credits, handles rollovers |
| `invoice.payment_failed` | Marks subscription as past_due, sends email to user |

### Verification Checklist

- [ ] Webhook endpoint created in live mode
- [ ] All required events selected (or "Select all events")
- [ ] Webhook signing secret copied and saved
- [ ] `STRIPE_WEBHOOK_SECRET` added to production environment
- [ ] Test webhook sent successfully (200 OK response)
- [ ] Production app deployed with latest environment variables

---

## Phase 5: Deploy & Test

### Timeline: 30-60 Minutes

Now it's time to deploy and thoroughly test the integration.

### Pre-Deployment Checklist

- [ ] All environment variables set in production (from Phase 3)
- [ ] Webhook endpoint configured (from Phase 4)
- [ ] Application code deployed to production
- [ ] Production site accessible via HTTPS
- [ ] Database migrations run (if any)

### Deployment Steps

1. **Deploy Latest Code**

   ```bash
   # If using Vercel
   vercel --prod

   # If using Netlify
   netlify deploy --prod

   # Or use your CI/CD pipeline
   git push origin main
   ```

2. **Verify Deployment**

   - Visit your production site
   - Check that the site loads without errors
   - Open browser console - verify no Stripe errors

3. **Test Environment Variables**

   Navigate to `/api/health/stripe` (if you have this endpoint):
   ```
   https://yourdomain.com/api/health/stripe
   ```

   Should return validation status of Stripe configuration.

### Testing Checklist

**Test each flow with real payment methods:**

#### Test 1: Subscription Purchase (Monthly)
1. Navigate to pricing page: `/pricing`
2. Click "Get Started" on Starter Monthly ($30/month)
3. Complete checkout with a **real credit card**
4. Verify:
   - [ ] Payment successful
   - [ ] Redirected to success page
   - [ ] Subscription created in database
   - [ ] Credits added to account (10 credits)
   - [ ] Stripe Dashboard shows subscription
   - [ ] Webhook received (`checkout.session.completed`)

#### Test 2: Subscription Purchase (Annual)
1. Navigate to pricing page
2. Click "Get Started" on Professional Annual ($750/year)
3. Complete checkout
4. Verify same items as Test 1 (30 credits)

#### Test 3: Credit Pack Purchase
1. Navigate to billing/subscribe page: `/subscribe`
2. Purchase "Single Credit" ($5)
3. Verify:
   - [ ] Payment successful
   - [ ] Credits added to account (+1 credit)
   - [ ] Transaction logged in database
   - [ ] Stripe Dashboard shows payment

#### Test 4: Video Creation Flow
1. Create a video (uses credits)
2. Verify:
   - [ ] Credits deducted correctly
   - [ ] Video status tracked in database
   - [ ] n8n webhook triggered successfully

#### Test 5: Webhook Delivery
1. Navigate to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your production endpoint
3. Verify:
   - [ ] Recent events show successful delivery (200 responses)
   - [ ] No failed deliveries
   - [ ] Event types match expectations

#### Test 6: Subscription Management
1. Navigate to `/billing`
2. Verify:
   - [ ] Current plan displayed correctly
   - [ ] Credits remaining shown accurately
   - [ ] "Manage Subscription" opens Stripe Customer Portal
3. In Customer Portal:
   - [ ] Can upgrade/downgrade plan
   - [ ] Can update payment method
   - [ ] Can cancel subscription

#### Test 7: Failed Payment (Optional but Recommended)
1. In Stripe Dashboard, create a test subscription with a payment method that will fail renewal
2. Trigger renewal manually
3. Verify:
   - [ ] Subscription status updates to "past_due"
   - [ ] User receives payment failed email
   - [ ] Invoice URL included in email

### Monitoring First Transactions

**For the first 24-48 hours after launch:**

1. **Stripe Dashboard**
   - Check **Home → Recent activity** every few hours
   - Monitor **Payments** for successful charges
   - Monitor **Subscriptions** for active subscriptions

2. **Application Logs**
   - Watch for webhook processing logs
   - Check for any Stripe API errors
   - Monitor database for correct data

3. **Database**
   - Verify `subscriptions` table updates correctly
   - Check `credit_transactions` for accurate logging
   - Monitor `videos` table for credit deductions

4. **Sentry / Error Monitoring**
   - Watch for Stripe-related errors
   - Set up alerts for webhook failures
   - Monitor API rate limits

### Verification Checklist

- [ ] All 7 tests completed successfully
- [ ] Real payment processed without errors
- [ ] Webhooks delivering successfully
- [ ] Database updates correctly
- [ ] Credits system working as expected
- [ ] Emails sending correctly
- [ ] Customer Portal functional

---

## Post-Launch Monitoring

### First Week

**Daily tasks:**
- [ ] Check Stripe Dashboard for successful payments
- [ ] Monitor webhook delivery (should be 100% success rate)
- [ ] Review application logs for errors
- [ ] Verify customer subscriptions are active
- [ ] Check database integrity

**Set up alerts:**
- Webhook delivery failures
- Payment failures above normal rate
- API errors from Stripe
- Database inconsistencies

### First Month

**Weekly tasks:**
- [ ] Review failed payments (why did they fail?)
- [ ] Analyze subscription churn (cancellations)
- [ ] Monitor credit usage patterns
- [ ] Check for fraudulent activity
- [ ] Review Stripe fees and reconcile with revenue

**Optimize:**
- Adjust retry logic for failed payments
- Improve email templates based on user feedback
- Fine-tune credit rollover caps if needed
- Consider adding new pricing tiers based on demand

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Webhook signature verification failed

**Symptoms:**
- Webhook events show 400 errors in Stripe Dashboard
- Logs show "Invalid signature" errors

**Solutions:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches live mode secret
2. Check that you're using the correct webhook secret (test vs live)
3. Ensure raw request body is used (not parsed JSON)
4. Verify timestamp isn't too old (>5 minutes)

**Fix:**
```bash
# Get the correct webhook secret
# Stripe Dashboard → Developers → Webhooks → [Your endpoint] → Reveal signing secret

# Update environment variable
STRIPE_WEBHOOK_SECRET=whsec_correct_secret_here
```

---

#### Issue: Unknown price ID in webhook

**Symptoms:**
- Payments succeed but subscription not created
- Logs show "Unknown price ID" error

**Solutions:**
1. Verify all 8 price IDs are set correctly in environment variables
2. Check price IDs are from LIVE mode, not test mode
3. Ensure price IDs start with `price_`, not `prod_`

**Debug:**
```bash
# In webhook handler logs, you should see:
# receivedPriceId: price_xxxxx
# configuredPriceIds: { starter_monthly: price_yyyyy, ... }

# If they don't match, update your environment variables
```

---

#### Issue: Checkout page not loading

**Symptoms:**
- Clicking "Get Started" does nothing
- Browser console shows Stripe errors

**Solutions:**
1. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set to `pk_live_`
2. Check browser console for specific error message
3. Ensure price IDs are valid and from live mode

**Debug:**
```javascript
// In browser console:
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
// Should start with pk_live_, not pk_test_
```

---

#### Issue: Credits not added after payment

**Symptoms:**
- Payment successful in Stripe
- No credits in user account

**Solutions:**
1. Check webhook delivery in Stripe Dashboard
2. Verify `checkout.session.completed` event was received
3. Check application logs for errors during webhook processing
4. Manually check database for subscription record

**Debug:**
```sql
-- Check if subscription was created
SELECT * FROM subscriptions WHERE stripe_customer_id = 'cus_xxxxx';

-- Check credit transactions
SELECT * FROM credit_transactions WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
```

---

#### Issue: Duplicate webhook processing

**Symptoms:**
- Credits added twice
- Duplicate subscription records

**Solutions:**
1. Verify idempotency check in webhook handler
2. Check `webhook_events` table for duplicate processing

**Fix:**
The code already has idempotency checks at `app/api/webhooks/stripe/route.ts:42-49`.
If this occurs, investigate:
```sql
-- Check for duplicate event processing
SELECT stripe_event_id, COUNT(*)
FROM webhook_events
GROUP BY stripe_event_id
HAVING COUNT(*) > 1;
```

---

#### Issue: Subscription renewal not working

**Symptoms:**
- Subscription shows as active but credits not renewed
- `invoice.payment_succeeded` event not processed

**Solutions:**
1. Verify `invoice.payment_succeeded` is in your webhook events
2. Check that `billing_reason === 'subscription_cycle'` logic is correct
3. Review rollover calculation logic

**Debug:**
```javascript
// In webhook logs, check:
// billing_reason should be 'subscription_cycle' for renewals
// (not 'subscription_create' for initial purchases)
```

---

#### Issue: Payment failures not handled

**Symptoms:**
- Failed payments don't update subscription status
- Users not notified of payment issues

**Solutions:**
1. Verify `invoice.payment_failed` event is configured
2. Check email sending logic in webhook handler
3. Ensure Resend API key is valid

**Fix:**
Test payment failure flow:
```bash
# In Stripe Dashboard:
# Customers → [Select customer] → Subscriptions → [Select subscription]
# → Actions → Trigger upcoming invoice → Simulate payment failure
```

---

### Getting Help

If you encounter issues not covered here:

1. **Stripe Support**
   - [Stripe Support](https://support.stripe.com)
   - Live chat available for activated accounts
   - Detailed webhook event logs in Dashboard

2. **Stripe Documentation**
   - [Webhooks Guide](https://stripe.com/docs/webhooks)
   - [Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
   - [Testing Guide](https://stripe.com/docs/testing)

3. **Application Logs**
   - Check Sentry for errors
   - Review Vercel/Netlify logs
   - Check database logs

4. **Community**
   - Stripe Discord community
   - Stack Overflow (tag: stripe-payments)

---

## Rollback Plan

If critical issues occur after going live, you can roll back:

### Emergency Rollback (Immediate)

**Steps:**
1. Revert environment variables to test mode:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxx
   # ... etc
   ```

2. Redeploy application

3. Update webhook endpoint to test mode webhook

**Consequences:**
- Live payments will fail
- Existing subscriptions will continue in Stripe
- New subscriptions will be in test mode

**When to use:**
- Critical bug preventing all payments
- Data corruption in production database
- Security issue discovered

### Graceful Rollback (Planned)

If you need to roll back but have active customers:

1. **Stop new signups:**
   - Add maintenance mode to pricing page
   - Display "Temporarily unavailable" message

2. **Let existing subscriptions run:**
   - Do not touch existing Stripe subscriptions
   - Keep webhook endpoint active for existing customers

3. **Fix issues in test mode:**
   - Deploy fixes to staging
   - Thoroughly test with test mode
   - Verify all webhook scenarios

4. **Re-enable when ready:**
   - Deploy fixes to production
   - Remove maintenance mode
   - Monitor closely for 24 hours

---

## Final Checklist

Before considering the migration complete:

### Business Requirements
- [ ] Stripe account fully activated
- [ ] Business information verified
- [ ] Bank account connected and verified
- [ ] Identity verification completed

### Technical Setup
- [ ] All 6 products created in live mode
- [ ] All 8 prices created with correct amounts
- [ ] Environment variables updated in production
- [ ] Webhook endpoint configured and tested
- [ ] Latest code deployed to production

### Testing
- [ ] Test subscription purchase completed successfully
- [ ] Test credit pack purchase completed successfully
- [ ] Credits added correctly to account
- [ ] Video creation flow tested end-to-end
- [ ] Webhooks delivering successfully (100% success rate)
- [ ] Customer Portal accessible and functional
- [ ] Email notifications sending correctly

### Monitoring
- [ ] Stripe Dashboard monitoring set up
- [ ] Application logs reviewed for errors
- [ ] Database verified for correct data
- [ ] Sentry alerts configured
- [ ] Webhook failure alerts set up

### Documentation
- [ ] Team trained on Stripe Dashboard
- [ ] Support team knows how to handle payment issues
- [ ] Refund policy documented
- [ ] Customer support scripts prepared

### Legal & Compliance
- [ ] Terms of Service updated with billing terms
- [ ] Privacy Policy updated with payment processor info
- [ ] Refund policy published
- [ ] Subscription cancellation policy clear

---

## Congratulations!

You've successfully migrated to Stripe live mode. 🎉

**What's next?**
- Monitor the first week closely
- Collect customer feedback
- Optimize based on real usage data
- Consider adding new pricing tiers or features

**Keep this guide** for reference and for training new team members.

---

## Additional Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Security Guide](https://stripe.com/docs/security/guide)

---

**Document Version:** 1.0
**Last Updated:** 2026-02-14
**Maintained By:** Animation Labs Engineering Team
