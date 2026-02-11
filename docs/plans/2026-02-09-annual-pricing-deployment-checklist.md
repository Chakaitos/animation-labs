# Annual Pricing Deployment Checklist

**Feature:** Annual subscription billing with credit rollover
**Branch:** `feature/annual-subscription-pricing`
**Target:** `main`
**Date:** February 9, 2026

---

## Pre-Deployment Checklist

### 1. Code Review ✅
- [ ] All commits reviewed and approved
- [ ] No merge conflicts with `main`
- [ ] All CI/CD checks passing
- [ ] Test coverage adequate

### 2. Stripe Configuration (Test Mode First)
- [ ] **Create annual prices in Stripe TEST mode:**
  - [ ] Navigate to https://dashboard.stripe.com/test/products
  - [ ] Select "Starter" product
  - [ ] Click "Add another price"
  - [ ] Set billing period: **Yearly**
  - [ ] Set price: **$300.00**
  - [ ] Copy price ID (starts with `price_`)
  - [ ] Repeat for "Professional" product with **$750.00**

- [ ] **Add test price IDs to `.env.local`:**
  ```bash
  STRIPE_PRICE_STARTER_ANNUAL=price_test_...
  STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_test_...
  ```

- [ ] **Test in development:**
  - [ ] Navigate to `/pricing`, toggle to annual
  - [ ] Complete checkout with test card (4242 4242 4242 4242)
  - [ ] Verify webhook processes correctly
  - [ ] Check database has `billing_interval = 'year'`
  - [ ] Test upgrade flow from monthly to annual

### 3. Environment Variables Preparation
- [ ] Document all required production environment variables
- [ ] Prepare production Stripe price IDs (after creating in live mode)
- [ ] Verify `NEXT_PUBLIC_APP_URL` is correct for production

### 4. Database Migration Review
- [ ] Review migration SQL: `supabase/migrations/00010_add_annual_billing_support.sql`
- [ ] Verify migration is idempotent (safe to re-run)
- [ ] Test migration on staging database (if available)
- [ ] Prepare rollback SQL (if needed)

---

## Deployment Day

### Phase 1: Database Migration (CRITICAL - Do First)

**⚠️ IMPORTANT:** Apply database migration BEFORE deploying code. This ensures backwards compatibility.

#### Staging/Test Environment
1. [ ] **Backup production database** (or create snapshot)
   ```sql
   -- Via Supabase dashboard or CLI
   ```

2. [ ] **Apply migration to staging:**
   - Option A: Supabase Dashboard
     - Go to SQL Editor
     - Paste contents of `00010_add_annual_billing_support.sql`
     - Execute

   - Option B: Supabase CLI
     ```bash
     supabase db push
     ```

3. [ ] **Verify migration succeeded:**
   ```sql
   -- Check columns exist
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'subscriptions'
     AND column_name IN ('billing_interval', 'rollover_cap');

   -- Expected output:
   -- billing_interval | text    | 'month'::text
   -- rollover_cap     | integer | 0

   -- Check existing subscriptions backfilled
   SELECT COUNT(*), billing_interval, rollover_cap
   FROM subscriptions
   GROUP BY billing_interval, rollover_cap;

   -- Expected: All existing subscriptions have 'month' and 0
   ```

4. [ ] **Test with existing data:**
   - Verify existing subscriptions still work
   - Check credit deductions still function
   - Verify webhook processing unchanged

#### Production Environment
5. [ ] **Create database backup/snapshot**
6. [ ] **Apply migration to production** (same steps as staging)
7. [ ] **Verify migration** (run verification queries)
8. [ ] **Monitor for errors** (check Supabase logs)

### Phase 2: Stripe Live Mode Configuration

1. [ ] **Create annual prices in Stripe LIVE mode:**
   - [ ] Navigate to https://dashboard.stripe.com/products
   - [ ] Select "Starter" product
   - [ ] Add yearly price: **$300.00**
   - [ ] Copy live price ID
   - [ ] Select "Professional" product
   - [ ] Add yearly price: **$750.00**
   - [ ] Copy live price ID

2. [ ] **Update production environment variables:**
   ```bash
   STRIPE_PRICE_STARTER_ANNUAL=price_live_...
   STRIPE_PRICE_PROFESSIONAL_ANNUAL=price_live_...
   ```

