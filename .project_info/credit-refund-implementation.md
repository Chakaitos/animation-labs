# Credit Refund Implementation

## Problem

When video creation failed, users lost credits without receiving a usable video. This created a poor user experience and financial loss for users.

## Solution

Implemented automatic credit refunds when videos fail processing.

## How It Works

### Flow Diagram

```
Video Creation → Credits Deducted → n8n Processing
                                           ↓
                                    [Success/Failure]
                                           ↓
                            ┌──────────────┴──────────────┐
                            ↓                             ↓
                    status: 'completed'          status: 'failed'
                            ↓                             ↓
                    Send Email                    Refund Credits
                    No Refund                     Add to overage_credits
                                                  Log refund transaction
```

### Components

1. **Database Function** (`refund_credits`)
   - Location: `supabase/migrations/00009_add_refund_credits.sql`
   - Takes: `user_id`, `video_id`, `credits`, `description`
   - Returns: `boolean` (success/failure)
   - Features:
     - **Idempotent**: Checks if credits already refunded before processing
     - **Persistent**: Adds to `overage_credits` (survives billing period resets)
     - **Audit trail**: Creates refund transaction record in `credit_transactions`
     - **Thread-safe**: Uses `FOR UPDATE` to lock subscription row

2. **Webhook Handler** (`app/api/webhooks/video-status/route.ts`)
   - When status is `'failed'`:
     - Fetches `credits_used` from video record
     - Calls `refund_credits()` RPC function
     - Logs success/failure for debugging
   - When status is `'completed'`:
     - No refund (keeps existing email notification logic)

## Database Changes

### New Function: `refund_credits()`

```sql
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id UUID,
  p_video_id UUID,
  p_credits INT,
  p_description TEXT DEFAULT 'Video creation failed - refund'
)
RETURNS BOOLEAN
```

**Key Features:**

- **Idempotency**: Checks `credit_transactions` for existing refund before processing
- **Adds to overage_credits**: Refunded credits persist across billing periods
- **Transaction logging**: Creates audit trail in `credit_transactions` table with type='refund'
- **Row locking**: Uses `FOR UPDATE` to prevent race conditions

### Transaction Types

The `credit_transactions` table now includes:
- `'usage'` - Credits deducted for video creation
- `'refund'` - Credits returned for failed videos ✨ NEW
- `'subscription'` - Credits granted from plan renewal
- `'purchase'` - Credits from credit pack purchase
- `'bonus'` - Promotional credits
- `'expiry'` - Credits expired/removed

## Testing

### Manual Test

1. **Apply the migration:**
   ```bash
   supabase db push
   ```

2. **Create a video and make it fail:**
   ```sql
   -- Simulate a failed video
   UPDATE videos
   SET status = 'failed',
       error_message = 'Test failure'
   WHERE status = 'processing'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

3. **Verify credits were refunded:**
   ```sql
   -- Check overage_credits increased
   SELECT user_id, overage_credits, credits_remaining
   FROM subscriptions
   WHERE user_id = 'YOUR_USER_ID';

   -- Check refund transaction was created
   SELECT * FROM credit_transactions
   WHERE video_id = 'YOUR_VIDEO_ID'
     AND type = 'refund';
   ```

### Test via n8n Webhook

1. Trigger n8n webhook with failed status:
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/video-status \
     -H "Content-Type: application/json" \
     -H "x-webhook-secret: YOUR_SECRET" \
     -d '{
       "videoId": "VIDEO_UUID",
       "status": "failed",
       "errorMessage": "Test error: Rendering failed"
     }'
   ```

2. Check server logs for refund confirmation:
   ```
   Video webhook: Credits refunded {
     videoId: '...',
     userId: '...',
     credits: 1
   }
   ```

## Edge Cases Handled

### ✅ Double Refund Prevention (Idempotency)
- If webhook fires twice, only one refund is processed
- Checks for existing refund transaction before processing
- Returns `TRUE` if already refunded (successful no-op)

### ✅ Correct Credit Amount
- Fetches `credits_used` from video record (handles premium = 2 credits)
- Refunds exact amount that was deducted

### ✅ Persistent Credits
- Adds to `overage_credits` instead of `credits_remaining`
- Refunded credits survive billing period resets
- User can use refunded credits in future periods

