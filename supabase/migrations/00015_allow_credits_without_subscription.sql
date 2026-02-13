-- Allow Admin Credit Grants Without Subscription
-- Migration: 00015_allow_credits_without_subscription.sql
--
-- Updates admin_adjust_credits to automatically create a trial subscription
-- when granting credits to users who don't have an active subscription.
-- Useful for beta testing and giving trial credits.

-- Add 'trial' plan type to subscriptions check constraint
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_check
CHECK (plan IN ('starter', 'professional', 'trial'));

COMMENT ON COLUMN public.subscriptions.plan IS 'Subscription tier: starter, professional, or trial (admin-granted)';

-- Update admin_adjust_credits function to create trial subscription if needed
CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  p_admin_id uuid,
  p_user_id uuid,
  p_credits int,
  p_description text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_subscription_id uuid;
  v_admin_email text;
BEGIN
  -- Verify caller is admin
  SELECT role = 'admin', email INTO v_is_admin, v_admin_email
  FROM public.profiles
  WHERE id = p_admin_id;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Validate credit amount (prevent extreme adjustments)
  IF p_credits < -1000 OR p_credits > 1000 THEN
    RAISE EXCEPTION 'Credit adjustment must be between -1000 and 1000';
  END IF;

  IF p_credits = 0 THEN
    RAISE EXCEPTION 'Credit adjustment cannot be zero';
  END IF;

  -- Get user's active subscription
  SELECT id INTO v_subscription_id
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no active subscription exists and we're adding credits, create a trial subscription
  IF v_subscription_id IS NULL AND p_credits > 0 THEN
    INSERT INTO public.subscriptions (
      user_id,
      plan,
      status,
      credits_remaining,
      credits_total,
      current_period_start,
      current_period_end
    )
    VALUES (
      p_user_id,
      'trial',
      'active',
      0, -- Will be updated below
      0,
      now(),
      now() + interval '30 days' -- 30-day trial period
    )
    RETURNING id INTO v_subscription_id;

    -- Log the trial subscription creation
    INSERT INTO public.credit_transactions (
      user_id,
      subscription_id,
      amount,
      type,
      description
    )
    VALUES (
      p_user_id,
      v_subscription_id,
      0,
      'subscription',
      'Trial subscription created by admin: ' || v_admin_email
    );
  ELSIF v_subscription_id IS NULL THEN
    -- Can't deduct credits if no subscription exists
    RAISE EXCEPTION 'No active subscription found for user. Cannot deduct credits from a user without a subscription.';
  END IF;

  -- Adjust credits (ensure non-negative for deductions)
  IF p_credits < 0 THEN
    -- Deducting credits - make sure they have enough
    UPDATE public.subscriptions
    SET
      credits_remaining = GREATEST(0, credits_remaining + p_credits),
      updated_at = now()
    WHERE id = v_subscription_id;
  ELSE
    -- Adding credits
    UPDATE public.subscriptions
    SET
      credits_remaining = credits_remaining + p_credits,
      credits_total = credits_total + p_credits,
      updated_at = now()
    WHERE id = v_subscription_id;
  END IF;

  -- Log transaction with admin details
  INSERT INTO public.credit_transactions (
    user_id,
    subscription_id,
    amount,
    type,
    description
  )
  VALUES (
    p_user_id,
    v_subscription_id,
    p_credits,
    CASE WHEN p_credits > 0 THEN 'bonus' ELSE 'refund' END,
    p_description || ' (Admin: ' || v_admin_email || ')'
  );

  RETURN true;
END;
$$;

COMMENT ON FUNCTION public.admin_adjust_credits IS 'Allows admins to manually adjust user credits. Creates trial subscription if none exists when adding credits.';