3. [ ] **Verify webhook endpoint configured:**
   - [ ] Go to https://dashboard.stripe.com/webhooks
   - [ ] Verify endpoint exists: `https://yourdomain.com/api/webhooks/stripe`
   - [ ] Verify events subscribed:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - [ ] Copy webhook secret
   - [ ] Update `STRIPE_WEBHOOK_SECRET` in production

### Phase 3: Code Deployment

1. [ ] **Merge to main:**
   ```bash
   git checkout main
   git merge feature/annual-subscription-pricing
   git push origin main
   ```

2. [ ] **Deploy to production** (platform-specific):
   - Vercel: Automatic on push to main
   - Other: Follow platform deployment process

3. [ ] **Monitor deployment:**
   - [ ] Check build logs for errors
   - [ ] Verify deployment completes successfully
   - [ ] Check application starts without errors

4. [ ] **Verify routes deployed:**
   - [ ] Visit `https://yourdomain.com/pricing`
   - [ ] Check `/api/checkout` (POST endpoint)
   - [ ] Check `/api/billing/upgrade-to-annual` (POST endpoint)

### Phase 4: Post-Deployment Verification

**Critical Path Testing** (do immediately after deployment):

1. [ ] **Pricing Page:**
   - [ ] Navigate to `/pricing`
   - [ ] Toggle between monthly and annual
   - [ ] Verify prices display correctly ($30/$300, $75/$750)
   - [ ] Verify "Save 17%" badge appears
   - [ ] Verify rollover text appears on annual plans
   - [ ] Check browser console for errors

2. [ ] **Annual Checkout Flow:**
   - [ ] Click "Get Started" on annual plan
   - [ ] Should redirect to Stripe checkout
   - [ ] Complete with test card: 4242 4242 4242 4242
   - [ ] Verify redirect to dashboard after payment
   - [ ] Check database:
     ```sql
     SELECT billing_interval, rollover_cap, credits_remaining
     FROM subscriptions
     ORDER BY created_at DESC
     LIMIT 1;
     -- Should show: year | 3 (or 10) | 10 (or 30)
     ```

3. [ ] **Monthly Checkout Flow:**
   - [ ] Toggle to monthly on `/pricing`
   - [ ] Complete checkout
   - [ ] Verify creates monthly subscription
   - [ ] Check database shows `billing_interval = 'month'`

4. [ ] **Upgrade Flow:**
   - [ ] Create test monthly subscription
   - [ ] Navigate to `/billing`
   - [ ] Verify "Upgrade to Annual" button shows
   - [ ] Click upgrade, confirm dialog
   - [ ] Verify success message
   - [ ] Check Stripe for proration invoice
   - [ ] Verify database updated to `billing_interval = 'year'`

5. [ ] **Webhook Processing:**
   - [ ] Monitor webhook logs in Stripe dashboard
   - [ ] Verify all webhooks return 200 status
   - [ ] Check for any error patterns
   - [ ] Verify database updates correctly

6. [ ] **Existing Subscriptions:**
   - [ ] Verify existing monthly subscriptions continue working
   - [ ] Check credit deductions still function
   - [ ] Verify existing customers can still create videos

### Phase 5: Monitoring (First 24-48 Hours)

1. [ ] **Monitor Metrics:**
   - [ ] Stripe webhook success rate
   - [ ] Database error logs
   - [ ] Application error logs
   - [ ] API endpoint response times
   - [ ] User sign-ups (monthly vs annual)

2. [ ] **Watch for Issues:**
   - [ ] Webhook processing failures
   - [ ] Incorrect billing_interval values
   - [ ] Credit rollover not applying
   - [ ] Checkout flow errors
   - [ ] Customer support tickets

3. [ ] **Key Queries to Monitor:**
   ```sql
   -- Check annual subscription count
   SELECT COUNT(*) FROM subscriptions WHERE billing_interval = 'year';

   -- Verify rollover caps set correctly
   SELECT plan, billing_interval, COUNT(*), AVG(rollover_cap)
   FROM subscriptions
   GROUP BY plan, billing_interval;

   -- Check for orphaned subscriptions (shouldn't exist)
   SELECT * FROM subscriptions
   WHERE billing_interval IS NULL OR rollover_cap IS NULL;

   -- Monitor credit transactions for rollover
   SELECT type, COUNT(*), SUM(amount)
   FROM credit_transactions
   WHERE type IN ('bonus', 'expiry')
     AND created_at > NOW() - INTERVAL '24 hours'
   GROUP BY type;
   ```

