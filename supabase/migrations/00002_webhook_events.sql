-- Webhook Events Table
-- Tracks processed Stripe webhook events for idempotency
-- Prevents duplicate processing when Stripe retries webhooks

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  payload JSONB
);

COMMENT ON TABLE public.webhook_events IS 'Tracks processed Stripe webhooks for idempotency';
COMMENT ON COLUMN public.webhook_events.stripe_event_id IS 'Unique Stripe event ID (evt_...)';
COMMENT ON COLUMN public.webhook_events.payload IS 'Original event payload for debugging';

-- Index for quick lookup by Stripe event ID
CREATE INDEX webhook_events_stripe_id_idx ON public.webhook_events(stripe_event_id);

-- Index for cleanup queries (delete old events)
CREATE INDEX webhook_events_processed_at_idx ON public.webhook_events(processed_at);

-- No RLS needed - table is only accessed by service role from webhook handler
-- Users cannot access webhook events

-- Add overage_credits column to subscriptions table
-- Overage credits persist across billing periods (unlike subscription credits)
ALTER TABLE public.subscriptions
ADD COLUMN overage_credits INT NOT NULL DEFAULT 0 CHECK (overage_credits >= 0);

COMMENT ON COLUMN public.subscriptions.overage_credits IS 'Purchased credits that persist across billing periods';

-- Update deduct_credits function to use overage credits first
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
  v_credits_remaining INT;
  v_overage_credits INT;
  v_from_overage INT;
  v_from_subscription INT;
BEGIN
  -- Get active subscription
  SELECT id, credits_remaining, overage_credits
  INTO v_subscription_id, v_credits_remaining, v_overage_credits
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE; -- Lock the row

  IF v_subscription_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check total credits available
  IF (v_credits_remaining + v_overage_credits) < p_credits THEN
    RETURN FALSE;
  END IF;

  -- Deduct from overage first, then subscription
  IF v_overage_credits >= p_credits THEN
    v_from_overage := p_credits;
    v_from_subscription := 0;
  ELSE
    v_from_overage := v_overage_credits;
    v_from_subscription := p_credits - v_overage_credits;
  END IF;

  -- Update credits
  UPDATE public.subscriptions
  SET credits_remaining = credits_remaining - v_from_subscription,
      overage_credits = overage_credits - v_from_overage
  WHERE id = v_subscription_id;

  -- Record transaction with source info
  INSERT INTO public.credit_transactions (user_id, subscription_id, video_id, amount, type, description)
  VALUES (p_user_id, v_subscription_id, p_video_id, -p_credits, 'usage',
    CASE
      WHEN v_from_overage > 0 AND v_from_subscription > 0 THEN
        p_description || ' (' || v_from_overage || ' overage + ' || v_from_subscription || ' subscription)'
      WHEN v_from_overage > 0 THEN
        p_description || ' (overage credits)'
      ELSE
        p_description || ' (subscription credits)'
    END
  );

  RETURN TRUE;
END;
$$;

-- Update check_credits to include overage credits
CREATE OR REPLACE FUNCTION public.check_credits(p_user_id UUID, p_required INT DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_credits INT;
BEGIN
  SELECT COALESCE(credits_remaining, 0) + COALESCE(overage_credits, 0) INTO v_total_credits
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN COALESCE(v_total_credits, 0) >= p_required;
END;
$$;

-- Function to add overage credits (used by webhook for credit pack purchases)
CREATE OR REPLACE FUNCTION public.add_overage_credits(
  p_subscription_id UUID,
  p_credits INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.subscriptions
  SET overage_credits = overage_credits + p_credits
  WHERE id = p_subscription_id;
END;
$$;
