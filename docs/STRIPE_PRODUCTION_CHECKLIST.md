# Stripe Production Launch - Quick Checklist

**Use this checklist when you're ready to go live. See [STRIPE_PRODUCTION_GUIDE.md](./STRIPE_PRODUCTION_GUIDE.md) for detailed instructions.**

---

## Pre-Launch (Do This First)

### ☐ Stripe Account Activation
- [ ] Business profile completed
- [ ] Bank account added and verified
- [ ] Identity verification completed
- [ ] Account status shows "Active"

**Status:** ⏸️ Not Started | 🏃 In Progress | ✅ Complete

---

## Launch Day Checklist

### ☐ Step 1: Create Products (15 minutes)

**Run the automated script:**
```bash
# Preview first
STRIPE_SECRET_KEY=sk_live_xxxxx npm run stripe:setup -- --dry-run

# Create products
STRIPE_SECRET_KEY=sk_live_xxxxx npm run stripe:setup
```

**Save the output price IDs** - you'll need them next!

### ☐ Step 2: Update Environment Variables (10 minutes)

Add to your production environment (Vercel/Netlify/etc):

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_STARTER_ANNUAL=price_xxxxx
STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_xxxxx
STRIPE_PRICE_SINGLE_CREDIT=price_xxxxx
STRIPE_PRICE_CREDITS_SMALL=price_xxxxx
STRIPE_PRICE_CREDITS_MEDIUM=price_xxxxx
STRIPE_PRICE_CREDITS_LARGE=price_xxxxx
```

### ☐ Step 3: Configure Webhook (10 minutes)

1. **Stripe Dashboard → Developers → Webhooks → Add endpoint**
2. **URL:** `https://yourdomain.com/api/webhooks/stripe`
3. **Events to send:**
   - checkout.session.completed
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
4. **Copy webhook secret** (starts with `whsec_`)
5. **Add to environment variables:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### ☐ Step 4: Deploy (15 minutes)

```bash
# Deploy to production
vercel --prod  # or your deployment command

# Verify deployment
curl https://yourdomain.com/api/health/stripe
```

### ☐ Step 5: Test Everything (30 minutes)

#### Test 1: Subscription Purchase
- [ ] Navigate to `/pricing`
- [ ] Purchase Starter Monthly ($30) with real card
- [ ] Verify 10 credits added to account
- [ ] Check Stripe Dashboard shows subscription
- [ ] Check webhook delivered successfully

#### Test 2: Credit Pack Purchase
- [ ] Navigate to `/subscribe`
- [ ] Purchase Single Credit ($5)
- [ ] Verify 1 credit added
- [ ] Check Stripe Dashboard shows payment

#### Test 3: Video Creation
- [ ] Create a video
- [ ] Verify credits deducted
- [ ] Check database for transaction log

#### Test 4: Subscription Management
- [ ] Navigate to `/billing`
- [ ] Click "Manage Subscription"
- [ ] Verify Customer Portal loads
- [ ] Test updating payment method

---

## Post-Launch Monitoring (First 24 Hours)

### ☐ Hour 1
- [ ] Check Stripe Dashboard for successful webhooks
- [ ] Verify database updates correctly
- [ ] Monitor application logs for errors

### ☐ Hour 6
- [ ] Review all transactions
- [ ] Check webhook success rate (should be 100%)
- [ ] Verify email notifications sent

### ☐ Hour 24
- [ ] Analyze first day metrics
- [ ] Check for failed payments
- [ ] Review customer support tickets

---

## Emergency Contacts

**Stripe Support:** https://support.stripe.com (Live chat available)

**Rollback Plan:** See [STRIPE_PRODUCTION_GUIDE.md](./STRIPE_PRODUCTION_GUIDE.md#rollback-plan)

---

## Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Webhooks failing | Check `STRIPE_WEBHOOK_SECRET` matches live mode secret |
| Unknown price ID | Verify all 8 price IDs are set correctly |
| Checkout not loading | Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with `pk_live_` |
| Credits not added | Check Stripe Dashboard → Webhooks for delivery status |

**For detailed troubleshooting:** See [STRIPE_PRODUCTION_GUIDE.md](./STRIPE_PRODUCTION_GUIDE.md#troubleshooting)

---

## Success Criteria

You're successfully live when:

- ✅ Real payment processed successfully
- ✅ Subscription created in database
- ✅ Credits added to account
- ✅ Webhooks delivering at 100% success rate
- ✅ Customer can manage subscription in portal
- ✅ Emails sending correctly

---

**Good luck with your launch! 🚀**
