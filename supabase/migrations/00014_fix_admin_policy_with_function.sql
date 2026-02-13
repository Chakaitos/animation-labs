-- Fix Admin RLS Policy Infinite Recursion (Proper Fix)
-- Migration: 00014_fix_admin_policy_with_function.sql
--
-- The previous fix still caused recursion because any query to profiles
-- from within the profiles policy creates a loop. The solution is to use
-- a SECURITY DEFINER function that bypasses RLS.

-- ============================================
-- DROP PREVIOUS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can view all credit_transactions" ON public.credit_transactions;

-- ============================================
-- CREATE SECURITY DEFINER FUNCTION
-- ============================================

-- This function bypasses RLS to check if the current user is an admin
-- SECURITY DEFINER allows it to query profiles without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION public.is_admin IS 'Check if current user is an admin (bypasses RLS to avoid recursion)';

-- ============================================
-- CREATE NON-RECURSIVE ADMIN POLICIES
-- ============================================

-- Profiles: Allow admins to view all profiles using the helper function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Subscriptions: Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin());

-- Videos: Allow admins to view all videos
CREATE POLICY "Admins can view all videos"
  ON public.videos FOR SELECT
  USING (public.is_admin());

-- Credit Transactions: Allow admins to view all transactions
CREATE POLICY "Admins can view all credit_transactions"
  ON public.credit_transactions FOR SELECT
  USING (public.is_admin());

-- ============================================
-- NOTES
-- ============================================
-- The is_admin() function is marked as SECURITY DEFINER which means it
-- executes with the privileges of the user who defined it (the superuser).
-- This allows it to bypass RLS and read the profiles table without
-- triggering the RLS policies, breaking the circular dependency.
--
-- The function is also marked as STABLE, which allows PostgreSQL to
-- cache the result within a single query for better performance.
