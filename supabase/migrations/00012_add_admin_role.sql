-- Animation Labs Admin Role
-- Migration: 00012_add_admin_role.sql
--
-- This migration adds admin role support to enable secure admin panel access:
-- - Add role column to profiles table
-- - Create RLS policies for admin access to all tables
-- - Create admin_adjust_credits() function for manual credit adjustments
--
-- Security Model:
-- - Role is stored in profiles table, not hardcoded in application
-- - All admin operations verified via RLS policies
-- - Credit adjustments logged with admin ID for audit trail

-- ============================================
-- ADD ROLE COLUMN TO PROFILES
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN role text DEFAULT 'user' NOT NULL
CHECK (role IN ('user', 'admin'));

COMMENT ON COLUMN public.profiles.role IS 'User role: user (default) or admin';

-- Create index for efficient role-based queries
CREATE INDEX profiles_role_idx ON public.profiles(role);

-- ============================================
-- RLS POLICIES FOR ADMIN ACCESS
-- ============================================

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can view all videos
CREATE POLICY "Admins can view all videos"
  ON public.videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can view all credit transactions
CREATE POLICY "Admins can view all credit_transactions"
  ON public.credit_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ============================================
-- ADMIN CREDIT ADJUSTMENT FUNCTION
-- ============================================

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

  IF v_subscription_id IS NULL THEN
    RAISE EXCEPTION 'No active subscription found for user';
  END IF;

  -- Adjust credits (ensure non-negative)
  UPDATE public.subscriptions
  SET
    credits_remaining = GREATEST(0, credits_remaining + p_credits),
    updated_at = now()
  WHERE id = v_subscription_id;

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

COMMENT ON FUNCTION public.admin_adjust_credits IS 'Allows admins to manually adjust user credits with audit logging';

-- ============================================
-- GRANT INITIAL ADMIN ACCESS
-- ============================================
-- NOTE: Replace 'your-email@example.com' with actual admin email before applying migration
-- You can also run this manually after migration:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Uncomment and update with your email:
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE email = 'your-email@example.com';
