-- Migration: Add Revision Credits System
-- Description: Implements subscription-based revision credits for video quality issues
--              Users can request revision credits for videos with technical problems
--              Admin approval required, credits allocated monthly by plan tier

-- ============================================================================
-- 1. Add revision credit columns to subscriptions table
-- ============================================================================

ALTER TABLE public.subscriptions
ADD COLUMN revision_credits_total INT NOT NULL DEFAULT 0,
ADD COLUMN revision_credits_remaining INT NOT NULL DEFAULT 0,
ADD CONSTRAINT revision_credits_total_check CHECK (revision_credits_total >= 0),
ADD CONSTRAINT revision_credits_remaining_check CHECK (
  revision_credits_remaining >= 0 AND
  revision_credits_remaining <= revision_credits_total
);

COMMENT ON COLUMN public.subscriptions.revision_credits_total IS
'Monthly allocation of revision credits based on plan tier (Starter=1, Professional=3). Reset on renewal.';

COMMENT ON COLUMN public.subscriptions.revision_credits_remaining IS
'Current available revision credits for this billing period. Decremented when admin approves requests.';

-- ============================================================================
-- 2. Add admin role to profiles table (MUST BE BEFORE RLS POLICIES)
-- ============================================================================

-- Add role column if not exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

COMMENT ON COLUMN public.profiles.role IS
'User role: user (default) or admin (can manage revision requests)';

-- ============================================================================
-- 3. Create revision requests table
-- ============================================================================

CREATE TABLE public.revision_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate requests for same video
  UNIQUE(video_id)
);

CREATE INDEX idx_revision_requests_user_id ON public.revision_requests(user_id);
CREATE INDEX idx_revision_requests_status ON public.revision_requests(status);
CREATE INDEX idx_revision_requests_requested_at ON public.revision_requests(requested_at DESC);

COMMENT ON TABLE public.revision_requests IS
'User requests for revision credits due to video quality issues. Requires admin approval.';

-- ============================================================================
-- 4. Enable RLS on revision_requests table
-- ============================================================================

ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view own revision requests"
  ON public.revision_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create revision requests for their own videos
CREATE POLICY "Users can create revision requests"
  ON public.revision_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.videos v
      WHERE v.id = video_id AND v.user_id = auth.uid()
    )
  );

-- Only admins can update requests (approve/deny)
CREATE POLICY "Admins can update revision requests"
  ON public.revision_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can view all requests
CREATE POLICY "Admins can view all revision requests"
  ON public.revision_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================================================
-- 5. Update credit transaction types to include revision_grant
-- ============================================================================

ALTER TABLE public.credit_transactions
DROP CONSTRAINT IF EXISTS credit_transactions_type_check;

ALTER TABLE public.credit_transactions
ADD CONSTRAINT credit_transactions_type_check
CHECK (type IN ('subscription', 'purchase', 'usage', 'refund', 'bonus', 'expiry', 'revision_grant'));

COMMENT ON CONSTRAINT credit_transactions_type_check ON public.credit_transactions IS
'Transaction types: subscription (plan credits), purchase (overage), usage (video creation), refund (automatic refund), bonus (manual grant), expiry (credit expiration), revision_grant (admin-approved revision credit)';

