-- Diagnostic queries for credit refund debugging

-- 1. Check if refund_credits function exists
SELECT
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'refund_credits'
  AND routine_schema = 'public';

-- Expected: Should return one row with routine_name = 'refund_credits'
-- If empty: Migration wasn't applied, run `supabase db push`

-- 2. Check failed videos without refunds
SELECT
  v.id,
  v.brand_name,
  v.status,
  v.credits_used,
  v.error_message,
  v.created_at,
  v.user_id,
  -- Check if refund transaction exists
  EXISTS(
    SELECT 1 FROM credit_transactions ct
    WHERE ct.video_id = v.id AND ct.type = 'refund'
  ) AS has_refund
FROM videos v
WHERE v.status = 'failed'
ORDER BY v.created_at DESC
LIMIT 10;

-- Expected: has_refund should be TRUE for failed videos
-- If FALSE: Refund didn't happen

-- 3. Check all refund transactions
SELECT
  ct.id,
  ct.created_at,
  ct.amount,
  ct.description,
  ct.video_id,
  ct.user_id,
  v.brand_name,
  v.status AS video_status
FROM credit_transactions ct
LEFT JOIN videos v ON v.id = ct.video_id
WHERE ct.type = 'refund'
ORDER BY ct.created_at DESC
LIMIT 20;

-- Expected: Should show refund transactions
-- If empty: No refunds have been processed

-- 4. Check credit transactions for a specific failed video
-- (Replace VIDEO_ID with actual UUID)
SELECT
  ct.created_at,
  ct.type,
  ct.amount,
  ct.description
FROM credit_transactions ct
WHERE ct.video_id = 'VIDEO_ID'
ORDER BY ct.created_at;

-- Expected: Should see 'usage' (negative) and 'refund' (positive)
-- If only 'usage': Refund didn't happen

-- 5. Check subscription credit balances
SELECT
  s.user_id,
  s.plan,
  s.status,
  s.credits_remaining,
  s.overage_credits,
  s.credits_total,
  (s.credits_remaining + s.overage_credits) AS total_available
FROM subscriptions s
ORDER BY s.created_at DESC
LIMIT 5;

-- Check if overage_credits increased after failed video

-- 6. Manual test refund function
-- (Replace USER_ID and VIDEO_ID with actual UUIDs)
SELECT refund_credits(
  'USER_ID'::uuid,
  'VIDEO_ID'::uuid,
  1,
  'Manual test refund'
);

-- Expected: Returns TRUE
-- If FALSE: Check why (no subscription, already refunded, etc.)
