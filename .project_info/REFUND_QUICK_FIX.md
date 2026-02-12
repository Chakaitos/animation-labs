# Quick Fix: Credit Refunds Not Working

## Immediate Steps

### 1. Apply the Migration (Most Likely Issue)

The refund function needs to be created in your database:

```bash
cd /Users/chakaitos/AnimateLabs
supabase db push
```

**Or** manually in Supabase Dashboard → SQL Editor, run:
```sql
-- Copy entire contents of:
-- supabase/migrations/00009_add_refund_credits.sql
```

### 2. Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

The updated webhook code with better logging is now in place.

### 3. Test It

**Option A: Manually fail a video**
```sql
-- In Supabase Dashboard → SQL Editor
UPDATE videos
SET status = 'failed',
    error_message = 'Test refund'
WHERE status = 'processing'
ORDER BY created_at DESC
LIMIT 1;
```

**Option B: Wait for n8n to fail naturally**

### 4. Check Logs

Look at your terminal (where `npm run dev` is running) for:
- ✅ `Video webhook: ✅ Credits successfully refunded`
- ❌ `Video webhook: Credit refund failed` (with error details)

### 5. Verify Refund Worked

In Supabase Dashboard → SQL Editor:
```sql
-- Check your overage credits increased
SELECT overage_credits, credits_remaining
FROM subscriptions
WHERE user_id = 'YOUR_USER_ID';

-- Check refund transaction exists
SELECT * FROM credit_transactions
WHERE type = 'refund'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Refund Past Failed Videos

If you have failed videos that never got refunded, run this in Supabase:

```sql
-- Bulk refund all failed videos
DO $$
DECLARE
  v_video RECORD;
  v_success BOOLEAN;
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
      'Retroactive refund: ' || v_video.brand_name
    ) INTO v_success;

    RAISE NOTICE 'Video %: %',
      v_video.brand_name,
      CASE WHEN v_success THEN 'REFUNDED ✅' ELSE 'FAILED ❌' END;
  END LOOP;
END $$;
```

This will refund all your past failed videos.

---

## What Changed

I updated the webhook with enhanced logging to make debugging easier:
- Logs when refund starts
- Logs when RPC is called
- Logs detailed error information
- Logs success confirmation

You should now see clear messages in your terminal about what's happening with refunds.

---

## Still Not Working?

Run the full diagnostic: `.project_info/REFUND_DEBUG_STEPS.md`