-- ============================================================================
-- 6. Update check_credits() function to include revision credits
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_credits(p_user_id UUID, p_required INT DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_credits INT;
BEGIN
  SELECT
    COALESCE(revision_credits_remaining, 0) +
    COALESCE(credits_remaining, 0) +
    COALESCE(overage_credits, 0)
  INTO v_total_credits
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(v_total_credits, 0) >= p_required;
END;
$$;

COMMENT ON FUNCTION public.check_credits IS
'Check if user has enough credits (revision + subscription + overage) for video creation';

-- ============================================================================
-- 7. Update deduct_credits() function to use revision credits first
-- ============================================================================

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_video_id UUID,
  p_credits INT DEFAULT 1,
  p_description TEXT DEFAULT 'Video creation'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_revision_credits INT;
  v_overage_credits INT;
  v_credits_remaining INT;
  v_from_revision INT := 0;
  v_from_overage INT := 0;
  v_from_subscription INT := 0;
  v_remaining_to_deduct INT;
BEGIN
  -- Get active subscription with all credit types
  SELECT id, revision_credits_remaining, overage_credits, credits_remaining
  INTO v_subscription_id, v_revision_credits, v_overage_credits, v_credits_remaining
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_subscription_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check total credits available
  IF (v_revision_credits + v_overage_credits + v_credits_remaining) < p_credits THEN
    RETURN FALSE;
  END IF;

  -- Priority 1: Revision credits first
  v_remaining_to_deduct := p_credits;

  IF v_revision_credits > 0 THEN
    v_from_revision := LEAST(v_revision_credits, v_remaining_to_deduct);
    v_remaining_to_deduct := v_remaining_to_deduct - v_from_revision;
  END IF;

  -- Priority 2: Overage credits
  IF v_remaining_to_deduct > 0 AND v_overage_credits > 0 THEN
    v_from_overage := LEAST(v_overage_credits, v_remaining_to_deduct);
    v_remaining_to_deduct := v_remaining_to_deduct - v_from_overage;
  END IF;

  -- Priority 3: Subscription credits
  IF v_remaining_to_deduct > 0 THEN
    v_from_subscription := v_remaining_to_deduct;
  END IF;

  -- Update all credit types
  UPDATE public.subscriptions
  SET revision_credits_remaining = revision_credits_remaining - v_from_revision,
      overage_credits = overage_credits - v_from_overage,
      credits_remaining = credits_remaining - v_from_subscription
  WHERE id = v_subscription_id;

  -- Record transaction with source info
  INSERT INTO public.credit_transactions (user_id, subscription_id, video_id, amount, type, description)
  VALUES (
    p_user_id,
    v_subscription_id,
    p_video_id,
    -p_credits,
    'usage',
    CASE
      WHEN v_from_revision > 0 THEN p_description || ' (revision credit)'
      WHEN v_from_overage > 0 AND v_from_subscription > 0 THEN
        p_description || ' (' || v_from_overage || ' overage + ' || v_from_subscription || ' subscription)'
      WHEN v_from_overage > 0 THEN p_description || ' (overage)'
      ELSE p_description || ' (subscription)'
    END
  );

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.deduct_credits IS
'Deduct credits for video creation with priority: revision → overage → subscription';

-- ============================================================================
-- 8. Create grant_revision_credit() function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.grant_revision_credit(
  p_request_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_video_id UUID;
  v_subscription_id UUID;
  v_credits_remaining INT;
  v_request_status TEXT;
BEGIN
  -- Get request details and check if already processed
  SELECT user_id, video_id, status
  INTO v_user_id, v_video_id, v_request_status
  FROM public.revision_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_request_status != 'pending' THEN
    RETURN FALSE; -- Already processed
  END IF;

  -- Get user's active subscription
  SELECT id, revision_credits_remaining
  INTO v_subscription_id, v_credits_remaining
  FROM public.subscriptions
  WHERE user_id = v_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_subscription_id IS NULL THEN
    RETURN FALSE; -- No subscription
  END IF;

  -- Grant 1 revision credit (add to remaining, but capped at total)
  UPDATE public.subscriptions
  SET revision_credits_remaining = LEAST(
    revision_credits_remaining + 1,
    revision_credits_total
  )
  WHERE id = v_subscription_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, subscription_id, video_id, amount, type, description)
  VALUES (
    v_user_id,
    v_subscription_id,
    v_video_id,
    1,
    'revision_grant',
    'Admin-approved revision credit for video quality issue'
  );

  -- Update request status
  UPDATE public.revision_requests
  SET status = 'approved',
      reviewed_by = p_admin_id,
      reviewed_at = NOW()
  WHERE id = p_request_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.grant_revision_credit IS
'Grant 1 revision credit to user after admin approval. Capped at monthly allocation.';

-- ============================================================================
-- 9. Create deny_revision_request() function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.deny_revision_request(
  p_request_id UUID,
  p_admin_id UUID,
  p_admin_notes TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_status TEXT;
BEGIN
  SELECT status INTO v_request_status
  FROM public.revision_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_request_status != 'pending' THEN
    RETURN FALSE; -- Already processed
  END IF;

  UPDATE public.revision_requests
  SET status = 'denied',
      admin_notes = p_admin_notes,
      reviewed_by = p_admin_id,
      reviewed_at = NOW()
  WHERE id = p_request_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.deny_revision_request IS
'Deny revision credit request with admin notes';
