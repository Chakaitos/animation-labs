-- Add refund_credits function for failed videos
-- This function refunds credits when a video fails processing

-- Refund credits back to user (adds to overage_credits so they persist)
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_user_id UUID,
  p_video_id UUID,
  p_credits INT,
  p_description TEXT DEFAULT 'Video creation failed - refund'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_id UUID;
  v_already_refunded BOOLEAN;
BEGIN
  -- Check if credits were already refunded for this video
  SELECT EXISTS(
    SELECT 1 FROM public.credit_transactions
    WHERE video_id = p_video_id
      AND type = 'refund'
  ) INTO v_already_refunded;

  IF v_already_refunded THEN
    -- Already refunded, return success (idempotent)
    RETURN TRUE;
  END IF;

  -- Get active subscription (or most recent if none active)
  SELECT id INTO v_subscription_id
  FROM public.subscriptions
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE; -- Lock the row

  IF v_subscription_id IS NULL THEN
    -- No subscription found, can't refund
    RETURN FALSE;
  END IF;

  -- Add credits to overage_credits (these persist across billing periods)
  UPDATE public.subscriptions
  SET overage_credits = overage_credits + p_credits
  WHERE id = v_subscription_id;

  -- Record refund transaction
  INSERT INTO public.credit_transactions (user_id, subscription_id, video_id, amount, type, description)
  VALUES (p_user_id, v_subscription_id, p_video_id, p_credits, 'refund', p_description);

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION public.refund_credits IS 'Refunds credits for failed videos. Idempotent - checks for existing refund before processing.';
