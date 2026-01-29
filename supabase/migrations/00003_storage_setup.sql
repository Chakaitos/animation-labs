-- Storage Setup for Logo Uploads
-- Phase 4: Core Video Creation
--
-- This migration:
-- 1. Creates RLS policies for the 'logos' storage bucket
-- 2. Adds index on videos table for efficient dashboard queries
--
-- NOTE: The 'logos' bucket must be created manually in Supabase Dashboard
-- Go to Storage -> New bucket -> Name: "logos", Public: checked

-- ============================================
-- STORAGE RLS POLICIES
-- ============================================
-- Bucket 'logos' stores user-uploaded logo files
-- Path format: {user_id}/{file_uuid}.{extension}
-- Users can only access files in their own folder

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload logos to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own logos
CREATE POLICY "Users can read own logos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own logos
CREATE POLICY "Users can delete own logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to logos bucket (for n8n to fetch)
-- This is safe because:
-- 1. File paths use UUIDs (not guessable)
-- 2. Files are only accessible if you know the exact path
-- 3. n8n needs to download logos without auth
CREATE POLICY "Public read access to logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');

-- ============================================
-- VIDEOS TABLE OPTIMIZATION
-- ============================================
-- Add index for faster lookups by status (used in dashboard queries)
-- Note: n8n_execution_id already exists in videos table for idempotency

CREATE INDEX IF NOT EXISTS videos_user_status_idx
ON public.videos(user_id, status);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON POLICY "Users can upload logos to own folder" ON storage.objects IS
'Authenticated users can upload files to logos/{their_user_id}/ folder';

COMMENT ON POLICY "Users can read own logos" ON storage.objects IS
'Authenticated users can read files from their own folder in logos bucket';

COMMENT ON POLICY "Users can delete own logos" ON storage.objects IS
'Authenticated users can delete files from their own folder in logos bucket';

COMMENT ON POLICY "Public read access to logos" ON storage.objects IS
'Public read access allows n8n workflow to download logos for video generation';