### ✅ No Active Subscription
- If user cancels subscription before video fails, refund still works
- Function finds most recent subscription (active or not)
- Credits added to that subscription's overage balance

### ✅ Webhook Failure Doesn't Block Status Update
- Video status is updated first
- Refund failure is logged but doesn't fail webhook
- User can contact support if refund fails (audit trail exists)

## User Experience

### Before Fix ❌
1. User creates video → 1 credit deducted
2. Video fails processing
3. User sees "Failed" status
4. **Credit is lost** → User frustrated

### After Fix ✅
1. User creates video → 1 credit deducted
2. Video fails processing
3. User sees "Failed" status via real-time update
4. **Credit automatically refunded** → Added to overage_credits
5. User can create another video immediately

## Monitoring

### Check Refund Activity

```sql
-- View all refunds in last 7 days
SELECT
  ct.created_at,
  v.brand_name,
  v.error_message,
  ct.amount AS credits_refunded,
  ct.description
FROM credit_transactions ct
JOIN videos v ON v.id = ct.video_id
WHERE ct.type = 'refund'
  AND ct.created_at > NOW() - INTERVAL '7 days'
ORDER BY ct.created_at DESC;
```

### Check Refund Rate

```sql
-- Calculate failure/refund rate
SELECT
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_videos,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_videos,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') /
    NULLIF(COUNT(*), 0), 2) AS failure_rate_percent
FROM videos
WHERE created_at > NOW() - INTERVAL '7 days';
```

## Deployment Steps

### 1. Apply Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard → SQL Editor
-- Run the contents of 00009_add_refund_credits.sql
```

### 2. Verify Function Created

```sql
-- Check function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'refund_credits'
  AND routine_schema = 'public';
```

### 3. Deploy Code Changes

- Deploy updated `app/api/webhooks/video-status/route.ts` to production
- No environment variables needed
- No breaking changes

### 4. Test in Production

- Create a test video
- Manually fail it via SQL (or wait for n8n failure)
- Verify refund in database

## Security Considerations

### ✅ Function Security
- `SECURITY DEFINER` - Runs with elevated privileges (can update any user's credits)
- Only callable by service role (webhook uses service role key)
- Not exposed to client (RLS doesn't apply to functions)

### ✅ Idempotency Protection
- Prevents malicious repeated refund requests
- Uses database transaction to check + insert atomically

### ✅ Audit Trail
- All refunds logged in `credit_transactions` table
- Includes video_id, user_id, timestamp, description
- Immutable record for financial reconciliation

## Future Enhancements

1. **User Notification**
   - Send email when credits are refunded
   - Toast notification in UI (via realtime)

2. **Partial Refunds**
   - If video partially completes (e.g., 50% rendered)
   - Refund partial credits based on completion percentage

3. **Refund Dashboard**
   - Admin view to see all refunds
   - Flag suspicious refund patterns
   - Manual refund approval for high-value refunds

4. **Retry with Refund**
   - Automatically retry failed videos
   - Keep credits in "pending refund" state
   - Only refund if retry also fails

## Related Files

- `/supabase/migrations/00009_add_refund_credits.sql` - Database function
- `/app/api/webhooks/video-status/route.ts` - Webhook handler (lines 193-229)
- `/lib/actions/video.ts` - Video creation with credit deduction (lines 143-156)
- `/supabase/migrations/00002_webhook_events.sql` - Original deduct_credits function

## Support & Troubleshooting

### Credits Not Refunded

1. **Check video status:**
   ```sql
   SELECT id, status, credits_used, error_message
   FROM videos WHERE id = 'VIDEO_ID';
   ```

2. **Check refund transaction:**
   ```sql
   SELECT * FROM credit_transactions
   WHERE video_id = 'VIDEO_ID' AND type = 'refund';
   ```

3. **Check webhook logs:**
   - Look for "Credits refunded" or "Credit refund failed" in server logs

4. **Manual refund (if needed):**
   ```sql
   SELECT refund_credits(
     'USER_ID'::uuid,
     'VIDEO_ID'::uuid,
     1, -- or 2 for premium
     'Manual refund - ticket #123'
   );
   ```

### Refund Function Not Found

- Ensure migration was applied: `supabase db push`
- Check migration status: `SELECT * FROM supabase_migrations.schema_migrations;`