---

## Rollback Plan

### If Critical Issues Occur

**Symptoms requiring rollback:**
- Webhook processing consistently failing (>10% error rate)
- Database errors preventing subscriptions
- Unable to create new subscriptions
- Credit system broken for existing users

**Rollback Steps:**

1. [ ] **Disable annual prices in Stripe:**
   - Archive annual price IDs in Stripe dashboard
   - This prevents new annual subscriptions

2. [ ] **Revert code deployment:**
   ```bash
   git revert <merge-commit-hash>
   git push origin main
   ```
   Or use platform-specific rollback (e.g., Vercel rollback)

3. [ ] **DO NOT rollback database migration** unless absolutely necessary
   - Migration is backwards compatible
   - Existing monthly subscriptions unaffected
   - `billing_interval` defaults to 'month'

4. [ ] **Only rollback database if:**
   - Database is in corrupted state
   - Migration caused data integrity issues

   **Rollback SQL:**
   ```sql
   -- Only if absolutely necessary
   ALTER TABLE public.subscriptions
     DROP COLUMN IF EXISTS billing_interval,
     DROP COLUMN IF EXISTS rollover_cap;
   ```

5. [ ] **Monitor after rollback:**
   - Verify existing subscriptions work
   - Check webhook processing recovers
   - Monitor error rates return to normal

6. [ ] **Communicate:**
   - Update status page if public-facing
   - Notify affected customers if any
   - Document incident and root cause

---

## Post-Deployment Tasks

### Documentation Updates
- [ ] Update main README if needed
- [ ] Update API documentation
- [ ] Update customer-facing help articles
- [ ] Document new pricing on marketing site

### Team Communication
- [ ] Notify customer support team of new feature
- [ ] Share FAQ about annual plans
- [ ] Provide guide for handling upgrade requests
- [ ] Share monitoring dashboard links

### Analytics Setup
- [ ] Set up tracking for annual vs monthly conversions
- [ ] Monitor average subscription value
- [ ] Track upgrade rate (monthly → annual)
- [ ] Monitor credit rollover utilization

### Future Enhancements (Backlog)
- [ ] Add billing interval switching (annual → monthly)
- [ ] Add proration preview before upgrade
- [ ] Email notifications for credit rollover
- [ ] Dashboard widget showing rollover status
- [ ] Analytics: annual plan performance
- [ ] Marketing: promote annual plans to existing users

---

## Success Criteria

Feature is considered successfully deployed when:

- ✅ Database migration applied without errors
- ✅ Annual prices active in Stripe live mode
- ✅ At least 1 successful annual subscription created
- ✅ Pricing page displaying correctly
- ✅ Checkout flow working for both intervals
- ✅ Upgrade flow working without errors
- ✅ Webhooks processing at >99% success rate
- ✅ No increase in error rates
- ✅ Existing monthly subscriptions unaffected
- ✅ Zero customer complaints about broken functionality

---

## Emergency Contacts

**During Deployment:**
- Technical Lead: [Name]
- Database Admin: [Name]
- DevOps: [Name]
- On-Call: [Rotation]

**Stripe Support:**
- Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com

**Supabase Support:**
- Dashboard: https://app.supabase.com
- Support: https://supabase.com/support

---

## Deployment Sign-Off

**Pre-Deployment Review:**
- [ ] Code reviewed by: _______________
- [ ] Database migration reviewed by: _______________
- [ ] Stripe configuration verified by: _______________
- [ ] Deployment plan approved by: _______________

**Post-Deployment Verification:**
- [ ] Deployment completed by: _______________
- [ ] Verification tests passed: _______________
- [ ] Monitoring established: _______________
- [ ] Sign-off: _______________ (Date/Time)

---

## Notes

**Deployment Window:** Recommend off-peak hours (evening/weekend)

**Estimated Duration:** 1-2 hours including verification

**Risk Level:** Low-Medium
- Low risk for existing monthly subscriptions (backwards compatible)
- Medium risk for new annual subscriptions (new feature path)

**Dependencies:**
- Stripe API availability
- Supabase database availability
- Deployment platform availability

---

**Last Updated:** February 9, 2026
**Document Version:** 1.0
