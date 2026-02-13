-- Fix Admin RLS Policy Infinite Recursion
-- Migration: 00013_fix_admin_policy_recursion.sql
--
-- The admin policies created in 00012 cause infinite recursion because
-- the profiles policy checks itself. This migration fixes it by using
-- a simpler approach that doesn't create circular dependencies.

-- ============================================
-- DROP PROBLEMATIC POLICIES
-- ============================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all videos" ON public.videos;
DROP POLICY IF EXISTS "Admins can view all credit_transactions" ON public.credit_transactions;

-- ============================================
-- CREATE NON-RECURSIVE ADMIN POLICIES
-- ============================================

-- Profiles: Allow viewing all profiles if caller has admin role
-- We check the role directly from the current user without a subquery
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Subscriptions: Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Videos: Allow admins to view all videos
CREATE POLICY "Admins can view all videos"
  ON public.videos FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Credit Transactions: Allow admins to view all transactions
CREATE POLICY "Admins can view all credit_transactions"
  ON public.credit_transactions FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- NOTES
-- ============================================
-- These policies use direct scalar subqueries instead of EXISTS checks
-- to avoid infinite recursion. The profiles policy no longer checks itself,
-- breaking the circular dependency.
--
-- These policies work in conjunction with existing user policies (OR logic):
-- - Users can view their own data (existing policies)
-- - Admins can view all data (these new policies)
