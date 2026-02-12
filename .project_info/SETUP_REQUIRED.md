# ⚠️ Setup Required - Database Migrations

Two new database migrations need to be applied:

## 1. Realtime for Video Status Updates
**Migration:** `00008_enable_realtime_videos.sql`
**Purpose:** Enables real-time updates when video status changes

## 2. Credit Refund for Failed Videos
**Migration:** `00009_add_refund_credits.sql`
**Purpose:** Automatically refunds credits when videos fail processing

---

## Apply Both Migrations

### Option A: Supabase CLI (Recommended)
```bash
cd /Users/chakaitos/AnimateLabs
supabase db push
```

### Option B: Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Run migration 1:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE videos;
COMMENT ON TABLE public.videos IS 'Logo animation videos created by users. Realtime enabled for status updates.';
```

3. Run migration 2:
```sql
-- (Copy entire contents of supabase/migrations/00009_add_refund_credits.sql)
```

---

## Verify Setup

### Check Realtime is Enabled
1. Go to Supabase Dashboard → Database → Replication
2. Verify `videos` table is in the publication list

### Check Refund Function Exists
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name = 'refund_credits' AND routine_schema = 'public';
```
Should return: `refund_credits`

---

## Test the Features

### Test 1: Real-time Updates
1. Start dev server: `npm run dev`
2. Open dashboard in browser
3. In Supabase Dashboard, manually update a video status:
   ```sql
   UPDATE videos SET status = 'completed' WHERE status = 'processing' LIMIT 1;
   ```
4. Watch the dashboard - status should update automatically with a toast notification

### Test 2: Credit Refunds
1. Create a video (1 credit deducted)
2. Note your credit balance
3. In Supabase Dashboard, fail the video:
   ```sql
   UPDATE videos SET status = 'failed', error_message = 'Test failure'
   WHERE status = 'processing' ORDER BY created_at DESC LIMIT 1;
   ```
4. Check your credit balance - 1 credit should be refunded (added to overage_credits)
5. Verify refund transaction:
   ```sql
   SELECT * FROM credit_transactions WHERE type = 'refund' ORDER BY created_at DESC LIMIT 1;
   ```

---

## What You Get

✅ **Real-time Updates:** Video status changes appear instantly without refresh
✅ **Toast Notifications:** "Video Ready!" or "Video Failed" alerts
✅ **Automatic Refunds:** Credits returned when videos fail
✅ **Persistent Refunds:** Refunded credits added to overage (survive billing resets)
✅ **Audit Trail:** All refunds logged in credit_transactions table

---

## Documentation

- Full realtime docs: `REALTIME_IMPLEMENTATION.md`
- Credit refund docs: `.project_info/credit-refund-implementation.md`
