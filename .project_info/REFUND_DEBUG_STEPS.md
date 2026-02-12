# Credit Refund Debugging Guide

## Issue
Credits are being deducted but not refunded when videos fail.

## Diagnostic Steps

### Step 1: Check if Migration Was Applied

Run this in **Supabase Dashboard → SQL Editor**:

```sql
-- Check if function exists
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'refund_credits'
  AND routine_schema = 'public';
```

**Expected Result:** One row with `refund_credits`

**If Empty:** ⚠️ Migration not applied! Run:
```bash
cd /Users/chakaitos/AnimateLabs
supabase db push
```

Or manually run the SQL from `supabase/migrations/00009_add_refund_credits.sql` in Supabase Dashboard.

---

### Step 2: Check Failed Videos

```sql
-- Find failed videos without refunds
SELECT
  v.id,
  v.brand_name,
  v.status,
  v.credits_used,
  v.created_at,
  -- Check if refund exists
  EXISTS(
    SELECT 1 FROM credit_transactions ct
    WHERE ct.video_id = v.id AND ct.type = 'refund'
  ) AS has_refund,
  -- Check if deduction exists
  EXISTS(
    SELECT 1 FROM credit_transactions ct
    WHERE ct.video_id = v.id AND ct.type = 'usage'
  ) AS has_deduction
FROM videos v
WHERE v.status = 'failed'
ORDER BY v.created_at DESC;
```

**Expected:**
- `has_deduction` = `true` (credits were taken)
- `has_refund` = `true` (credits were returned)

**If `has_refund` = false:** Refund didn't happen. Continue to Step 3.

---

### Step 3: Check Webhook Logs

**If running locally (`npm run dev`):**
Look at terminal output for:
- ✅ `Video webhook: Credits refunded` (success)
- ❌ `Video webhook: Credit refund failed` (error with details)

**If deployed (Vercel/production):**
Check deployment logs for the webhook route when videos fail.

---

### Step 4: Manual Refund Test

Pick a failed video from Step 2 and manually refund it:

```sql
-- Replace with actual UUIDs from Step 2
SELECT refund_credits(
  'YOUR_USER_ID'::uuid,     -- From videos.user_id
  'FAILED_VIDEO_ID'::uuid,  -- From videos.id
  1,                        -- Credits to refund
  'Manual test refund'
);
```

**Expected Result:** `true`

**Possible Results:**
- `true` = Refund succeeded ✅
- `false` = Refund failed (no subscription found) ❌
- Error = Function doesn't exist (back to Step 1) ❌

---

### Step 5: Check Subscription State

```sql
-- Check your subscription
SELECT
  user_id,
  plan,
  status,
  credits_remaining,
  overage_credits,
  (credits_remaining + overage_credits) AS total_credits
FROM subscriptions
WHERE user_id = 'YOUR_USER_ID'::uuid;
```

**After manual refund in Step 4:**
- `overage_credits` should increase by 1
- `total_credits` should be higher

---

### Step 6: Verify Credit Transactions

```sql
-- Check transactions for the failed video
SELECT
  created_at,
  type,
  amount,
  description
FROM credit_transactions
WHERE video_id = 'FAILED_VIDEO_ID'::uuid
ORDER BY created_at;
```

**Expected:**
1. First row: `type='usage'`, `amount=-1` (deduction)
2. Second row: `type='refund'`, `amount=1` (refund)

**If only usage row exists:** Refund never happened.

---

## Common Issues & Solutions

### Issue 1: Migration Not Applied
**Symptom:** Step 1 returns no rows
**Solution:**
```bash
cd /Users/chakaitos/AnimateLabs
supabase db push
```
Then restart your dev server.

### Issue 2: Webhook Not Called
**Symptom:** No logs in Step 3
**Solution:**
- Check n8n workflow is sending webhooks
- Verify webhook URL is correct
- Check n8n execution logs

### Issue 3: Function Fails Silently
**Symptom:** Manual test in Step 4 returns `false`
**Solution:**
- Check subscription exists (Step 5)
- Verify user_id is correct
- Check for existing refund (already processed)

### Issue 4: Code Not Deployed
**Symptom:** Webhook logs show old behavior
**Solution:**
- Restart dev server: `npm run dev`
- Or redeploy to production

---

## Quick Fix: Manual Refund All Failed Videos

If you need to refund all past failed videos:

```sql
-- Refund all failed videos without refunds
DO $$
DECLARE
  v_video RECORD;
  v_refund_success BOOLEAN;
BEGIN
  FOR v_video IN
    SELECT v.id, v.user_id, v.credits_used, v.brand_name
    FROM videos v
    WHERE v.status = 'failed'
      AND NOT EXISTS(
        SELECT 1 FROM credit_transactions ct
        WHERE ct.video_id = v.id AND ct.type = 'refund'
      )
  LOOP
    SELECT refund_credits(
      v_video.user_id,
      v_video.id,
      v_video.credits_used,
      'Bulk refund: ' || v_video.brand_name
    ) INTO v_refund_success;

    RAISE NOTICE 'Refunded video % (%): %',
      v_video.id,
      v_video.brand_name,
      CASE WHEN v_refund_success THEN 'SUCCESS' ELSE 'FAILED' END;
  END LOOP;
END $$;
```

This will refund ALL failed videos that don't have refunds yet.

---

## Still Not Working?

If refunds still aren't working after these steps:

1. **Verify migration applied:** Run Step 1
2. **Check function works:** Run Step 4 (manual refund)
3. **Check webhook is called:** Look at logs in Step 3
4. **Share results:** Post the output of Steps 1, 2, 5, and 6

The issue is likely:
- Migration not applied (Step 1)
- Webhook not being called by n8n (Step 3)
- Code not deployed (restart dev server)
