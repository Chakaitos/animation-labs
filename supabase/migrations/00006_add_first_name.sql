-- Add first_name and last_name columns for email personalization
-- Phase 6: Email Notifications

ALTER TABLE public.profiles
ADD COLUMN first_name text,
ADD COLUMN last_name text;

COMMENT ON COLUMN public.profiles.first_name IS 'User first name for email personalization';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name';

-- Update handle_new_user trigger to populate first_name and last_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$;
