-- Add first_name column for email personalization
-- Phase 6: Email Notifications

ALTER TABLE public.profiles
ADD COLUMN first_name text;

COMMENT ON COLUMN public.profiles.first_name IS 'User first name for email personalization';

-- Update handle_new_user trigger to populate first_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'first_name'
  );
  RETURN new;
END;
$$;
