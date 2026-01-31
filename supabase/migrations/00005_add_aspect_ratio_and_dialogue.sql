-- Add aspect_ratio, dialogue, and error_message columns to videos table
-- Part of Phase 4: n8n webhook payload update

-- Drop old quality check constraint (was '720p', '1080p', '4k')
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_quality_check;

-- Add new quality check constraint for tier-based pricing
ALTER TABLE videos
ADD CONSTRAINT videos_quality_check
CHECK (quality IN ('standard', 'premium'));

-- Update existing quality values from resolution to tier names
UPDATE videos
SET quality = CASE
  WHEN quality = '720p' THEN 'standard'
  WHEN quality = '1080p' THEN 'premium'
  WHEN quality = '4k' THEN 'premium'
  ELSE 'standard'
END;

-- Add aspect_ratio column with constraint (only landscape and portrait for Veo 3)
ALTER TABLE videos
ADD COLUMN aspect_ratio TEXT
CHECK (aspect_ratio IN ('landscape', 'portrait'))
DEFAULT 'landscape';

-- Add dialogue column (nullable - stores voiceover text or "no voiceover")
ALTER TABLE videos
ADD COLUMN dialogue TEXT;

-- Add error_message column for n8n workflow error handling
ALTER TABLE videos
ADD COLUMN error_message TEXT;

-- Update existing records to have default aspect_ratio
UPDATE videos
SET aspect_ratio = 'landscape'
WHERE aspect_ratio IS NULL;

-- Add index for analytics and filtering by aspect_ratio
CREATE INDEX idx_videos_aspect_ratio ON videos(aspect_ratio);

-- Add comments for documentation
COMMENT ON COLUMN videos.quality IS 'Quality tier: standard (1 credit) or premium (2 credits) - both are 1080p';
COMMENT ON COLUMN videos.aspect_ratio IS 'Video aspect ratio: landscape (16:9) or portrait (9:16) - limited by Veo 3 API';
COMMENT ON COLUMN videos.dialogue IS 'Voiceover text or "no voiceover" - sent to n8n workflow';
COMMENT ON COLUMN videos.error_message IS 'Error message from n8n workflow if video generation fails';
