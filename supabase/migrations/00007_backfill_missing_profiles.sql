-- Backfill missing profiles for existing users
-- Phase 6: Email Notifications - Bug Fix
--
-- This migration creates profile records for users who were created
-- before the handle_new_user trigger was set up, or when the trigger
-- failed to execute.

-- Insert missing profiles for auth.users without corresponding profile records
INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
SELECT
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name',
  au.raw_user_meta_data->>'first_name',
  au.raw_user_meta_data->>'last_name'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Log the number of profiles created
DO $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM auth.users au
  LEFT JOIN public.profiles p ON p.id = au.id
  WHERE p.id IS NULL;

  IF v_count > 0 THEN
    RAISE NOTICE 'Backfilled % missing profile(s)', v_count;
  ELSE
    RAISE NOTICE 'No missing profiles found - all users have profiles';
  END IF;
END $$;
